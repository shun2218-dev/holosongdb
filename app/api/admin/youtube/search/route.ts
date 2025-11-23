import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { createYouTubeAPI } from "@/lib/youtube-api"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const channelId = searchParams.get("channelId")
    const maxResults = Number.parseInt(searchParams.get("maxResults") || "10")

    if (!query) {
      return NextResponse.json({ error: "検索クエリが必要です" }, { status: 400 })
    }

    console.log("[v0] Admin YouTube search:", admin.username, "query:", query)

    const youtubeAPI = createYouTubeAPI()
    const results = await youtubeAPI.searchVideos(query, channelId || undefined, maxResults)

    // Format results for frontend
    const formattedResults = results.map((result) => ({
      videoId: result.id.videoId,
      title: result.snippet.title,
      description: result.snippet.description,
      channelTitle: result.snippet.channelTitle,
      publishedAt: result.snippet.publishedAt,
      thumbnail: result.snippet.thumbnails.medium?.url || result.snippet.thumbnails.default?.url,
      url: `https://www.youtube.com/watch?v=${result.id.videoId}`,
    }))

    return NextResponse.json({ results: formattedResults })
  } catch (error) {
    console.error("[v0] Error searching YouTube:", error)
    return NextResponse.json({ error: "YouTube検索でエラーが発生しました" }, { status: 500 })
  }
}
