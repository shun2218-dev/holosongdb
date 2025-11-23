import { type NextRequest, NextResponse } from "next/server"
import webpush from "web-push"

webpush.setVapidDetails(
  "mailto:admin@hololive-songs.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST(request: NextRequest) {
  try {
    const { subscription, notification } = await request.json()

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.message,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      data: notification.data,
      tag: notification.type,
      requireInteraction: true,
    })

    await webpush.sendNotification(subscription, payload)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to send push notification:", error)

    if (error.statusCode === 410) {
      // TODO: サブスクリプションをデータベースから削除
      return NextResponse.json({ error: "Subscription expired" }, { status: 410 })
    }

    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}
