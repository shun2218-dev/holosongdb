"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, SortAsc, SortDesc, WifiOff, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { useDismissibleBanner } from "@/hooks/use-dismissible-banner"

interface SongSearchProps {
  onOfflineSearch?: (params: {
    query: string
    sortBy: string
    sortOrder: "asc" | "desc"
    songType: string
  }) => void
}

export function SongSearch({ onOfflineSearch }: SongSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOnline = useOnlineStatus()

  const { isDismissed: isOfflineBannerDismissed, dismiss: dismissOfflineBanner } = useDismissibleBanner({
    key: "offline-search",
    resetTrigger: isOnline, // オンライン状態が変わったらリセット
  })

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "releaseDate")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
  )
  const [songType, setSongType] = useState(searchParams.get("type") || "all")

  const handleSearch = () => {
    if (!isOnline && onOfflineSearch) {
      onOfflineSearch({
        query: searchQuery,
        sortBy,
        sortOrder,
        songType,
      })
      return
    }

    if (!isOnline) {
      return
    }

    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (sortBy !== "releaseDate") params.set("sortBy", sortBy)
    if (sortOrder !== "desc") params.set("sortOrder", sortOrder)
    if (songType !== "all") params.set("type", songType)

    router.push(`/search?${params.toString()}`)
  }

  return (
    <Card className="p-6 space-y-6">
      {!isOnline && !isOfflineBannerDismissed && (
        <div className="flex items-center justify-between gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-800">オフライン中：キャッシュされたデータ内で検索します</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={dismissOfflineBanner}
            className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="楽曲タイトル、タレント、作詞作曲者で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={songType} onValueChange={setSongType}>
              <SelectTrigger id="song-type-select" className="w-40">
                <SelectValue placeholder="楽曲タイプ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="ORIGINAL">オリジナル曲</SelectItem>
                <SelectItem value="COVER">歌ってみた</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">並び順:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort-by-select" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="releaseDate">リリース日</SelectItem>
                <SelectItem value="viewCount">再生数</SelectItem>
                <SelectItem value="likeCount">評価数</SelectItem>
                <SelectItem value="commentCount">コメント数</SelectItem>
                <SelectItem value="title">タイトル</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3"
            >
              {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </Button>
          </div>

          <Button onClick={handleSearch} className="ml-auto">
            {!isOnline ? "フィルター" : "検索"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
