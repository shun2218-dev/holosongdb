import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Admin notification send request received")

    // 管理者権限チェック
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("admin-session")?.value

    console.log("[v0] Session ID from cookie:", sessionId ? "present" : "missing")

    if (!sessionId) {
      console.log("[v0] No session ID found in cookies")
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const admin = await verifyAdminSession(sessionId)
    console.log("[v0] Admin verification result:", admin ? admin.username : "null")

    if (!admin) {
      console.log("[v0] Admin verification failed")
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    // 管理者以上の権限が必要
    if (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN") {
      console.log("[v0] Insufficient permissions:", admin.role)
      return NextResponse.json({ error: "管理者権限が必要です" }, { status: 403 })
    }

    console.log("[v0] Admin authorized:", admin.username, admin.role)

    const { type, title, message, targetAudience, talentId } = await request.json()

    // バリデーション
    if (!title || !message || !type) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 })
    }

    if (title.length > 50 || message.length > 200) {
      return NextResponse.json({ error: "文字数制限を超えています" }, { status: 400 })
    }

    // 送信対象のサブスクリプションを取得
    let subscriptions
    if (targetAudience === "all") {
      // If talentId is specified, filter by oshi preferences
      if (talentId) {
        subscriptions = await sql`
          SELECT DISTINCT ps.endpoint, ps.p256dh_key, ps.auth_key 
          FROM push_subscriptions ps
          WHERE ps.active = true
          AND (
            -- User has this talent as oshi
            EXISTS (
              SELECT 1 FROM user_oshi_preferences uop
              WHERE uop.user_id = ps.user_id
              AND uop.talent_id = ${talentId}
            )
            -- OR user has no oshi preferences (receive all notifications)
            OR NOT EXISTS (
              SELECT 1 FROM user_oshi_preferences uop
              WHERE uop.user_id = ps.user_id
            )
          )
        `
      } else {
        subscriptions = await sql`
          SELECT endpoint, p256dh_key, auth_key 
          FROM push_subscriptions 
          WHERE active = true
        `
      }
    } else {
      // 特定の通知設定を有効にしたユーザーのみ
      const settingColumn =
        targetAudience === "milestones"
          ? "milestones"
          : targetAudience === "surge"
            ? "surge"
            : targetAudience === "reports"
              ? "reports"
              : "subscriber_milestones"

      if (talentId) {
        subscriptions = await sql`
          SELECT DISTINCT ps.endpoint, ps.p256dh_key, ps.auth_key 
          FROM push_subscriptions ps
          JOIN push_notification_settings pns ON ps.id = pns.subscription_id
          WHERE ps.active = true 
          AND pns.${sql(settingColumn)} = true
          AND (
            EXISTS (
              SELECT 1 FROM user_oshi_preferences uop
              WHERE uop.user_id = ps.user_id
              AND uop.talent_id = ${talentId}
            )
            OR NOT EXISTS (
              SELECT 1 FROM user_oshi_preferences uop
              WHERE uop.user_id = ps.user_id
            )
          )
        `
      } else {
        subscriptions = await sql`
          SELECT ps.endpoint, ps.p256dh_key, ps.auth_key 
          FROM push_subscriptions ps
          JOIN push_notification_settings pns ON ps.id = pns.subscription_id
          WHERE ps.active = true AND pns.${sql(settingColumn)} = true
        `
      }
    }

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: "送信対象のユーザーが見つかりません" }, { status: 404 })
    }

    const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 通知データを準備
    const notificationData = {
      title,
      message,
      type,
      data: {
        notificationId,
        url: "/",
        timestamp: new Date().toISOString(),
      },
    }

    // 各サブスクリプションに通知を送信
    let successCount = 0
    let failureCount = 0

    for (const subscription of subscriptions) {
      try {
        const subscriptionObject = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key,
          },
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/push/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subscription: subscriptionObject,
            notification: notificationData,
          }),
        })

        if (response.ok) {
          successCount++
        } else {
          failureCount++
          console.error("[v0] Failed to send notification:", await response.text())
        }
      } catch (error) {
        failureCount++
        console.error("[v0] Notification send error:", error)
      }
    }

    await sql`
      INSERT INTO notification_history (
        id, type, title, message, target_id, data, created_at, sent_at
      ) VALUES (
        ${notificationId},
        ${type},
        ${title},
        ${message},
        ${talentId || targetAudience},
        ${JSON.stringify({
          successCount,
          failureCount,
          totalSubscriptions: subscriptions.length,
          adminId: admin.id,
          adminUsername: admin.username,
          talentId: talentId || null,
        })},
        NOW(),
        NOW()
      )
    `

    // 送信履歴を記録
    await sql`
      INSERT INTO admin_activity_log (action, target, "adminId", details)
      VALUES (
        'send_notification',
        ${`${title} (${targetAudience})`},
        ${admin.id},
        ${JSON.stringify({
          type,
          title,
          message,
          targetAudience,
          talentId: talentId || null,
          successCount,
          failureCount,
          totalSubscriptions: subscriptions.length,
          notificationId,
        })}
      )
    `

    return NextResponse.json({
      success: true,
      message: `通知を送信しました (成功: ${successCount}件, 失敗: ${failureCount}件)`,
      notificationId,
      stats: {
        total: subscriptions.length,
        success: successCount,
        failure: failureCount,
      },
    })
  } catch (error) {
    console.error("[v0] Admin notification send error:", error)
    return NextResponse.json({ error: "通知の送信に失敗しました" }, { status: 500 })
  }
}
