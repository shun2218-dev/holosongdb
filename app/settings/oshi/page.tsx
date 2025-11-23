import { OshiSettings } from "@/components/oshi-settings"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "推し設定 | HoloSong DB",
  description: "お気に入りのホロライブタレントを登録して、パーソナライズされた楽曲体験を楽しもう",
  robots: {
    index: false,
    follow: false,
  },
}

export default function OshiPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 pb-24">
        <DynamicBreadcrumb />

        <div className="mt-6">
          <OshiSettings />
        </div>
      </main>
    </div>
  )
}
