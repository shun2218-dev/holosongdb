import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { createYouTubeAPI } from "@/lib/youtube-api"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const videoId = params.id

    if (!videoId) {
      return NextResponse.json({ error: "動画IDが必要です" }, { status: 400 })
    }

    console.log("[v0] Admin getting video details:", admin.username, "videoId:", videoId)

    const youtubeAPI = createYouTubeAPI()
    const videoDetails = await youtubeAPI.getVideoDetails(videoId)

    if (!videoDetails) {
      return NextResponse.json({ error: "動画が見つかりません" }, { status: 404 })
    }

    // Format video details for frontend
    const formattedDetails = {
      videoId: videoDetails.id,
      title: videoDetails.snippet.title,
      description: videoDetails.snippet.description,
      channelTitle: videoDetails.snippet.channelTitle,
      publishedAt: videoDetails.snippet.publishedAt,
      thumbnail: videoDetails.snippet.thumbnails.medium?.url || videoDetails.snippet.thumbnails.default?.url,
      url: `https://www.youtube.com/watch?v=${videoDetails.id}`,
      statistics: {
        viewCount: videoDetails.statistics.viewCount,
        likeCount: videoDetails.statistics.likeCount,
        commentCount: videoDetails.statistics.commentCount,
      },
    }

    return NextResponse.json({ video: formattedDetails })
  } catch (error) {
    console.error("[v0] Error getting video details:", error)
    return NextResponse.json({ error: "動画詳細の取得でエラーが発生しました" }, { status: 500 })
  }
}
