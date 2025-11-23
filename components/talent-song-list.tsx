"use client"

import { useEffect, useRef } from "react"
import { SongCard } from "@/components/song-card"
import { SongCardSkeleton } from "@/components/song-card-skeleton"
import { ErrorDisplay } from "@/components/error-display"
import { ButtonLoading } from "@/components/ui/loading"
import { useInfiniteSongs } from "@/hooks/use-infinite-songs"
import type { ApiError } from "@/lib/api-utils"

interface TalentSongListProps {
  talentName: string
  songType: "ORIGINAL" | "COVER"
}

export function TalentSongList({ talentName, songType }: TalentSongListProps) {
  const { songs, totalCount, hasMore, isLoadingMore, error, loadMore, refresh, isInitialLoading } = useInfiniteSongs({
    q: talentName,
    sortBy: "releaseDate",
    sortOrder: "desc",
    type: songType,
  })

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = loadingRef.current
    if (!element) {
      return
    }

    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [target] = entries
        if (target.isIntersecting && hasMore && !isLoadingMore) {
          loadMore()
        }
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      },
    )

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, isLoadingMore, loadMore])

  if (isInitialLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SongCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    const apiError: ApiError = {
      message: error.message || "楽曲データの読み込みに失敗しました",
      isNetworkError: false,
      isOffline: false,
    }

    return (
      <div className="py-8">
        <ErrorDisplay error={apiError} onRetry={refresh} showCacheInfo={false} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-foreground">
          {songType === "ORIGINAL" ? "オリジナル曲" : "歌ってみた"} ({totalCount.toLocaleString()}件)
        </h3>
      </div>

      {songs.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>

          {hasMore && (
            <div ref={loadingRef} className="text-center pt-8">
              {isLoadingMore && (
                <div className="flex flex-col items-center justify-center gap-3 py-6">
                  <ButtonLoading size="md" />
                  <span className="text-muted-foreground text-base">読み込み中...</span>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {songType === "ORIGINAL" ? "オリジナル曲" : "歌ってみた"}がまだ登録されていません。
          </p>
        </div>
      )}
    </div>
  )
}
