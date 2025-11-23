import { Suspense } from "react"
import { TalentList } from "@/components/talent-list"
import { OfflineBanner } from "@/components/offline-banner"
import { Card, CardContent } from "@/components/ui/card"
import type { Metadata } from "next"
import { generateBreadcrumbSchema } from "@/lib/structured-data"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "タレント一覧 | HoloSong DB",
  description:
    "ホロライブプロダクションの全タレント一覧。各タレントのオリジナル曲や歌ってみた、統計情報を閲覧できます。",
  openGraph: {
    title: "タレント一覧 | HoloSong DB",
    description: "ホロライブの全タレント一覧",
    url: "https://www.holosongdb.com/talents",
    siteName: "HoloSong DB",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "HoloSong DB - タレント一覧",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "タレント一覧 | HoloSong DB",
    description: "ホロライブの全タレント一覧",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://www.holosongdb.com/talents",
  },
}

export default function TalentsPage() {
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "タレント一覧",
    description: "ホロライブプロダクションの全タレント一覧",
    url: "https://www.holosongdb.com/talents",
    inLanguage: "ja",
    isPartOf: {
      "@type": "WebSite",
      name: "HoloSong DB",
      url: "https://www.holosongdb.com",
    },
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "ホーム", url: "https://www.holosongdb.com" },
    { name: "タレント一覧", url: "https://www.holosongdb.com/talents" },
  ])

  return (
    <div className="min-h-screen bg-background flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="container mx-auto px-4 py-8 flex-1">
        <OfflineBanner />

        <DynamicBreadcrumb />

        <div className="space-y-8">
          <Suspense
            fallback={
              <div className="space-y-8">
                {Array.from({ length: 3 }).map((_, branchIdx) => (
                  <div key={branchIdx} className="space-y-4">
                    <div className="h-8 w-32 bg-muted animate-pulse rounded" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <div className="flex items-start gap-3">
                              <div className="w-16 h-16 bg-muted animate-pulse rounded-full" />
                              <div className="flex-1 space-y-2">
                                <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                                <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            }
          >
            <TalentList />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
