import { Suspense } from "react"
import { notFound } from "next/navigation"
import { sql } from "@/lib/db"
import { TalentHeader } from "@/components/talent-header"
import { TalentSongLists } from "@/components/talent-song-lists"
import { OfflineBanner } from "@/components/offline-banner"
import { SongCardSkeleton } from "@/components/song-card-skeleton"
import type { Metadata } from "next"
import { generatePersonSchema, generateBreadcrumbSchema } from "@/lib/structured-data"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface TalentPageProps {
  params: {
    id: string
  }
}

async function getTalent(id: string) {
  try {
    const result = await sql`
      SELECT 
        t.id,
        t.name,
        t.name_jp,
        t.name_en,
        t.branch,
        t.generation,
        t.debut,
        t.active,
        t.channel_id,
        t.subscriber_count,
        t.main_color,
        t.image_url,
        t.blur_data_url,
        COUNT(DISTINCT CASE WHEN s.type = 'ORIGINAL' THEN s.id END) as original_count,
        COUNT(DISTINCT CASE WHEN s.type = 'COVER' THEN s.id END) as cover_count,
        COUNT(DISTINCT s.id) as total_songs
      FROM talents t
      LEFT JOIN song_talents st ON t.id = st.talent_id
      LEFT JOIN songs s ON st.song_id = s.id
      WHERE t.id = ${id} AND t.active = true
      GROUP BY t.id
    `

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error) {
    console.error("[v0] Error fetching talent:", error)
    return null
  }
}

export async function generateMetadata({ params }: TalentPageProps): Promise<Metadata> {
  const talent = await getTalent(params.id)

  if (!talent) {
    return {
      title: "タレントが見つかりません | HoloSong DB",
    }
  }

  const displayName = talent.name_jp || talent.name_en || talent.name

  return {
    title: `${displayName} | HoloSong DB`,
    description: `${displayName}のオリジナル曲や歌ってみた、統計情報を閲覧できます。`,
    openGraph: {
      title: `${displayName} | HoloSong DB`,
      description: `${displayName}の楽曲一覧`,
      url: `https://www.holosongdb.com/talents/${params.id}`,
      siteName: "HoloSong DB",
      type: "profile",
      images: [
        {
          url: talent.image_url || "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${displayName} - HoloSong DB`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} | HoloSong DB`,
      description: `${displayName}の楽曲一覧`,
      images: [talent.image_url || "/og-image.jpg"],
    },
    alternates: {
      canonical: `https://www.holosongdb.com/talents/${params.id}`,
    },
  }
}

export default async function TalentPage({ params }: TalentPageProps) {
  const talent = await getTalent(params.id)

  if (!talent) {
    notFound()
  }

  const displayName = talent.name_jp || talent.name_en || talent.name

  const personSchema = generatePersonSchema(displayName, params.id, talent.image_url)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "ホーム", url: "https://www.holosongdb.com" },
    { name: "タレント一覧", url: "https://www.holosongdb.com/talents" },
    { name: displayName, url: `https://www.holosongdb.com/talents/${params.id}` },
  ])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="container mx-auto px-4 py-8 flex-1">
        <OfflineBanner />

        <DynamicBreadcrumb />

        <div className="space-y-8">
          <TalentHeader talent={talent} />

          <Suspense
            fallback={
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <SongCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-8 w-48 bg-muted animate-pulse rounded" />
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <SongCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              </div>
            }
          >
            <TalentSongLists talentId={params.id} talentName={displayName} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
