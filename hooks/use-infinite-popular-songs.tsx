"use client"

import useSWRInfinite from "swr/infinite"
import type { Song } from "@/types/song"
import type { SongDatabaseRow } from "@/types/database"

interface SongResponse {
  songs: SongDatabaseRow[]
  totalCount: number
  hasMore: boolean
}

const ITEMS_PER_PAGE = 24

// Fetcher function for SWR
const fetcher = async (url: string): Promise<SongResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()
  if (data.error) {
    throw new Error(data.error)
  }
  return data
}

// Key generator for SWR infinite - specifically for popular songs (sorted by viewCount desc)
const getKey = (pageIndex: number, previousPageData: SongResponse | null) => {
  // If we've reached the end, return null to stop fetching
  if (previousPageData && !previousPageData.hasMore) return null

  const params = new URLSearchParams({
    limit: ITEMS_PER_PAGE.toString(),
    offset: (pageIndex * ITEMS_PER_PAGE).toString(),
    sortBy: "viewCount",
    sortOrder: "desc",
  })

  return `/api/songs/search?${params.toString()}`
}

export function useInfinitePopularSongs() {
  const { data, error, size, setSize, isValidating, isLoading, mutate } = useSWRInfinite<SongResponse>(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateAll: false,
      persistSize: true,
      parallel: false,
    },
  )

  // Transform the data
  const songs: Song[] = data
    ? data.flatMap((page) =>
        page.songs.map(
          (song: SongDatabaseRow): Song => ({
            id: song.id,
            title: song.title,
            titleJp: song.titleJp,
            titleEn: song.titleEn,
            type: song.type as "ORIGINAL" | "COVER" | "COLLABORATION",
            videoId: song.videoId,
            videoUrl: song.videoUrl,
            releaseDate: song.releaseDate ? new Date(song.releaseDate) : null,
            viewCount: song.viewCount ? BigInt(song.viewCount) : null,
            likeCount: song.likeCount ? BigInt(song.likeCount) : null,
            commentCount: song.commentCount ? BigInt(song.commentCount) : null,
            lyrics: song.lyrics,
            composer: song.composer,
            arranger: song.arranger,
            mixer: song.mixer,
            illustrator: song.illustrator,
            description: song.description,
            tags: song.tags || [],
            language: song.language,
            talents: song.talents || [],
          }),
        ),
      )
    : []

  const totalCount = data?.[0]?.totalCount || 0
  const hasMore = data ? (data[data.length - 1]?.hasMore ?? songs.length < totalCount) : false
  const isLoadingMore = isValidating && size > 0 && data && typeof data[size - 1] === "undefined"

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      setSize(size + 1)
    }
  }

  const refresh = () => {
    mutate()
  }

  return {
    songs,
    totalCount,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    loadMore,
    refresh,
  }
}
