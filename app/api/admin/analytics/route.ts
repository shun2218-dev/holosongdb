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

    console.log("[v0] Fetching enhanced analytics data")

    // Get basic statistics
    const [songsCount, talentsCount, totalViews, totalLikes] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM songs`,
      sql`SELECT COUNT(*) as count FROM talents WHERE active = true`,
      sql`SELECT COALESCE(SUM(view_count), 0) as total FROM songs WHERE view_count IS NOT NULL`,
      sql`SELECT COALESCE(SUM(like_count), 0) as total FROM songs WHERE like_count IS NOT NULL`,
    ])

    const talentStats = await sql`
      SELECT 
        t.id,
        t.name,
        t.name_jp,
        t.branch,
        t.generation,
        t.main_color,
        COUNT(s.id) as total_songs,
        COUNT(CASE WHEN s.type = 'ORIGINAL' THEN 1 END) as original_songs,
        COUNT(CASE WHEN s.type = 'COVER' THEN 1 END) as cover_songs,
        COALESCE(SUM(s.view_count), 0) as total_views,
        COALESCE(SUM(CASE WHEN s.type = 'ORIGINAL' THEN s.view_count ELSE 0 END), 0) as original_views,
        COALESCE(SUM(CASE WHEN s.type = 'COVER' THEN s.view_count ELSE 0 END), 0) as cover_views,
        COALESCE(AVG(CASE WHEN s.video_url IS NOT NULL AND s.video_url != '' THEN s.view_count END), 0) as avg_views,
        COALESCE(AVG(CASE WHEN s.type = 'ORIGINAL' AND s.video_url IS NOT NULL AND s.video_url != '' THEN s.view_count END), 0) as avg_original_views,
        COALESCE(AVG(CASE WHEN s.type = 'COVER' AND s.video_url IS NOT NULL AND s.video_url != '' THEN s.view_count END), 0) as avg_cover_views,
        COALESCE(SUM(s.like_count), 0) as total_likes,
        (SELECT MAX(s3.view_count) FROM songs s3 
         JOIN song_talents st3 ON s3.id = st3.song_id 
         WHERE st3.talent_id = t.id AND (s3.is_group_song IS NULL OR s3.is_group_song = false)) as most_viewed_count,
        (SELECT s2.title FROM songs s2 
         JOIN song_talents st2 ON s2.id = st2.song_id 
         WHERE st2.talent_id = t.id AND (s2.is_group_song IS NULL OR s2.is_group_song = false)
         ORDER BY s2.view_count DESC NULLS LAST LIMIT 1) as most_viewed_song
      FROM talents t
      LEFT JOIN song_talents st ON t.id = st.talent_id
      LEFT JOIN songs s ON st.song_id = s.id
      WHERE t.active = true 
        AND (s.id IS NULL OR s.is_group_song IS NULL OR s.is_group_song = false)
      GROUP BY t.id, t.name, t.name_jp, t.branch, t.generation, t.main_color
      ORDER BY total_views DESC
    `

    const monthlyTrends = await sql`
      SELECT 
        DATE_TRUNC('month', release_date) as month,
        COUNT(*) as total_uploads,
        COUNT(CASE WHEN type = 'ORIGINAL' THEN 1 END) as original_uploads,
        COUNT(CASE WHEN type = 'COVER' THEN 1 END) as cover_uploads,
        COALESCE(AVG(CASE WHEN video_url IS NOT NULL AND video_url != '' THEN view_count END), 0) as avg_views
      FROM songs 
      WHERE release_date IS NOT NULL 
        AND release_date >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', release_date)
      ORDER BY month DESC
      LIMIT 12
    `

    const branchStats = await sql`
      SELECT 
        t.branch,
        COUNT(DISTINCT t.id) as talent_count,
        COUNT(DISTINCT s.id) as total_songs,
        COALESCE(SUM(DISTINCT s.view_count), 0) as total_views,
        COALESCE(AVG(CASE WHEN s.video_url IS NOT NULL AND s.video_url != '' THEN s.view_count END), 0) as avg_views_per_song,
        COUNT(DISTINCT CASE WHEN s.type = 'ORIGINAL' THEN s.id END) as original_songs,
        COUNT(DISTINCT CASE WHEN s.type = 'COVER' THEN s.id END) as cover_songs
      FROM talents t
      LEFT JOIN song_talents st ON t.id = st.talent_id
      LEFT JOIN songs s ON st.song_id = s.id
      WHERE t.active = true
        AND (s.id IS NULL OR s.is_group_song IS NULL OR s.is_group_song = false)
      GROUP BY t.branch
      ORDER BY total_views DESC
    `

    const topOriginalSongs = await sql`
      SELECT 
        s.id,
        s.title,
        s.view_count as view_count,
        s.like_count as like_count,
        s.release_date as release_date,
        STRING_AGG(t.name, ', ' ORDER BY t.name) as talent_name,
        STRING_AGG(DISTINCT t.branch, ', ' ORDER BY t.branch) as branch
      FROM songs s
      JOIN song_talents st ON s.id = st.song_id
      JOIN talents t ON st.talent_id = t.id
      WHERE s.type = 'ORIGINAL' AND s.view_count IS NOT NULL
        AND (s.is_group_song IS NULL OR s.is_group_song = false)
      GROUP BY s.id, s.title, s.view_count, s.like_count, s.release_date
      ORDER BY s.view_count DESC
      LIMIT 10
    `

    const topCoverSongs = await sql`
      SELECT 
        s.id,
        s.title,
        s.view_count as view_count,
        s.like_count as like_count,
        s.release_date as release_date,
        STRING_AGG(t.name, ', ' ORDER BY t.name) as talent_name,
        STRING_AGG(DISTINCT t.branch, ', ' ORDER BY t.branch) as branch
      FROM songs s
      JOIN song_talents st ON s.id = st.song_id
      JOIN talents t ON st.talent_id = t.id
      WHERE s.type = 'COVER' AND s.view_count IS NOT NULL
        AND (s.is_group_song IS NULL OR s.is_group_song = false)
      GROUP BY s.id, s.title, s.view_count, s.like_count, s.release_date
      ORDER BY s.view_count DESC
      LIMIT 10
    `

    const popularSongs = await sql`
      SELECT 
        s.id,
        s.title,
        s.view_count as view_count,
        STRING_AGG(t.name, ', ' ORDER BY t.name) as talent_name
      FROM songs s
      JOIN song_talents st ON s.id = st.song_id
      JOIN talents t ON st.talent_id = t.id
      WHERE s.view_count IS NOT NULL
        AND (s.is_group_song IS NULL OR s.is_group_song = false)
      GROUP BY s.id, s.title, s.view_count
      ORDER BY s.view_count DESC
      LIMIT 10
    `

    const recentSongs = await sql`
      SELECT 
        s.id,
        s.title,
        s.created_at as created_at,
        STRING_AGG(t.name, ', ' ORDER BY t.name) as talent_name
      FROM songs s
      JOIN song_talents st ON s.id = st.song_id
      JOIN talents t ON st.talent_id = t.id
      GROUP BY s.id, s.title, s.created_at
      ORDER BY s.created_at DESC
      LIMIT 10
    `

    const analytics = {
      totalSongs: Array.isArray(songsCount) ? Number.parseInt(songsCount[0]?.count || "0") : 0,
      totalTalents: Array.isArray(talentsCount) ? Number.parseInt(talentsCount[0]?.count || "0") : 0,
      totalViews: Array.isArray(totalViews) ? Number.parseInt(totalViews[0]?.total || "0") : 0,
      totalLikes: Array.isArray(totalLikes) ? Number.parseInt(totalLikes[0]?.total || "0") : 0,

      talentStats: Array.isArray(talentStats)
        ? talentStats.map((row) => ({
            id: row.id,
            name: row.name,
            nameJp: row.name_jp,
            branch: row.branch,
            generation: row.generation,
            mainColor: row.main_color,
            totalSongs: Number.parseInt(row.total_songs || "0"),
            originalSongs: Number.parseInt(row.original_songs || "0"),
            coverSongs: Number.parseInt(row.cover_songs || "0"),
            totalViews: Number.parseInt(row.total_views || "0"),
            originalViews: Number.parseInt(row.original_views || "0"),
            coverViews: Number.parseInt(row.cover_views || "0"),
            avgViews: Math.round(Number.parseFloat(row.avg_views || "0")),
            avgOriginalViews: Math.round(Number.parseFloat(row.avg_original_views || "0")),
            avgCoverViews: Math.round(Number.parseFloat(row.avg_cover_views || "0")),
            totalLikes: Number.parseInt(row.total_likes || "0"),
            mostViewedCount: Number.parseInt(row.most_viewed_count || "0"),
            mostViewedSong: row.most_viewed_song,
          }))
        : [],

      monthlyTrends: Array.isArray(monthlyTrends)
        ? monthlyTrends.map((row) => ({
            month: row.month,
            totalUploads: Number.parseInt(row.total_uploads || "0"),
            originalUploads: Number.parseInt(row.original_uploads || "0"),
            coverUploads: Number.parseInt(row.cover_uploads || "0"),
            avgViews: Math.round(Number.parseFloat(row.avg_views || "0")),
          }))
        : [],

      branchStats: Array.isArray(branchStats)
        ? branchStats.map((row) => ({
            branch: row.branch,
            talentCount: Number.parseInt(row.talent_count || "0"),
            totalSongs: Number.parseInt(row.total_songs || "0"),
            totalViews: Number.parseInt(row.total_views || "0"),
            avgViewsPerSong: Math.round(Number.parseFloat(row.avg_views_per_song || "0")),
            originalSongs: Number.parseInt(row.original_songs || "0"),
            coverSongs: Number.parseInt(row.cover_songs || "0"),
          }))
        : [],

      topOriginalSongs: Array.isArray(topOriginalSongs)
        ? topOriginalSongs.map((row) => ({
            id: row.id,
            title: row.title,
            viewCount: Number.parseInt(row.view_count || "0"),
            likeCount: Number.parseInt(row.like_count || "0"),
            releaseDate: row.release_date,
            talentName: row.talent_name,
            branch: row.branch,
          }))
        : [],
      topCoverSongs: Array.isArray(topCoverSongs)
        ? topCoverSongs.map((row) => ({
            id: row.id,
            title: row.title,
            viewCount: Number.parseInt(row.view_count || "0"),
            likeCount: Number.parseInt(row.like_count || "0"),
            releaseDate: row.release_date,
            talentName: row.talent_name,
            branch: row.branch,
          }))
        : [],

      popularSongs: Array.isArray(popularSongs)
        ? popularSongs.map((row) => ({
            id: row.id,
            title: row.title,
            talent_name: row.talent_name,
            view_count: Number.parseInt(row.view_count || "0"),
          }))
        : [],
      recentSongs: Array.isArray(recentSongs)
        ? recentSongs.map((row) => ({
            id: row.id,
            title: row.title,
            talent_name: row.talent_name,
            created_at: row.created_at,
          }))
        : [],
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("[v0] Error fetching analytics:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
