import { Suspense } from "react"
import { notFound } from "next/navigation"
import { TalentStatsContent } from "@/components/talent-stats-content"
import { OfflineBanner } from "@/components/offline-banner"
import { Card, CardContent } from "@/components/ui/card"
import type { Metadata } from "next"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"
import { generatePersonSchema, generateBreadcrumbSchema } from "@/lib/structured-data"

interface TalentStatsPageProps {
  params: {
    id: string
  }
}

async function getTalentName(id: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/talents/${id}/stats`,
      {
        cache: "no-store",
      },
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.talent.nameJp || data.talent.nameEn || data.talent.name
  } catch (error) {
    console.error("[v0] Error fetching talent name:", error)
    return null
  }
}

export async function generateMetadata({ params }: TalentStatsPageProps): Promise<Metadata> {
  const talentName = await getTalentName(params.id)

  if (!talentName) {
    return {
      title: "統計情報 | HoloSong DB",
    }
  }

  return {
    title: `${talentName} - 統計情報 | HoloSong DB`,
    description: `${talentName}の楽曲統計情報。総再生数、楽曲数、人気楽曲などの詳細データを閲覧できます。`,
    openGraph: {
      title: `${talentName} - 統計情報 | HoloSong DB`,
      description: `${talentName}の楽曲統計情報`,
      url: `https://www.holosongdb.com/talents/${params.id}/stats`,
      siteName: "HoloSong DB",
      type: "profile",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${talentName} - 統計情報 - HoloSong DB`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${talentName} - 統計情報 | HoloSong DB`,
      description: `${talentName}の楽曲統計情報`,
      images: ["/og-image.jpg"],
    },
    alternates: {
      canonical: `https://www.holosongdb.com/talents/${params.id}/stats`,
    },
  }
}

export default async function TalentStatsPage({ params }: TalentStatsPageProps) {
  const talentName = await getTalentName(params.id)

  if (!talentName) {
    notFound()
  }

  const personSchema = generatePersonSchema(talentName, params.id, null)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "ホーム", url: "https://www.holosongdb.com" },
    { name: "タレント一覧", url: "https://www.holosongdb.com/talents" },
    { name: talentName, url: `https://www.holosongdb.com/talents/${params.id}` },
    { name: "統計情報", url: `https://www.holosongdb.com/talents/${params.id}/stats` },
  ])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="container mx-auto px-4 py-8 flex-1">
        <OfflineBanner />

        <DynamicBreadcrumb />

        <div className="space-y-8">
          <Suspense
            fallback={
              <div className="space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="h-64 bg-muted animate-pulse rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            }
          >
            <TalentStatsContent talentId={params.id} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
