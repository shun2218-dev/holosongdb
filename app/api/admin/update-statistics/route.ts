import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createYouTubeAPI } from "@/lib/youtube-api"
import { SongType } from "@prisma/client"
import {
  invalidateSongsCache,
  invalidateSongPage,
  invalidateTalentsCache,
  invalidateTalentPage,
} from "@/lib/cache-utils"
import { NotificationService } from "@/lib/notification-service"

export async function GET(request: NextRequest) {
  try {
    // Cron job authentication
    const authHeader = request.headers.get("authorization")
    const cronSecret = request.headers.get("x-vercel-cron-signature") || request.nextUrl.searchParams.get("cron_secret")

    if (cronSecret !== process.env.CRON_SECRET && !authHeader?.startsWith("Bearer")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get songType from query parameters
    const songType = request.nextUrl.searchParams.get("songType") || "all"

    if (songType === "all") {
      // Update original songs first
      const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

      const originalResponse = await fetch(`${baseUrl}/api/admin/update-statistics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "vercel-cron",
        },
        body: JSON.stringify({ songType: "original" }),
      })

      const originalResult = await originalResponse.json()

      // Wait a bit between updates to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update cover songs
      const coverResponse = await fetch(`${baseUrl}/api/admin/update-statistics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "vercel-cron",
        },
        body: JSON.stringify({ songType: "cover" }),
      })

      const coverResult = await coverResponse.json()

      return NextResponse.json({
        success: originalResponse.ok && coverResponse.ok,
        message: "Cron job completed for all songs",
        results: {
          original: originalResult,
          cover: coverResult,
        },
      })
    }

    // Call the POST endpoint internally for specific song types
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/admin/update-statistics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "vercel-cron",
      },
      body: JSON.stringify({ songType }),
    })

    const result = await response.json()

    return NextResponse.json({
      success: response.ok,
      message: `Cron job completed for ${songType} songs`,
      result,
    })
  } catch (error) {
    console.error(`[v0] Statistics cron job failed:`, error)
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { songType, force = false } = await request.json()

    // Validate song type
    if (!["original", "cover", "all"].includes(songType)) {
      return NextResponse.json({ error: 'Invalid song type. Must be "original", "cover", or "all"' }, { status: 400 })
    }

    const whereClause: any = {
      AND: [
        {
          videoUrl: {
            not: null,
          },
        },
        {
          videoUrl: {
            not: "",
          },
        },
      ],
    }

    if (songType === "original") {
      whereClause.type = SongType.ORIGINAL
    } else if (songType === "cover") {
      whereClause.type = SongType.COVER
    }

    // Fetch songs with video URLs using Prisma
    const songs = await prisma.song.findMany({
      where: whereClause,
      select: {
        id: true,
        videoUrl: true,
        type: true,
        title: true,
        talents: {
          select: {
            talentId: true,
          },
        },
      },
      orderBy: {
        updatedAt: "asc",
      },
    })

    if (songs.length === 0) {
      return NextResponse.json({
        message: "No songs found to update",
        updated: 0,
      })
    }

    // Create YouTube API instance
    const youtubeAPI = createYouTubeAPI()

    // Extract video IDs from URLs
    const videoData: Array<{ songId: string; videoId: string; talentIds: string[] }> = []
    for (const song of songs) {
      if (song.videoUrl) {
        const videoId = youtubeAPI.extractVideoId(song.videoUrl)
        if (videoId) {
          // Save talent IDs
          videoData.push({
            songId: song.id,
            videoId,
            talentIds: song.talents.map((t) => t.talentId),
          })
        }
      }
    }

    if (videoData.length === 0) {
      return NextResponse.json({
        message: "No valid video URLs found",
        updated: 0,
      })
    }

    try {
      // Get statistics in chunks
      const videoIds = videoData.map((v) => v.videoId)
      const statisticsMap = await youtubeAPI.getVideoStatisticsInChunks(videoIds, 50)

      let updatedCount = 0
      const allNotifications: any[] = []
      // Track updated talent IDs
      const updatedTalentIds = new Set<string>()

      for (const { songId, videoId, talentIds } of videoData) {
        const stats = statisticsMap.get(videoId)
        if (stats) {
          try {
            const viewCount = stats.viewCount ? BigInt(stats.viewCount) : BigInt(0)
            const likeCount = stats.likeCount ? BigInt(stats.likeCount) : BigInt(0)
            const commentCount = stats.commentCount ? BigInt(stats.commentCount) : BigInt(0)

            await NotificationService.saveSongStatistics(songId, viewCount, likeCount, commentCount)

            const milestoneNotifications = await NotificationService.checkSongMilestones(songId, viewCount)
            const surgeNotifications = await NotificationService.checkSongSurge(songId, viewCount)

            allNotifications.push(...milestoneNotifications, ...surgeNotifications)

            await prisma.song.update({
              where: { id: songId },
              data: {
                viewCount,
                likeCount,
                commentCount,
                updatedAt: new Date(),
              },
            })

            await invalidateSongPage(songId)
            // Add related talent IDs
            talentIds.forEach((id) => updatedTalentIds.add(id))
            updatedCount++
          } catch (error) {
            console.error(`[v0] Failed to update song ${songId}:`, error)
          }
        }
      }

      for (const notification of allNotifications) {
        await NotificationService.sendPushNotification(notification)
      }

      // Invalidate cache after updating songs
      if (updatedCount > 0) {
        await invalidateSongsCache()
        // Invalidate talent-related caches
        await invalidateTalentsCache()
        // Invalidate talent pages for updated talents
        for (const talentId of updatedTalentIds) {
          await invalidateTalentPage(talentId)
        }
      }

      return NextResponse.json({
        message: `Successfully updated statistics for ${updatedCount} songs`,
        updated: updatedCount,
        total: songs.length,
        notifications: allNotifications.length,
        // Return number of updated talents
        updatedTalents: updatedTalentIds.size,
      })
    } catch (youtubeError) {
      console.error("[v0] YouTube API error:", youtubeError)

      // Return more specific error information
      if (youtubeError instanceof Error) {
        if (youtubeError.message.includes("403")) {
          return NextResponse.json(
            {
              error: "YouTube API access denied. Please check API key and quota limits.",
              details: youtubeError.message,
            },
            { status: 403 },
          )
        } else if (youtubeError.message.includes("quotaExceeded")) {
          return NextResponse.json(
            {
              error: "YouTube API quota exceeded. Please try again later.",
              details: youtubeError.message,
            },
            { status: 429 },
          )
        }
      }

      return NextResponse.json(
        {
          error: "Failed to fetch YouTube statistics",
          details: youtubeError instanceof Error ? youtubeError.message : String(youtubeError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Statistics update failed:", error)
    return NextResponse.json({ error: "Failed to update statistics" }, { status: 500 })
  }
}
