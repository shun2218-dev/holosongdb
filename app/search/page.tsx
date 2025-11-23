import { Suspense } from "react"
import { SongList } from "@/components/song-list"
import { OfflineBanner } from "@/components/offline-banner"
import { InstallPrompt } from "@/components/install-prompt"
import { NotificationPrompt } from "@/components/notification-prompt"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { SongCardSkeleton } from "@/components/song-card-skeleton"
import type { Metadata } from "next"
import { generateWebSiteSchema, generateBreadcrumbSchema } from "@/lib/structured-data"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "楽曲検索 | HoloSong DB - ホロライブ楽曲データベース",
  description:
    "ホロライブプロダクションのオリジナル曲や歌ってみた動画を検索できる非公式ファンサイト。タレント名、曲名、作詞作曲者など、様々な条件であなたの好きな一曲を見つけよう！",
  openGraph: {
    title: "楽曲検索 | HoloSong DB",
    description: "ホロライブの楽曲を検索・閲覧できるデータベース",
    url: "https://www.holosongdb.com/search",
    siteName: "HoloSong DB",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HoloSong DB - 楽曲検索",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "楽曲検索 | HoloSong DB",
    description: "ホロライブの楽曲を検索・閲覧できるデータベース",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://www.holosongdb.com/search",
  },
}

interface SearchPageProps {
  searchParams: {
    q?: string
    sortBy?: string
    sortOrder?: string
    type?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const websiteSchema = generateWebSiteSchema()
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "ホーム", url: "https://www.holosongdb.com" },
    { name: "楽曲検索", url: "https://www.holosongdb.com/search" },
  ])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="container mx-auto px-4 py-8 flex-1">
        <OfflineBanner />
        <InstallPrompt />
        <NotificationPrompt />

        <DynamicBreadcrumb />

        <div className="space-y-8">
          <Suspense
            fallback={
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-6 w-24 bg-muted animate-pulse rounded" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SongCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            }
          >
            <SongList searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
