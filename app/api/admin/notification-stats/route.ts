import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    const stats = await sql`
      SELECT 
        DATE(clicked_at AT TIME ZONE 'Asia/Tokyo') as date,
        action,
        COUNT(*) as click_count,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT CONCAT(user_id, '-', notification_id)) as unique_interactions
      FROM notification_clicks 
      WHERE clicked_at >= NOW() - INTERVAL '${sql.unsafe(days.toString())} days'
        AND subscription_id IS NOT NULL
      GROUP BY DATE(clicked_at AT TIME ZONE 'Asia/Tokyo'), action
      ORDER BY date DESC, action
    `

    const totalStats = await sql`
      SELECT 
        COUNT(*) as total_clicks,
        COUNT(DISTINCT user_id) as total_unique_users,
        COUNT(CASE WHEN action = 'view' THEN 1 END) as view_clicks,
        COUNT(CASE WHEN action = 'dismiss' THEN 1 END) as dismiss_clicks,
        COUNT(CASE WHEN action = 'close' THEN 1 END) as close_clicks,
        ROUND(
          COUNT(CASE WHEN action = 'view' THEN 1 END)::numeric / 
          NULLIF(COUNT(*), 0) * 100, 2
        ) as click_through_rate
      FROM notification_clicks 
      WHERE clicked_at >= NOW() - INTERVAL '${sql.unsafe(days.toString())} days'
        AND subscription_id IS NOT NULL
    `

    const hourlyStats = await sql`
      SELECT 
        EXTRACT(HOUR FROM clicked_at AT TIME ZONE 'Asia/Tokyo') as hour,
        COUNT(*) as click_count
      FROM notification_clicks 
      WHERE clicked_at >= NOW() - INTERVAL '${sql.unsafe(days.toString())} days'
        AND subscription_id IS NOT NULL
      GROUP BY EXTRACT(HOUR FROM clicked_at AT TIME ZONE 'Asia/Tokyo')
      ORDER BY hour
    `

    return NextResponse.json({
      dailyStats: stats,
      totalStats: totalStats[0] || {},
      hourlyStats,
    })
  } catch (error) {
    console.error("通知統計取得エラー:", error)
    return NextResponse.json({ error: "通知統計の取得に失敗しました" }, { status: 500 })
  }
}
