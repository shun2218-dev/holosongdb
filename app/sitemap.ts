import type { MetadataRoute } from "next"
import { sql } from "@/lib/db"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.holosongdb.com"

  const talents = await sql`
    SELECT id, updated_at
    FROM talents
    WHERE active = true
    ORDER BY id
  `

  const talentPages: MetadataRoute.Sitemap = talents.map((talent) => ({
    url: `${baseUrl}/talents/${talent.id}`,
    lastModified: talent.updated_at ? new Date(talent.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  const talentStatsPages: MetadataRoute.Sitemap = talents.map((talent) => ({
    url: `${baseUrl}/talents/${talent.id}/stats`,
    lastModified: talent.updated_at ? new Date(talent.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/popular`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/talents`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...talentPages,
    ...talentStatsPages,
    {
      url: `${baseUrl}/settings/oshi`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/settings/notifications`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]
}
