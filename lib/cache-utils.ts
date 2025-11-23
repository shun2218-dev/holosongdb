import { revalidateTag, revalidatePath } from "next/cache"

// キャッシュタグの定義
export const CACHE_TAGS = {
  SONGS: "songs",
  TALENTS: "talents",
  ANALYTICS: "analytics",
  ADMIN_DATA: "admin-data",
  YOUTUBE_STATS: "youtube-stats",
} as const

// キャッシュ無効化ヘルパー関数
export async function invalidateCache(tags: string | string[]) {
  const tagArray = Array.isArray(tags) ? tags : [tags]

  for (const tag of tagArray) {
    revalidateTag(tag)
  }
}

// パス再検証ヘルパー関数
export async function invalidatePath(path: string) {
  revalidatePath(path)
}

// 楽曲関連のキャッシュを無効化
export async function invalidateSongsCache() {
  await invalidateCache([CACHE_TAGS.SONGS, CACHE_TAGS.ANALYTICS])
  await invalidatePath("/api/songs/search")
  await invalidatePath("/")
  await invalidatePath("/search")
  await invalidatePath("/popular")
}

export async function invalidateSongPage(songId: string) {
  await invalidatePath(`/songs/${songId}`)
}

// タレント関連のキャッシュを無効化
export async function invalidateTalentsCache() {
  await invalidateCache([CACHE_TAGS.TALENTS, CACHE_TAGS.ANALYTICS])
  await invalidatePath("/talents")
  await invalidatePath("/admin/talents")
}

export async function invalidateTalentPage(talentId: string) {
  await invalidatePath(`/talents/${talentId}`)
  await invalidatePath(`/talents/${talentId}/stats`)
}

// 統計情報のキャッシュを無効化
export async function invalidateAnalyticsCache() {
  await invalidateCache([CACHE_TAGS.ANALYTICS, CACHE_TAGS.YOUTUBE_STATS])
  await invalidatePath("/admin/analytics")
}

// 管理者データのキャッシュを無効化
export async function invalidateAdminCache() {
  await invalidateCache(CACHE_TAGS.ADMIN_DATA)
  await invalidatePath("/admin")
}
