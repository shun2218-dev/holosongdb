import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { createYouTubeAPI } from "@/lib/youtube-api"
import { NotificationService } from "@/lib/notification-service"

async function logActivity(action: string, target: string, adminId: string, details: any) {
  try {
    await sql`
      INSERT INTO admin_activity_log (action, target, admin_id, details, created_at, updated_at)
      VALUES (${action}, ${target}, ${adminId}, ${JSON.stringify(details)}, NOW(), NOW())
    `
  } catch (error) {
    console.error("[v0] Failed to log activity:", error)
  }
}

export async function GET(request: NextRequest) {
  try {
    // Cron job authentication
    const authHeader = request.headers.get("authorization")
    const cronSecret = request.headers.get("x-vercel-cron-signature") || request.nextUrl.searchParams.get("cron_secret")

    if (cronSecret !== process.env.CRON_SECRET && !authHeader?.startsWith("Bearer")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Cron job: Updating subscriber counts")

    // Call the POST endpoint internally
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/admin/update-subscriber-counts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "vercel-cron",
      },
    })

    const result = await response.json()

    return NextResponse.json({
      success: response.ok,
      message: "Cron job completed for subscriber counts",
      result,
    })
  } catch (error) {
    console.error("[v0] Subscriber count cron job failed:", error)
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Starting subscriber count update process")

    const isCronJob =
      request.headers.get("user-agent")?.includes("vercel-cron") ||
      request.headers.get("authorization")?.startsWith("Bearer")

    let adminId = "system"

    if (!isCronJob) {
      try {
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get("admin-session")?.value

        if (!sessionToken) {
          return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
        }

        const admin = await verifyAdminSession(sessionToken)
        if (!admin) {
          return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
        }
        adminId = admin.id
      } catch (authError) {
        console.error("[v0] Authentication error:", authError)
        return NextResponse.json({ error: "認証エラーが発生しました" }, { status: 401 })
      }
    }

    console.log("[v0] Starting subscriber count update for talents")

    let talents
    try {
      talents = await sql`
        SELECT id, name, channel_id, subscriber_count
        FROM talents
        WHERE channel_id IS NOT NULL 
        AND channel_id != ''
        AND active = true
        ORDER BY updated_at ASC
      `
    } catch (dbError) {
      console.error("[v0] Database query error:", dbError)
      return NextResponse.json(
        {
          error: "データベースエラーが発生しました",
          details: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 },
      )
    }

    console.log(`[v0] Found ${talents.length} talents with channel IDs to update`)

    if (talents.length === 0) {
      return NextResponse.json({
        message: "チャンネルIDが設定されているタレントが見つかりませんでした",
        updated: 0,
      })
    }

    let youtubeAPI
    try {
      youtubeAPI = createYouTubeAPI()
    } catch (apiError) {
      console.error("[v0] YouTube API creation error:", apiError)
      return NextResponse.json(
        {
          error: "YouTube API の初期化に失敗しました",
          details: apiError instanceof Error ? apiError.message : String(apiError),
        },
        { status: 500 },
      )
    }

    const channelData: Array<{ talentId: string; channelId: string; name: string }> = []
    for (const talent of talents) {
      if (talent.channel_id) {
        channelData.push({
          talentId: talent.id,
          channelId: talent.channel_id,
          name: talent.name,
        })
      }
    }

    console.log(`[v0] Processing ${channelData.length} valid channel IDs`)

    if (channelData.length === 0) {
      return NextResponse.json({
        message: "有効なチャンネルIDが見つかりませんでした",
        updated: 0,
      })
    }

    try {
      const channelIds = channelData.map((c) => c.channelId)
      console.log(`[v0] About to fetch subscriber counts for channel IDs:`, channelIds.slice(0, 5))

      const statisticsMap = await youtubeAPI.getChannelStatisticsInChunks(channelIds, 50)
      console.log(`[v0] Retrieved statistics for ${statisticsMap.size} channels`)

      let updatedCount = 0
      const errors: string[] = []
      const allNotifications: any[] = []

      for (const { talentId, channelId, name } of channelData) {
        const stats = statisticsMap.get(channelId)
        if (stats) {
          try {
            const subscriberCount = stats.subscriberCount ? BigInt(stats.subscriberCount) : BigInt(0)

            await NotificationService.saveTalentStatistics(talentId, subscriberCount)

            const milestoneNotifications = await NotificationService.checkSubscriberMilestones(
              talentId,
              subscriberCount,
            )
            allNotifications.push(...milestoneNotifications)

            await sql`
              UPDATE talents SET
                subscriber_count = ${subscriberCount},
                updated_at = NOW()
              WHERE id = ${talentId}
            `

            console.log(`[v0] Updated ${name}: ${stats.subscriberCount} subscribers`)
            updatedCount++
          } catch (error) {
            const errorMsg = `Failed to update talent ${name} (${talentId}): ${error}`
            console.error(`[v0] ${errorMsg}`)
            errors.push(errorMsg)
          }
        } else {
          const errorMsg = `No statistics found for talent ${name} (channel: ${channelId})`
          console.warn(`[v0] ${errorMsg}`)
          errors.push(errorMsg)
        }
      }

      for (const notification of allNotifications) {
        await NotificationService.sendPushNotification(notification)
      }

      await logActivity("subscriber_count_update", "talents", adminId, {
        updatedCount,
        totalCount: talents.length,
        success: updatedCount > 0,
        errors: errors.length > 0 ? errors.slice(0, 5) : null,
        notifications: allNotifications.length,
        timestamp: new Date().toISOString(),
      })

      console.log(`[v0] Successfully updated ${updatedCount} talents, sent ${allNotifications.length} notifications`)

      return NextResponse.json({
        message: `${updatedCount}件のタレントの登録者数を更新しました`,
        updated: updatedCount,
        total: talents.length,
        notifications: allNotifications.length,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
      })
    } catch (youtubeError) {
      console.error("[v0] YouTube API error:", youtubeError)

      await logActivity("subscriber_count_update", "talents", adminId, {
        updatedCount: 0,
        totalCount: talents.length,
        success: false,
        error: youtubeError instanceof Error ? youtubeError.message : String(youtubeError),
        timestamp: new Date().toISOString(),
      })

      if (youtubeError instanceof Error) {
        if (youtubeError.message.includes("403")) {
          return NextResponse.json(
            {
              error: "YouTube API へのアクセスが拒否されました。APIキーとクォータ制限を確認してください。",
              details: youtubeError.message,
            },
            { status: 403 },
          )
        } else if (youtubeError.message.includes("quotaExceeded")) {
          return NextResponse.json(
            {
              error: "YouTube API のクォータを超過しました。しばらく時間をおいて再度お試しください。",
              details: youtubeError.message,
            },
            { status: 429 },
          )
        }
      }

      return NextResponse.json(
        {
          error: "YouTube チャンネル統計の取得に失敗しました",
          details: youtubeError instanceof Error ? youtubeError.message : String(youtubeError),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[v0] Subscriber count update failed:", error)

    return NextResponse.json(
      {
        error: "登録者数の更新に失敗しました",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
