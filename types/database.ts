import type { BaseEntity } from "./common"

// Database row types (string representations from SQL queries)
export interface SongDatabaseRow extends BaseEntity {
  title: string
  title_jp: string | null
  title_en: string | null
  type: string
  video_id: string | null
  video_url: string | null
  release_date: string | null
  view_count: string | null
  like_count: string | null
  comment_count: string | null
  lyrics: string | null
  composer: string | null
  arranger: string | null
  mixer: string | null
  illustrator: string | null
  description: string | null
  tags: string[]
  language: string | null
  talents: TalentReference[]
}

export interface TalentReference {
  id: string
  name: string
  name_jp: string | null
  name_en: string | null
  branch: string
}

export interface TalentDatabaseRow extends BaseEntity {
  name: string
  name_jp: string | null
  name_en: string | null
  branch: string
  main_color: string | null
  subscriber_count: string | null
  total_views: string | null
  total_songs: number | null
  average_views: number | null
}
