"use client"

import { useEffect, useState } from "react"
import { SongCard } from "@/components/song-card"
import { SongCardSkeleton } from "@/components/song-card-skeleton"
import { ErrorDisplay } from "@/components/error-display"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"
import Link from "next/link"
import type { Song } from "@/types/song"
import type { SongDatabaseRow } from "@/types/database"
import type { ApiError } from "@/lib/api-utils"

interface SongResponse {
  songs: SongDatabaseRow[]
  totalCount: number
  hasMore: boolean
}

export function TopSongsSection() {
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchTopSongs = async () => {
      try {
        setIsLoading(true)
        const params = new URLSearchParams({
          limit: "10",
          offset: "0",
          sortBy: "viewCount",
          sortOrder: "desc",
        })

        const response = await fetch(`/api/songs/search?${params.toString()}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data: SongResponse = await response.json()
        if (data.error) {
          throw new Error(data.error)
        }

        const transformedSongs: Song[] = data.songs.map((song: SongDatabaseRow) => ({
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
        }))

        setSongs(transformedSongs)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch top songs"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopSongs()
  }, [])

  const formatViewCount = (viewCount: bigint | null) => {
    if (!viewCount) return "N/A"
    const n = Number(viewCount)
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toLocaleString()
  }

  if (isLoading) {
    return (
      <section className="py-12 sm:py-16">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">トップ10楽曲</h2>
            </div>
            <Link href="/popular">
              <Button variant="outline" size="sm">
                もっと見る
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <SongCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    const apiError: ApiError = {
      message: error.message || "トップ楽曲の読み込みに失敗しました",
      isNetworkError: false,
      isOffline: false,
    }

    return (
      <section className="py-12 sm:py-16">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">トップ10楽曲</h2>
          </div>
          <ErrorDisplay error={apiError} onRetry={() => window.location.reload()} showCacheInfo={false} />
        </div>
      </section>
    )
  }

  if (songs.length === 0) {
    return null
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">トップ10楽曲</h2>
          </div>
          <Link href="/popular">
            <Button variant="outline" size="sm">
              もっと見る
            </Button>
          </Link>
        </div>
        <p className="text-muted-foreground">最も再生されている人気楽曲をチェックしよう</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {songs.map((song, index) => (
            <div key={song.id} className="relative">
              <div className="absolute -top-2 -left-2 z-10 bg-background border border-border rounded-full h-8 w-8 flex items-center justify-center shadow-lg">
                <span className="text-sm font-bold text-primary">{index + 1}</span>
              </div>
              <div className="absolute bottom-2 right-2 z-10 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-2 py-1">
                <div className="text-xs font-medium text-foreground">{formatViewCount(song.viewCount)}</div>
              </div>
              <SongCard song={song} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
