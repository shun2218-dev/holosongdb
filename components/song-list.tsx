"use client"

import { useEffect, useRef } from "react"
import { SongCard } from "@/components/song-card"
import { SongCardSkeleton } from "@/components/song-card-skeleton"
import { SongSearch } from "@/components/song-search"
import { ErrorDisplay } from "@/components/error-display"
import { ButtonLoading } from "@/components/ui/loading"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useOfflineSearch } from "@/hooks/use-offline-search"
import { useInfiniteSongs } from "@/hooks/use-infinite-songs"
import type { ApiError } from "@/lib/api-utils"

interface SongListProps {
  searchParams?: {
    q?: string
    sortBy?: string
    sortOrder?: string
    type?: string
  }
}

export function SongList({ searchParams = {} }: SongListProps) {
  const isOnline = useOnlineStatus()
  const { q = "", sortBy = "releaseDate", sortOrder = "desc", type = "all" } = searchParams

  const { songs, totalCount, hasMore, isLoadingMore, error, loadMore, refresh, isInitialLoading, isValidating } =
    useInfiniteSongs({
      q,
      sortBy,
      sortOrder,
      type,
    })

  const { filteredSongs, updateSearch } = useOfflineSearch(songs)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement | null>(null)

  const isOfflineMode = !isOnline && songs.length > 0

  useEffect(() => {
    if (isOfflineMode) {
      updateSearch({
        query: q,
        sortBy,
        sortOrder: sortOrder as "asc" | "desc",
        songType: type,
      })
    }
  }, [q, sortBy, sortOrder, type, isOfflineMode, updateSearch])

  useEffect(() => {
    const element = loadingRef.current
    if (!element || !isOnline) {
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
  }, [hasMore, isLoadingMore, loadMore, isOnline])

  const handleOfflineSearch = (params: {
    query: string
    sortBy: string
    sortOrder: "asc" | "desc"
    songType: string
  }) => {
    if (isOfflineMode) {
      updateSearch(params)
    }
  }

  const handleRetry = () => {
    if (!isOnline && songs.length > 0) {
      return
    }
    refresh()
  }

  const displaySongs = isOfflineMode ? filteredSongs : songs
  const displayTotalCount = isOfflineMode ? filteredSongs.length : totalCount

  if (isInitialLoading || (isValidating && songs.length === 0)) {
    return (
      <div className="space-y-8">
        <SongSearch onOfflineSearch={handleOfflineSearch} searchParams={searchParams} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">楽曲一覧</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SongCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error && !isOfflineMode) {
    const apiError: ApiError = {
      message: error.message || "楽曲データの読み込みに失敗しました",
      isNetworkError: false,
      isOffline: !isOnline,
    }

    return (
      <div className="space-y-8">
        <SongSearch onOfflineSearch={handleOfflineSearch} searchParams={searchParams} />
        <div className="py-8">
          <ErrorDisplay error={apiError} onRetry={handleRetry} showCacheInfo={true} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <SongSearch onOfflineSearch={handleOfflineSearch} searchParams={searchParams} />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">楽曲一覧 ({displayTotalCount.toLocaleString()}件)</h2>
          {isOfflineMode && (
            <span className="text-sm text-muted-foreground bg-orange-100 px-2 py-1 rounded">オフライン表示</span>
          )}
        </div>

        {displaySongs.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displaySongs.map((song) => (
                <SongCard key={song.id} song={song} />
              ))}
            </div>

            {!isOfflineMode && hasMore && (
              <div ref={loadingRef} className="text-center pt-8 pb-16">
                {isLoadingMore && (
                  <div className="flex flex-col items-center justify-center gap-3 py-6">
                    <ButtonLoading size="md" />
                    <span className="text-muted-foreground text-base">読み込み中...</span>
                  </div>
                )}
                {!isOnline && !isLoadingMore && (
                  <span className="text-muted-foreground">オフライン中（追加読み込み不可）</span>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {q || type !== "all" ? "検索条件に一致する楽曲が見つかりませんでした。" : "楽曲データがありません。"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {isOfflineMode
                ? "オフライン中のため、キャッシュされたデータのみ表示されます。"
                : q || type !== "all"
                  ? "別のキーワードや条件で検索してみてください。"
                  : "楽曲データが準備中です。しばらくお待ちください。"}
            </p>
          </div>
        )}
      </div>
      <div className="pb-8" />
    </div>
  )
}
