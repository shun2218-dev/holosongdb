import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const notificationId = params.id

    const notificationDetail = await sql`
      SELECT 
        nh.id as notification_id,
        nh.title,
        nh.message as body,
        nh.created_at AT TIME ZONE 'Asia/Tokyo' as sent_at_jst,
        nh.type,
        nh.data,
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
      WHERE nh.id = ${notificationId}
      GROUP BY nh.id, nh.title, nh.message, nh.created_at, nh.type, nh.data
    `

    // 時間別クリック統計
    const hourlyStats = await sql`
      SELECT 
        DATE_TRUNC('hour', nc.clicked_at AT TIME ZONE 'Asia/Tokyo') as hour,
        COUNT(CASE WHEN nc.action = 'view' THEN 1 END) as views,
        COUNT(CASE WHEN nc.action = 'dismiss' THEN 1 END) as dismisses
      FROM notification_clicks nc
      WHERE nc.notification_id = ${notificationId}
        AND nc.subscription_id IS NOT NULL
      GROUP BY DATE_TRUNC('hour', nc.clicked_at AT TIME ZONE 'Asia/Tokyo')
      ORDER BY hour
    `

    if (notificationDetail.length === 0) {
      return NextResponse.json({ error: "通知が見つかりません" }, { status: 404 })
    }

    return NextResponse.json({
      notification: notificationDetail[0],
      hourly_stats: hourlyStats,
    })
  } catch (error) {
    console.error("個別通知詳細取得エラー:", error)
    return NextResponse.json({ error: "通知詳細の取得に失敗しました" }, { status: 500 })
  }
}
