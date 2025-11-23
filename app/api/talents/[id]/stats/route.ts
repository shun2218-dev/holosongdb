import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"
export const revalidate = 300 // 5分間キャッシュ

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const talentResult = await sql`
      SELECT 
        t.id,
        t.name,
        t.name_jp,
        t.name_en,
        t.branch,
        t.generation,
        t.main_color,
        t.subscriber_count,
        COUNT(DISTINCT s.id) as total_songs,
        COUNT(DISTINCT CASE WHEN s.type = 'ORIGINAL' THEN s.id END) as original_songs,
        COUNT(DISTINCT CASE WHEN s.type = 'COVER' THEN s.id END) as cover_songs,
        COALESCE(SUM(s.view_count), 0) as total_views,
        COALESCE(SUM(s.like_count), 0) as total_likes,
        COALESCE(SUM(s.comment_count), 0) as total_comments,
        COALESCE(AVG(CASE WHEN s.view_count > 0 THEN s.view_count END), 0) as avg_views,
        COALESCE(AVG(CASE WHEN s.type = 'ORIGINAL' AND s.view_count > 0 THEN s.view_count END), 0) as avg_original_views,
        COALESCE(AVG(CASE WHEN s.type = 'COVER' AND s.view_count > 0 THEN s.view_count END), 0) as avg_cover_views
      FROM talents t
      LEFT JOIN song_talents st ON t.id = st.talent_id
      LEFT JOIN songs s ON st.song_id = s.id
      WHERE t.id = ${id} AND t.active = true
      GROUP BY t.id
    `

    if (!talentResult || talentResult.length === 0) {
      return NextResponse.json({ error: "タレントが見つかりません" }, { status: 404 })
    }

    const talent = talentResult[0]

    const topSongs = await sql`
      SELECT 
        s.id,
        s.title,
        s.type,
        s.view_count as view_count,
        s.like_count as like_count,
        s.release_date as release_date
      FROM songs s
      JOIN song_talents st ON s.id = st.song_id
      WHERE st.talent_id = ${id} AND s.view_count IS NOT NULL
      ORDER BY s.view_count DESC
      LIMIT 10
    `

    const monthlyTrends = await sql`
      SELECT 
        DATE_TRUNC('month', s.release_date) as month,
        COUNT(*) as total_uploads,
        COUNT(CASE WHEN s.type = 'ORIGINAL' THEN 1 END) as original_uploads,
        COUNT(CASE WHEN s.type = 'COVER' THEN 1 END) as cover_uploads,
        COALESCE(AVG(CASE WHEN s.view_count > 0 THEN s.view_count END), 0) as avg_views
      FROM songs s
      JOIN song_talents st ON s.id = st.song_id
      WHERE st.talent_id = ${id}
        AND s.release_date IS NOT NULL
        AND s.release_date >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', s.release_date)
      ORDER BY month DESC
      LIMIT 12
    `

    const stats = {
      talent: {
        id: talent.id,
        name: talent.name,
        nameJp: talent.name_jp,
        nameEn: talent.name_en,
        branch: talent.branch,
        generation: talent.generation,
        mainColor: talent.main_color,
        subscriberCount: talent.subscriber_count ? talent.subscriber_count.toString() : null,
      },
      statistics: {
        totalSongs: Number.parseInt(talent.total_songs || "0"),
        originalSongs: Number.parseInt(talent.original_songs || "0"),
        coverSongs: Number.parseInt(talent.cover_songs || "0"),
        totalViews: Number.parseInt(talent.total_views || "0"),
        totalLikes: Number.parseInt(talent.total_likes || "0"),
        totalComments: Number.parseInt(talent.total_comments || "0"),
        avgViews: Math.round(Number.parseFloat(talent.avg_views || "0")),
        avgOriginalViews: Math.round(Number.parseFloat(talent.avg_original_views || "0")),
        avgCoverViews: Math.round(Number.parseFloat(talent.avg_cover_views || "0")),
      },
      topSongs: topSongs.map((song) => ({
        id: song.id,
        title: song.title,
        type: song.type,
        viewCount: Number.parseInt(song.view_count || "0"),
        likeCount: Number.parseInt(song.like_count || "0"),
        releaseDate: song.release_date,
      })),
      monthlyTrends: monthlyTrends.map((trend) => ({
        month: trend.month,
        totalUploads: Number.parseInt(trend.total_uploads || "0"),
        originalUploads: Number.parseInt(trend.original_uploads || "0"),
        coverUploads: Number.parseInt(trend.cover_uploads || "0"),
        avgViews: Math.round(Number.parseFloat(trend.avg_views || "0")),
      })),
    }

    const headers = new Headers()
    headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
    headers.set("CDN-Cache-Control", "public, s-maxage=300")

    return NextResponse.json(stats, { headers })
  } catch (error) {
    console.error("[v0] Error fetching talent statistics:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
