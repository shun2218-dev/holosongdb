import type { Song as PrismaSong, Talent as PrismaTalent } from "@prisma/client"

// Re-export Prisma types with any necessary extensions
export interface Song
  extends Omit<PrismaSong, "viewCount" | "likeCount" | "commentCount" | "releaseDate" | "createdAt" | "updatedAt"> {
  // Convert bigint to bigint for proper handling
  view_count: bigint | null
  like_count: bigint | null
  comment_count: bigint | null
  release_date: Date | null
  created_at?: Date
  updated_at?: Date
  // Add computed fields
  talents: Talent[]
  is_group_song?: boolean
}

export interface Talent extends Omit<PrismaTalent, "subscriberCount" | "totalViews" | "createdAt" | "updatedAt"> {
  // Convert bigint to bigint for proper handling
  subscriber_count?: bigint | null
  total_views?: bigint | null
  total_songs?: number | null
  average_views?: number | null
  created_at?: Date
  updated_at?: Date
}

// Re-export Prisma enum
export { SongType } from "@prisma/client"

export interface SearchResult {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  channelTitle: string
  publishedAt: string
  videoId: string
  viewCount?: string
  likeCount?: string
  commentCount?: string
}
