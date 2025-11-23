import { NotificationSettings } from "@/components/notification-settings"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "通知設定 | HoloSong DB",
  description: "プッシュ通知の設定を管理して、新しい楽曲の情報をいち早く受け取ろう",
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 pb-24">
        <DynamicBreadcrumb />

        <div className="mt-6 max-w-2xl">
          <NotificationSettings />
        </div>
      </main>
    </div>
  )
}
