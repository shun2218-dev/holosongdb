import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { sql } from "@/lib/db"

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

    console.log("[v0] Fetching recent activity")

    const recentSongs = await sql`
      SELECT 
        s.id,
        s.title,
        s.title_jp,
        s.created_at,
        s.updated_at,
        t.name as talent_name,
        t.name_jp as talent_name_jp
      FROM songs s
      JOIN talents t ON s.talent_id = t.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `

    const recentTalents = await sql`
      SELECT 
        id,
        name,
        name_jp,
        branch,
        created_at,
        updated_at
      FROM talents
      ORDER BY created_at DESC
      LIMIT 5
    `

    const activities = []

    // Add song activities
    if (Array.isArray(recentSongs)) {
      recentSongs.forEach((song) => {
        activities.push({
          id: `song-${song.id}`,
          type: "song_created",
          title: `新しい楽曲が追加されました: ${song.title_jp || song.title}`,
          description: `${song.talent_name_jp || song.talent_name}の楽曲`,
          timestamp: song.created_at,
          data: {
            songId: song.id,
            songTitle: song.title,
            talentName: song.talent_name,
          },
        })
      })
    }

    // Add talent activities
    if (Array.isArray(recentTalents)) {
      recentTalents.forEach((talent) => {
        activities.push({
          id: `talent-${talent.id}`,
          type: "talent_created",
          title: `新しいタレントが追加されました: ${talent.name_jp || talent.name}`,
          description: `${talent.branch}ブランチ`,
          timestamp: talent.created_at,
          data: {
            talentId: talent.id,
            talentName: talent.name,
            branch: talent.branch,
          },
        })
      })
    }

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    const recentActivities = activities.slice(0, 5)

    return NextResponse.json({ activities: recentActivities })
  } catch (error) {
    console.error("[v0] Error fetching recent activity:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
