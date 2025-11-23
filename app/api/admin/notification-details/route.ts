import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = Number.parseInt(searchParams.get("days") || "30")

    console.log("[v0] Fetching notification stats for days:", days)

    const overallStats = await sql`
      SELECT 
        COUNT(DISTINCT nh.id) as total_notifications,
        COUNT(nc.id) as total_interactions,
        COUNT(CASE WHEN nc.action = 'view' THEN 1 END) as total_views,
        COUNT(CASE WHEN nc.action = 'dismiss' THEN 1 END) as total_dismisses,
        ROUND(
          COUNT(CASE WHEN nc.action = 'view' THEN 1 END)::numeric / 
          NULLIF(COUNT(nc.id), 0) * 100, 2
        ) as overall_ctr
      FROM notification_history nh
      LEFT JOIN notification_clicks nc ON nh.id = nc.notification_id AND nc.subscription_id IS NOT NULL
      WHERE nh.created_at >= NOW() - INTERVAL '${sql.unsafe(days.toString())} days'
    `

    console.log("[v0] Query results:", overallStats[0])

    const notificationDetails = await sql`
      SELECT 
        nh.id as notification_id,
        nh.title,
        nh.message as body,
        nh.created_at AT TIME ZONE 'Asia/Tokyo' as sent_at_jst,
        nh.type,
        COUNT(nc.id) as total_interactions,
        COUNT(CASE WHEN nc.action = 'view' THEN 1 END) as view_clicks,
        COUNT(CASE WHEN nc.action = 'dismiss' THEN 1 END) as dismiss_clicks,
        COUNT(CASE WHEN nc.action = 'close' THEN 1 END) as close_clicks,
        COUNT(DISTINCT nc.user_id) as unique_users,
        ROUND(
          COUNT(CASE WHEN nc.action = 'view' THEN 1 END)::numeric / 
          NULLIF(COUNT(nc.id), 0) * 100, 2
        ) as click_through_rate
      FROM notification_history nh
      LEFT JOIN notification_clicks nc ON nh.id = nc.notification_id AND nc.subscription_id IS NOT NULL
      WHERE nh.created_at >= NOW() - INTERVAL '${sql.unsafe(days.toString())} days'
      GROUP BY nh.id, nh.title, nh.message, nh.created_at, nh.type
      ORDER BY nh.created_at DESC
      LIMIT 50
    `

    const response = NextResponse.json({
      overall_stats: overallStats[0] || {
        total_notifications: 0,
        total_interactions: 0,
        total_views: 0,
        total_dismisses: 0,
        overall_ctr: 0,
      },
      notifications: notificationDetails,
    })

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("通知詳細取得エラー:", error)
    return NextResponse.json({ error: "通知詳細の取得に失敗しました" }, { status: 500 })
  }
}
