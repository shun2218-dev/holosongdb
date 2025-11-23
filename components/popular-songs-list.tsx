"use client"

import { useEffect, useRef } from "react"
import { SongCard } from "@/components/song-card"
import { SongCardSkeleton } from "@/components/song-card-skeleton"
import { ErrorDisplay } from "@/components/error-display"
import { ButtonLoading } from "@/components/ui/loading"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useInfinitePopularSongs } from "@/hooks/use-infinite-popular-songs"
import type { ApiError } from "@/lib/api-utils"
import { Trophy, Medal, Award } from "lucide-react"

export function PopularSongsList() {
  const isOnline = useOnlineStatus()

  const { songs, totalCount, hasMore, isLoading, isLoadingMore, error, loadMore, refresh } = useInfinitePopularSongs()

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = loadingRef.current
    if (!element || !isOnline) return

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
        rootMargin: "100px",
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

  const handleRetry = () => {
    refresh()
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />
    return <span className="text-xl font-bold text-muted-foreground w-6 text-center">{index + 1}</span>
  }

  const formatViewCount = (viewCount: bigint | null) => {
    if (!viewCount) return "N/A"
    const n = Number(viewCount)
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toLocaleString()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-primary/20 animate-pulse rounded" />
          <div className="h-6 w-20 bg-primary/20 animate-pulse rounded" />
        </div>

        {/* Top 3 skeleton */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="relative">
              <div className="absolute -top-2 -left-2 z-10 bg-background border border-border rounded-full p-2 shadow-lg">
                <div className="h-6 w-6 bg-primary/20 animate-pulse rounded" />
              </div>
              <div className="absolute bottom-2 left-2 z-10 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1">
                <div className="h-4 w-12 bg-primary/20 animate-pulse rounded mb-1" />
                <div className="h-3 w-16 bg-primary/20 animate-pulse rounded" />
              </div>
              <SongCardSkeleton />
            </div>
          ))}
        </div>

        {/* 4th and below skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-24 bg-primary/20 animate-pulse rounded border-b border-border pb-2" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="relative">
                <div className="absolute top-2 left-2 z-10 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-2 py-1">
                  <div className="h-4 w-4 bg-primary/20 animate-pulse rounded" />
                </div>
                <SongCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    const apiError: ApiError = {
      message: error.message || "人気楽曲データの読み込みに失敗しました",
      isNetworkError: false,
      isOffline: !isOnline,
    }

    return (
      <div className="py-8">
        <ErrorDisplay error={apiError} onRetry={handleRetry} showCacheInfo={true} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">人気楽曲ランキング ({totalCount.toLocaleString()}件)</h2>
        <div className="text-sm text-muted-foreground">再生回数順</div>
      </div>

      {songs.length > 0 ? (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {songs.slice(0, 3).map((song, index) => (
              <div key={song.id} className="relative flex min-w-0">
                <div className="absolute -top-2 -left-2 z-10 bg-background border border-border rounded-full p-2 shadow-lg">
                  {getRankIcon(index)}
                </div>
                <div className="absolute bottom-2 left-2 z-10 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-3 py-1">
                  <div className="text-sm font-medium text-foreground">{formatViewCount(song.viewCount)}</div>
                  <div className="text-xs text-muted-foreground">再生回数</div>
                </div>
                <div className="relative flex-1 w-full">
                  <SongCard song={song} />
                </div>
              </div>
            ))}
          </div>

          {songs.length > 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">4位以降</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
                {songs.slice(3).map((song, index) => (
                  <div key={song.id} className="relative flex min-w-0">
                    <div className="absolute -top-2 -left-2 z-10 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-2 py-1 shadow-lg">
                      <span className="text-sm font-bold text-muted-foreground">{index + 4}</span>
                    </div>
                    <div className="relative flex-1 w-full">
                      <SongCard song={song} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasMore && (
            <div ref={loadingRef} className="text-center py-12 pb-16">
              {isLoadingMore && (
                <div className="flex flex-col items-center justify-center gap-3">
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
          <p className="text-muted-foreground">人気楽曲データがありません。</p>
          <p className="text-sm text-muted-foreground mt-2">楽曲データが準備中です。しばらくお待ちください。</p>
        </div>
      )}
    </div>
  )
}
