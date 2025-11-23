import Link from "next/link"
import { Search, TrendingUp, Users, Music, Play, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { OfflineBanner } from "@/components/offline-banner"
import { InstallPrompt } from "@/components/install-prompt"
import { NotificationPrompt } from "@/components/notification-prompt"
import type { Metadata } from "next"
import { generateWebSiteSchema, generateOrganizationSchema } from "@/lib/structured-data"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "HoloSong DB | ホロライブ楽曲データベース",
  description:
    "ホロライブプロダクションのオリジナル曲や歌ってみた動画を検索できる非公式ファンサイト。タレント名、曲名、作詞作曲者など、様々な条件であなたの好きな一曲を見つけよう！",
  openGraph: {
    title: "HoloSong DB - ホロライブ楽曲データベース",
    description: "ホロライブの楽曲を検索・閲覧できるデータベース",
    url: "https://www.holosongdb.com",
    siteName: "HoloSong DB",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HoloSong DB - ホロライブ楽曲データベース",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HoloSong DB | ホロライブ楽曲データベース",
    description: "ホロライブの楽曲を検索・閲覧できるデータベース",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://www.holosongdb.com",
  },
}

export default function HomePage() {
  const websiteSchema = generateWebSiteSchema()
  const organizationSchema = generateOrganizationSchema()

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      <main className="container mx-auto px-4">
        <OfflineBanner />
        <InstallPrompt />
        <NotificationPrompt />

        {/* Hero Section */}
        <section className="py-16 sm:py-24 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance">
              ホロライブ楽曲データベース
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              オリジナル曲や歌ってみた動画を検索・閲覧できる非公式ファンサイト。
              <br />
              あなたの好きな一曲を見つけよう。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/search">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                  <Search className="h-5 w-5 mr-2" />
                  楽曲を検索
                </Button>
              </Link>
              <Link href="/talents">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 bg-transparent">
                  <Users className="h-5 w-5 mr-2" />
                  タレント一覧
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-12 sm:py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Search Card */}
            <Link href="/search">
              <Card className="p-6 hover:border-primary transition-colors cursor-pointer h-full group">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">楽曲検索</h3>
                  <p className="text-muted-foreground">
                    タレント名、曲名、作詞作曲者など、様々な条件で楽曲を検索できます。
                  </p>
                </div>
              </Card>
            </Link>

            {/* Popular Card */}
            <Link href="/popular">
              <Card className="p-6 hover:border-primary transition-colors cursor-pointer h-full group">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">人気楽曲</h3>
                  <p className="text-muted-foreground">
                    再生回数順にランキング表示。最も人気のある楽曲をチェックしよう。
                  </p>
                </div>
              </Card>
            </Link>

            {/* Talents Card */}
            <Link href="/talents">
              <Card className="p-6 hover:border-primary transition-colors cursor-pointer h-full group">
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">タレント一覧</h3>
                  <p className="text-muted-foreground">
                    各タレントのオリジナル曲や歌ってみた、統計情報を閲覧できます。
                  </p>
                </div>
              </Card>
            </Link>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 sm:py-16">
          <Card className="p-8 sm:p-12 bg-card/50">
            <div className="grid gap-8 sm:grid-cols-3 text-center">
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <Music className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-foreground">1000+</div>
                <div className="text-sm text-muted-foreground">楽曲データ</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-foreground">80+</div>
                <div className="text-sm text-muted-foreground">タレント</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <Play className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-foreground">毎日更新</div>
                <div className="text-sm text-muted-foreground">最新情報</div>
              </div>
            </div>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="py-12 sm:py-16 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">推しの楽曲を見つけよう</h3>
            <p className="text-muted-foreground text-pretty">
              推し設定をすることで、お気に入りのタレントの楽曲を優先的に表示できます。
            </p>
            <Link href="/settings/oshi">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-transparent">
                <Heart className="h-5 w-5 mr-2" />
                推し設定
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
