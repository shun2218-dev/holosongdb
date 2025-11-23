import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, userId, subscriptionId, action, notificationData, userAgent } = body

    // 通知クリックを記録
    await sql`
      INSERT INTO notification_clicks (
        notification_id, 
        user_id, 
        subscription_id, 
        action, 
        notification_data,
        user_agent
      ) VALUES (
        ${notificationId}, 
        ${userId}, 
        ${subscriptionId}, 
        ${action}, 
        ${JSON.stringify(notificationData)},
        ${userAgent}
      )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("通知クリック追跡エラー:", error)
    return NextResponse.json({ error: "通知クリック追跡に失敗しました" }, { status: 500 })
  }
}
