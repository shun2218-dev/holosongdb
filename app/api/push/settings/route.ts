import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // 実際の実装では、ユーザーのサブスクリプションIDを取得する必要があります
    // ここでは簡略化のため、最新のサブスクリプションを使用
    const subscriptions = await sql`
      SELECT id FROM push_subscriptions 
      WHERE active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `

    if (subscriptions.length === 0) {
      // デフォルト設定を返す
      return NextResponse.json({
        milestones: true,
        surge: true,
        subscriberMilestones: true,
        reports: false,
      })
    }

    const subscriptionId = subscriptions[0].id

    // 現在の設定を取得
    const settings = await sql`
      SELECT milestones, surge, subscriber_milestones as "subscriberMilestones", reports
      FROM push_notification_settings 
      WHERE subscription_id = ${subscriptionId}
    `

    if (settings.length === 0) {
      // デフォルト設定を返す
      return NextResponse.json({
        milestones: true,
        surge: true,
        subscriberMilestones: true,
        reports: false,
      })
    }

    return NextResponse.json(settings[0])
  } catch (error) {
    console.error("[v0] Failed to load notification settings:", error)
    // エラーの場合もデフォルト設定を返す
    return NextResponse.json({
      milestones: true,
      surge: true,
      subscriberMilestones: true,
      reports: false,
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()

    // 実際の実装では、ユーザーのサブスクリプションIDを取得する必要があります
    // ここでは簡略化のため、最新のサブスクリプションを使用
    const subscriptions = await sql`
      SELECT id FROM push_subscriptions 
      WHERE active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: "サブスクリプションが見つかりません" }, { status: 404 })
    }

    const subscriptionId = subscriptions[0].id

    await sql`
      INSERT INTO push_notification_settings (
        subscription_id, 
        milestones, 
        surge, 
        subscriber_milestones, 
        reports
      )
      VALUES (
        ${subscriptionId}, 
        ${settings.milestones}, 
        ${settings.surge}, 
        ${settings.subscriberMilestones}, 
        ${settings.reports}
      )
      ON CONFLICT (subscription_id) 
      DO UPDATE SET 
        milestones = ${settings.milestones},
        surge = ${settings.surge},
        subscriber_milestones = ${settings.subscriberMilestones},
        reports = ${settings.reports},
        updated_at = CURRENT_TIMESTAMP
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Failed to save notification settings:", error)
    return NextResponse.json({ error: "設定の保存に失敗しました" }, { status: 500 })
  }
}
