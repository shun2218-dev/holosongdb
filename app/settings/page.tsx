import type { Metadata } from "next"
import Link from "next/link"
import { Heart, Bell, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"

export const metadata: Metadata = {
  title: "設定 | HoloSong DB",
  description: "アプリの設定を管理",
}

export default function SettingsPage() {
  const settingsItems = [
    {
      href: "/settings/oshi",
      icon: Heart,
      title: "推し設定",
      description: "お気に入りのタレントを選択して通知を受け取る",
    },
    {
      href: "/settings/notifications",
      icon: Bell,
      title: "通知設定",
      description: "プッシュ通知の設定を管理できます",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 pb-24">
        <DynamicBreadcrumb />

        <div className="max-w-2xl mx-auto mt-6">
          <div className="space-y-3">
            {settingsItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
