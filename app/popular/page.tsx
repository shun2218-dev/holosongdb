import { Suspense } from "react"
import { PopularSongsList } from "@/components/popular-songs-list"
import { OfflineBanner } from "@/components/offline-banner"
import { SongCardSkeleton } from "@/components/song-card-skeleton"
import type { Metadata } from "next"
import { generateBreadcrumbSchema } from "@/lib/structured-data"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "人気楽曲ランキング | HoloSong DB",
  description:
    "ホロライブの人気楽曲を再生回数順にランキング表示。最も人気のあるオリジナル曲や歌ってみた動画をチェックしよう！",
  openGraph: {
    title: "人気楽曲ランキング | HoloSong DB",
    description: "ホロライブの人気楽曲を再生回数順に表示",
    url: "https://www.holosongdb.com/popular",
    siteName: "HoloSong DB",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HoloSong DB - 人気楽曲ランキング",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "人気楽曲ランキング | HoloSong DB",
    description: "ホロライブの人気楽曲を再生回数順に表示",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://www.holosongdb.com/popular",
  },
}

export default function PopularPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "人気楽曲ランキング",
    description: "ホロライブの人気楽曲を再生回数順に表示",
    url: "https://www.holosongdb.com/popular",
    inLanguage: "ja",
    isPartOf: {
      "@type": "WebSite",
      name: "HoloSong DB",
      url: "https://www.holosongdb.com",
    },
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "ホーム", url: "https://www.holosongdb.com" },
    { name: "人気楽曲ランキング", url: "https://www.holosongdb.com/popular" },
  ])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="container mx-auto px-4 py-8 flex-1">
        <OfflineBanner />

        <DynamicBreadcrumb />

        <div className="space-y-8">
          <Suspense
            fallback={
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="h-8 w-64 bg-muted animate-pulse rounded" />
                  <div className="h-6 w-20 bg-muted animate-pulse rounded" />
                </div>
                {/* Top 3 skeleton */}
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -top-2 -left-2 z-10 bg-background border border-border rounded-full p-2 shadow-lg">
                        <div className="h-6 w-6 bg-muted animate-pulse rounded" />
                      </div>
                      <SongCardSkeleton />
                    </div>
                  ))}
                </div>
                {/* 4th and below skeleton */}
                <div className="space-y-4">
                  <div className="h-6 w-24 bg-muted animate-pulse rounded border-b border-border pb-2" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <SongCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              </div>
            }
          >
            <PopularSongsList />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
