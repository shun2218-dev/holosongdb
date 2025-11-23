import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { CACHE_TAGS } from "@/lib/cache-utils"
import type { SongDatabaseRow } from "@/types/database"

export const dynamic = "force-dynamic"
export const revalidate = 300 // 5分間キャッシュ

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const sortBy = searchParams.get("sortBy") || "releaseDate"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const songType = searchParams.get("type") || "all"
    const limit = Number.parseInt(searchParams.get("limit") || "24") // Changed default from 20 to 24 (multiple of 3 and even)
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const getSortColumn = (sortBy: string) => {
      switch (sortBy) {
        case "viewCount":
          return "s.view_count"
        case "likeCount":
          return "s.like_count"
        case "commentCount":
          return "s.comment_count"
        case "title":
          return "s.title"
        case "releaseDate":
        default:
          return "s.release_date"
      }
    }

    const sortColumn = getSortColumn(sortBy)
    const sortDirection = sortOrder === "asc" ? "ASC" : "DESC"
    const nullsHandling = "NULLS LAST"

    let result
    let totalCountResult

    if (query) {
      const searchPattern = `%${query}%`

      totalCountResult = await sql`
        SELECT COUNT(DISTINCT s.id) as total
        FROM songs s
        WHERE (
          EXISTS (
            SELECT 1 FROM song_talents st 
            JOIN talents t ON st.talent_id = t.id 
            WHERE st.song_id = s.id 
            AND (
              t.name ILIKE ${searchPattern} OR 
              t.name_jp ILIKE ${searchPattern}
            )
          )
          OR s.title ILIKE ${searchPattern} 
          OR s.title_jp ILIKE ${searchPattern} 
          OR s.title_en ILIKE ${searchPattern}
          OR s.lyrics ILIKE ${searchPattern}
          OR s.composer ILIKE ${searchPattern}
        )
        ${songType !== "all" ? sql`AND s.type = ${songType}` : sql``}
      `

      result = await sql`
        SELECT 
          s.*,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', t.id,
                'name', t.name,
                'name_jp', t.name_jp,
                'name_en', t.name_en,
                'branch', t.branch
              ) ORDER BY t.name
            ) FILTER (WHERE t.id IS NOT NULL),
            '[]'::json
          ) as talents
        FROM songs s
        LEFT JOIN song_talents st ON s.id = st.song_id
        LEFT JOIN talents t ON st.talent_id = t.id
        WHERE (
          EXISTS (
            SELECT 1 FROM song_talents st2 
            JOIN talents t2 ON st2.talent_id = t2.id 
            WHERE st2.song_id = s.id 
            AND (
              t2.name ILIKE ${searchPattern} OR 
              t2.name_jp ILIKE ${searchPattern}
            )
          )
          OR s.title ILIKE ${searchPattern} 
          OR s.title_jp ILIKE ${searchPattern} 
          OR s.title_en ILIKE ${searchPattern}
          OR s.lyrics ILIKE ${searchPattern}
          OR s.composer ILIKE ${searchPattern}
        )
        ${songType !== "all" ? sql`AND s.type = ${songType}` : sql``}
        GROUP BY s.id
        ORDER BY ${sql.unsafe(`${sortColumn} ${sortDirection} ${nullsHandling}`)}
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      totalCountResult = await sql`
        SELECT COUNT(*) as total
        FROM songs s
        ${songType !== "all" ? sql`WHERE s.type = ${songType}` : sql``}
      `

      result = await sql`
        SELECT 
          s.*,
          COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', t.id,
                'name', t.name,
                'name_jp', t.name_jp,
                'name_en', t.name_en,
                'branch', t.branch
              ) ORDER BY t.name
            ) FILTER (WHERE t.id IS NOT NULL),
            '[]'::json
          ) as talents
        FROM songs s
        LEFT JOIN song_talents st ON s.id = st.song_id
        LEFT JOIN talents t ON st.talent_id = t.id
        ${songType !== "all" ? sql`WHERE s.type = ${songType}` : sql``}
        GROUP BY s.id
        ORDER BY ${sql.unsafe(`${sortColumn} ${sortDirection} ${nullsHandling}`)}
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    let songs = []
    if (Array.isArray(result)) {
      songs = result
    } else if (result && typeof result === "object") {
      songs = [result]
    }

    const totalCount = totalCountResult?.[0]?.total || 0

    const formattedSongs = songs.map((song: SongDatabaseRow) => ({
      id: song.id,
      title: song.title,
      titleJp: song.title_jp,
      titleEn: song.title_en,
      type: song.type,
      videoId: song.video_id,
      videoUrl: song.video_url,
      releaseDate: song.release_date,
      viewCount: song.view_count || 0,
      likeCount: song.like_count || 0,
      commentCount: song.comment_count || 0,
      lyrics: song.lyrics,
      composer: song.composer,
      arranger: song.arranger,
      mixer: song.mixer,
      illustrator: song.illustrator,
      description: song.description,
      tags: song.tags || [],
      language: song.language,
      talents: Array.isArray(song.talents) ? song.talents : [],
    }))

    const headers = new Headers()
    headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600")
    headers.set("CDN-Cache-Control", "public, s-maxage=300")

    const response = NextResponse.json(
      {
        songs: formattedSongs,
        totalCount: Number(totalCount),
        hasMore: offset + formattedSongs.length < Number(totalCount),
      },
      { headers },
    )

    response.headers.set("Cache-Tag", CACHE_TAGS.SONGS)

    return response
  } catch (error) {
    console.error("Error searching songs:", error)
    return NextResponse.json(
      {
        error: "サーバーエラーが発生しました",
        songs: [],
        totalCount: 0,
      },
      { status: 500 },
    )
  }
}
