"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Save, Search, Download, AlertCircle, CheckCircle } from "lucide-react"

interface Talent {
  id: string
  name: string
  nameJp: string | null
  nameEn: string | null
  branch: string
  generation: string | null
  channelId?: string | null
  debut?: string
}

interface Song {
  id: string
  title: string
  titleJp: string | null
  titleEn: string | null
  type: "ORIGINAL" | "COVER"
  videoId: string | null
  videoUrl: string | null
  releaseDate: string | null
  viewCount: string | null
  likeCount: string | null
  commentCount: string | null
  lyrics: string | null
  composer: string | null
  arranger: string | null
  mixer: string | null
  illustrator: string | null
  description: string | null
  tags: string[]
  language: string | null
  talentId: string
  talent: Talent
  talents?: Talent[]
  isGroupSong?: boolean
}

interface SearchResult {
  videoId: string
  title: string
  description: string
  channelTitle: string
  publishedAt: string
  thumbnail: string
  url: string
}

interface SongEditModalProps {
  isOpen: boolean
  onClose: () => void
  song: Song | null
  talents: Talent[]
  onSave: () => void
}

export function SongEditModal({ isOpen, onClose, song, talents, onSave }: SongEditModalProps) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isAutoFilling, setIsAutoFilling] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    titleJp: "",
    titleEn: "",
    type: "ORIGINAL" as "ORIGINAL" | "COVER",
    videoId: "",
    videoUrl: "",
    releaseDate: "",
    viewCount: "",
    likeCount: "",
    commentCount: "",
    lyrics: "",
    composer: "",
    arranger: "",
    mixer: "",
    illustrator: "",
    description: "",
    tags: "",
    language: "ja",
    talentIds: [] as string[],
    isGroupSong: false,
  })

  useEffect(() => {
    if (song) {
      setFormData({
        title: song.title,
        titleJp: song.titleJp || "",
        titleEn: song.titleEn || "",
        type: song.type,
        videoId: song.videoId || "",
        videoUrl: song.videoUrl || "",
        releaseDate: song.releaseDate ? song.releaseDate.split("T")[0] : "",
        viewCount: song.viewCount || "",
        likeCount: song.likeCount || "",
        commentCount: song.commentCount || "",
        lyrics: song.lyrics || "",
        composer: song.composer || "",
        arranger: song.arranger || "",
        mixer: song.mixer || "",
        illustrator: song.illustrator || "",
        description: song.description || "",
        tags: song.tags.join(", "),
        language: song.language || "ja",
        talentIds: song.talents ? song.talents.map((t) => t.id) : [song.talentId],
        isGroupSong: song.isGroupSong || false,
      })
    } else {
      setFormData({
        title: "",
        titleJp: "",
        titleEn: "",
        type: "ORIGINAL",
        videoId: "",
        videoUrl: "",
        releaseDate: "",
        viewCount: "",
        likeCount: "",
        commentCount: "",
        lyrics: "",
        composer: "",
        arranger: "",
        mixer: "",
        illustrator: "",
        description: "",
        tags: "",
        language: "ja",
        talentIds: [],
        isGroupSong: false,
      })
    }
    setMessage(null)
    setSearchQuery("")
    setSearchResults([])
    setShowSearchResults(false)
  }, [song, isOpen])

  const sortTalentsByBranchAndDebut = (talents: Talent[]) => {
    return [...talents].sort((a, b) => {
      const getBranchOrder = (branch: string) => {
        switch (branch) {
          case "JP":
            return 1
          case "DEV_IS":
            return 2
          case "EN":
            return 3
          case "ID":
            return 4
          default:
            return 999
        }
      }

      const branchOrderA = getBranchOrder(a.branch)
      const branchOrderB = getBranchOrder(b.branch)

      if (branchOrderA !== branchOrderB) {
        return branchOrderA - branchOrderB
      }

      if (a.debut && b.debut) {
        return new Date(a.debut).getTime() - new Date(b.debut).getTime()
      }

      return a.name.localeCompare(b.name)
    })
  }

  const sortedTalents = sortTalentsByBranchAndDebut(talents)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setMessage({ type: "error", text: "検索クエリを入力してください" })
      return
    }

    setIsSearching(true)
    setMessage(null)

    try {
      const selectedTalents = talents.filter((t) => formData.talentIds.includes(t.id))
      const channelIds = selectedTalents.map((t) => t.channelId).filter(Boolean)

      const searchUrl = new URL("/api/admin/youtube/search", window.location.origin)
      searchUrl.searchParams.set("q", searchQuery)
      if (channelIds.length === 1) {
        searchUrl.searchParams.set("channelId", channelIds[0]!)
      }
      searchUrl.searchParams.set("maxResults", "10")

      const response = await fetch(searchUrl.toString())

      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.results || [])
        setShowSearchResults(true)
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "検索に失敗しました" })
      }
    } catch (error) {
      console.error("[v0] Error searching YouTube:", error)
      setMessage({ type: "error", text: "検索でエラーが発生しました" })
    } finally {
      setIsSearching(false)
    }
  }

  const handleAutoFill = async (result: SearchResult) => {
    setIsAutoFilling(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/youtube/video/${result.videoId}`)

      if (response.ok) {
        const data = await response.json()
        const video = data.video

        setFormData((prev) => ({
          ...prev,
          title: prev.title || video.title,
          videoId: video.videoId,
          videoUrl: video.url,
          viewCount: video.statistics.viewCount,
          likeCount: video.statistics.likeCount,
          commentCount: video.statistics.commentCount,
          releaseDate: prev.releaseDate || video.publishedAt.split("T")[0],
        }))

        setShowSearchResults(false)
        setMessage({ type: "success", text: "動画情報を自動入力しました" })
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "動画情報の取得に失敗しました" })
      }
    } catch (error) {
      console.error("[v0] Error auto-filling video data:", error)
      setMessage({ type: "error", text: "自動入力でエラーが発生しました" })
    } finally {
      setIsAutoFilling(false)
    }
  }

  const generateSmartTags = () => {
    const tags: string[] = []

    if (formData.type) {
      tags.push(formData.type === "ORIGINAL" ? "オリジナル曲" : "歌ってみた")
    }

    const lyricists = formData.lyrics
      ? formData.lyrics
          .split("、")
          .map((name) => name.trim())
          .filter(Boolean)
      : []
    const composers = formData.composer
      ? formData.composer
          .split("、")
          .map((name) => name.trim())
          .filter(Boolean)
      : []

    const allCreators = [...new Set([...lyricists, ...composers])]
    const sameCreators =
      lyricists.length > 0 &&
      composers.length > 0 &&
      lyricists.length === composers.length &&
      lyricists.every((lyricist) => composers.includes(lyricist))

    if (sameCreators) {
      allCreators.forEach((creator) => tags.push(creator))
    } else {
      lyricists.forEach((lyricist) => tags.push(lyricist))
      composers.forEach((composer) => tags.push(composer))
    }

    formData.talentIds.forEach((talentId) => {
      const talent = talents.find((t) => t.id === talentId)
      if (talent && talent.nameJp) {
        tags.push(talent.nameJp)
      }
    })

    if (formData.releaseDate) {
      const year = new Date(formData.releaseDate).getFullYear()
      tags.push(year.toString())
    }

    return tags
  }

  const getMissingTags = () => {
    const currentTags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
    const smartTags = generateSmartTags()
    return smartTags.filter((smartTag) => !currentTags.includes(smartTag))
  }

  const handleAutoFillTags = () => {
    const missingTags = getMissingTags()
    const currentTags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
    const allTags = [...currentTags, ...missingTags]
    const uniqueTags = [...new Set(allTags.map((tag) => tag.toLowerCase()))]
      .map((lowerTag) => allTags.find((tag) => tag.toLowerCase() === lowerTag))
      .filter(Boolean)

    setFormData((prev) => ({
      ...prev,
      tags: uniqueTags.join(", "),
    }))
  }

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
    const uniqueTags = [...new Set(tags.map((tag) => tag.toLowerCase()))]
      .map((lowerTag) => tags.find((tag) => tag.toLowerCase() === lowerTag))
      .filter(Boolean)

    setFormData({ ...formData, tags: uniqueTags.join(", ") })
  }

  const handleTalentToggle = (talentId: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        talentIds: [...prev.talentIds, talentId],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        talentIds: prev.talentIds.filter((id) => id !== talentId),
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!formData.title || formData.talentIds.length === 0) {
      setMessage({ type: "error", text: "タイトルと少なくとも1つのタレントは必須です" })
      return
    }

    try {
      const url = song ? `/api/admin/songs/${song.id}` : "/api/admin/songs"
      const method = song ? "PUT" : "POST"

      let extractedVideoId = formData.videoId
      if (formData.videoUrl && !extractedVideoId) {
        const videoIdMatch = formData.videoUrl.match(
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        )
        if (videoIdMatch) {
          extractedVideoId = videoIdMatch[1]
        }
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          videoId: extractedVideoId,
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          viewCount: formData.viewCount ? Number.parseInt(formData.viewCount) : null,
          likeCount: formData.likeCount ? Number.parseInt(formData.likeCount) : null,
          commentCount: formData.commentCount ? Number.parseInt(formData.commentCount) : null,
        }),
      })

      if (response.ok) {
        setMessage({
          type: "success",
          text: song ? "楽曲を更新しました" : "楽曲を追加しました",
        })
        onSave()
        setTimeout(() => {
          onClose()
        }, 1000)
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "保存に失敗しました" })
      }
    } catch (error) {
      console.error("[v0] Error saving song:", error)
      setMessage({ type: "error", text: "ネットワークエラーが発生しました" })
    }
  }

  const missingTags = getMissingTags()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{song ? "楽曲を編集" : "新しい楽曲を追加"}</DialogTitle>
          <DialogDescription>
            {song
              ? "楽曲の情報を編集できます。"
              : "新しい楽曲を追加できます。YouTube検索アシストを使用して動画情報を自動入力することも可能です。"}
          </DialogDescription>
        </DialogHeader>

        {message && (
          <Alert className={`mb-4 ${message.type === "error" ? "border-destructive" : "border-green-500"}`}>
            {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 p-4 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-medium mb-4">YouTube検索アシスト</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="youtube-search">楽曲検索</Label>
              <div className="flex gap-2">
                <Input
                  id="youtube-search"
                  placeholder="楽曲名やキーワードを入力..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                  <Search className="h-4 w-4" />
                  <span className="ml-2">{isSearching ? "検索中..." : "検索"}</span>
                </Button>
              </div>
            </div>

            {formData.talentIds.length > 0 && (
              <div className="text-sm text-muted-foreground">
                選択されたタレント:{" "}
                {formData.talentIds
                  .map((id) => {
                    const talent = talents.find((t) => t.id === id)
                    return talent ? talent.nameJp || talent.name : ""
                  })
                  .join(", ")}
                {formData.talentIds.length === 1 &&
                  talents.find((t) => t.id === formData.talentIds[0])?.channelId &&
                  " (チャンネル内検索)"}
              </div>
            )}

            {showSearchResults && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <h4 className="font-medium">検索結果 ({searchResults.length}件)</h4>
                {searchResults.map((result) => (
                  <div key={result.videoId} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
                    <img
                      src={result.thumbnail || "/placeholder.svg"}
                      alt={result.title}
                      className="w-20 h-15 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm line-clamp-2">{result.title}</h5>
                      <p className="text-xs text-muted-foreground">{result.channelTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(result.publishedAt).toLocaleDateString("ja-JP")}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => handleAutoFill(result)} disabled={isAutoFilling}>
                      <Download className="h-4 w-4" />
                      <span className="ml-1">自動入力</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">楽曲タイトル *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">楽曲タイプ</Label>
              <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ORIGINAL">オリジナル</SelectItem>
                  <SelectItem value="COVER">歌ってみた</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isGroupSong"
                  name="isGroupSong"
                  checked={formData.isGroupSong}
                  onCheckedChange={(checked) => setFormData({ ...formData, isGroupSong: checked as boolean })}
                />
                <Label htmlFor="isGroupSong" className="text-sm font-normal cursor-pointer">
                  全体曲（タレント統計から除外）
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                チェックすると、この楽曲は個別タレントの統計データから除外されます
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>タレント * (複数選択可能)</Label>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 max-h-48 overflow-y-auto border rounded-md p-4">
              {sortedTalents.map((talent) => (
                <div key={talent.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`talent-${talent.id}`}
                    name={`talent-${talent.id}`}
                    checked={formData.talentIds.includes(talent.id)}
                    onCheckedChange={(checked) => handleTalentToggle(talent.id, checked as boolean)}
                    aria-labelledby={`talent-label-${talent.id}`}
                  />
                  <Label
                    htmlFor={`talent-${talent.id}`}
                    id={`talent-label-${talent.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {talent.nameJp || talent.name} ({talent.branch})
                  </Label>
                </div>
              ))}
            </div>
            {formData.talentIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.talentIds.map((talentId) => {
                  const talent = talents.find((t) => t.id === talentId)
                  return talent ? (
                    <Badge key={talentId} variant="secondary" className="text-xs">
                      {talent.nameJp || talent.name}
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="titleJp">日本語タイトル</Label>
              <Input
                id="titleJp"
                value={formData.titleJp}
                onChange={(e) => setFormData({ ...formData, titleJp: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleEn">英語タイトル</Label>
              <Input
                id="titleEn"
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">動画URL</Label>
              <Input
                id="videoUrl"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="releaseDate">リリース日</Label>
              <Input
                id="releaseDate"
                type="date"
                value={formData.releaseDate}
                onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="viewCount">再生数</Label>
              <Input
                id="viewCount"
                type="number"
                value={formData.viewCount}
                onChange={(e) => setFormData({ ...formData, viewCount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="likeCount">評価数</Label>
              <Input
                id="likeCount"
                type="number"
                value={formData.likeCount}
                onChange={(e) => setFormData({ ...formData, likeCount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commentCount">コメント数</Label>
              <Input
                id="commentCount"
                type="number"
                value={formData.commentCount}
                onChange={(e) => setFormData({ ...formData, commentCount: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lyrics">作詞者</Label>
              <Input
                id="lyrics"
                value={formData.lyrics}
                onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="composer">作曲者</Label>
              <Input
                id="composer"
                value={formData.composer}
                onChange={(e) => setFormData({ ...formData, composer: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">タグ (カンマ区切り)</Label>
            <div className="space-y-2">
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleTagsChange(e.target.value)}
                placeholder="オリジナル曲, アオワイファイ, ときのそら, 2025"
              />

              {missingTags.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">自動入力可能なタグ:</p>
                    <p className="text-sm text-muted-foreground">{missingTags.join(", ")}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleAutoFillTags}>
                    <Plus className="h-4 w-4" />
                    <span className="ml-1">タグを追加</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">
              <Save className="h-4 w-4" />
              <span className="ml-2">{song ? "更新" : "追加"}</span>
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
