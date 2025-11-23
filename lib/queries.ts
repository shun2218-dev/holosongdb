import { sql } from "./db"
import type { Song } from "@/types/song"
import type { SongType } from "@prisma/client"

export async function getSongById(id: string): Promise<Song | null> {
  const result = await sql`
    SELECT 
      s.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', t.id,
            'name', t.name,
            'nameJp', t.name_jp,
            'nameEn', t.name_en,
            'branch', t.branch,
            'generation', t.generation,
            'channelId', t.channel_id,
            'imageUrl', t.image_url
          )
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) as talents
    FROM songs s
    LEFT JOIN song_talents st ON s.id = st.song_id
    LEFT JOIN talents t ON st.talent_id = t.id
    WHERE s.id = ${id}
    GROUP BY s.id
  `

  if (result.length === 0) {
    return null
  }

  const row = result[0]

  return {
    id: row.id,
    title: row.title,
    titleJp: row.title_jp,
    titleEn: row.title_en,
    type: row.type as SongType,
    videoId: row.video_id,
    videoUrl: row.video_url,
    releaseDate: row.release_date ? new Date(row.release_date) : null,
    duration: row.duration,
    viewCount: row.view_count ? BigInt(row.view_count) : null,
    likeCount: row.like_count ? BigInt(row.like_count) : null,
    commentCount: row.comment_count ? BigInt(row.comment_count) : null,
    lyrics: row.lyrics,
    composer: row.composer,
    arranger: row.arranger,
    mixer: row.mixer,
    illustrator: row.illustrator,
    description: row.description,
    tags: row.tags || [],
    language: row.language,
    talentId: row.talent_id,
    talents: row.talents || [],
  }
}
