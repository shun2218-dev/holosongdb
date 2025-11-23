"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SongEditModal } from "@/components/song-edit-modal"
import { Plus, Edit, Trash2, AlertCircle, CheckCircle } from "lucide-react"

interface Admin {
  id: string
  username: string
  role: string
}

interface Talent {
  id: string
  name: string
  nameJp: string | null
  nameEn: string | null
  branch: string
  generation: string | null
  channelId?: string | null
  debut?: string // 新しいフィールド：デビュー日
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
  isGroupSong: boolean // Added isGroupSong field
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

interface SongManagementProps {
  admin: Admin
}

export function SongManagement({ admin }: SongManagementProps) {
  const [songs, setSongs] = useState<Song[]>([])
  const [talents, setTalents] = useState<Talent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSongModal, setEditingSongModal] = useState<Song | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isAutoFilling, setIsAutoFilling] = useState(false)

  // Form state
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
    isGroupSong: false, // Added isGroupSong field to form data
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const cacheBuster = Date.now()
      const [songsRes, talentsRes] = await Promise.all([
        fetch(`/api/admin/songs?_t=${cacheBuster}`, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }),
        fetch(`/api/admin/talents?_t=${cacheBuster}`, {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }),
      ])

      if (songsRes.ok && talentsRes.ok) {
        const songsData = await songsRes.json()
        const talentsData = await talentsRes.json()
        setSongs(songsData.songs || [])
        setTalents(talentsData.talents || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
      setMessage({ type: "error", text: "データの読み込みに失敗しました" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setMessage({ type: "error", text: "検索クエリを入力してください" })
      return
    }

    setIsSearching(true)
    setMessage(null)

    try {
      // Get channel IDs for selected talents
      const selectedTalents = talents.filter((t) => formData.talentIds.includes(t.id))
      const channelIds = selectedTalents.map((t) => t.channelId).filter(Boolean)

      // Search with or without channel restriction
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

        // Auto-fill form data
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

  // 新しい関数：支部優先順位とデビュー日順でタレントをソートする
  const sortTalentsByBranchAndDebut = (talents: Talent[]) => {
    return [...talents].sort((a, b) => {
      // 支部の優先順位を定義
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
            return 999 // 未知の支部は最後
        }
      }

      const branchOrderA = getBranchOrder(a.branch)
      const branchOrderB = getBranchOrder(b.branch)

      // まず支部順で比較
      if (branchOrderA !== branchOrderB) {
        return branchOrderA - branchOrderB
      }

      // 同じ支部内ではデビュー日順（早い順）
      if (a.debut && b.debut) {
        return new Date(a.debut).getTime() - new Date(b.debut).getTime()
      }

      // デビュー日がない場合は名前順
      return a.name.localeCompare(b.name)
    })
  }

  const sortedTalents = sortTalentsByBranchAndDebut(talents)

  const generateSmartTags = () => {
    const tags: string[] = []

    // 楽曲タイプ
    if (formData.type) {
      tags.push(formData.type === "ORIGINAL" ? "オリジナル曲" : "歌ってみた")
    }

    // 作詞者・作曲者の処理
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

    // 作詞者と作曲者が同じ場合は1つのタグにまとめる
    const allCreators = [...new Set([...lyricists, ...composers])]
    const sameCreators =
      lyricists.length > 0 &&
      composers.length > 0 &&
      lyricists.length === composers.length &&
      lyricists.every((lyricist) => composers.includes(lyricist))

    if (sameCreators) {
      // 同じ人が作詞・作曲の場合
      allCreators.forEach((creator) => tags.push(creator))
    } else {
      // 別々の場合
      lyricists.forEach((lyricist) => tags.push(lyricist))
      composers.forEach((composer) => tags.push(composer))
    }

    // タレント名（日本語名）
    formData.talentIds.forEach((talentId) => {
      const talent = talents.find((t) => t.id === talentId)
      if (talent && talent.nameJp) {
        tags.push(talent.nameJp)
      }
    })

    // リリース年
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

  const missingTags = getMissingTags()

  const resetForm = () => {
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
      tags: "", // スマートタグ自動入力機能を追加
      language: "ja",
      talentIds: [],
      isGroupSong: false, // Reset isGroupSong to false
    })
    setEditingSongModal(null)
    setIsEditModalOpen(false)
    // Added reset search state
    setSearchQuery("")
    setSearchResults([])
    setShowSearchResults(false)
  }

  const handleEdit = (song: Song) => {
    setEditingSongModal(song)
    setIsEditModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingSongModal(null)
    setIsEditModalOpen(true)
  }

  const handleModalSave = () => {
    fetchData()
  }

  const handleModalClose = () => {
    setIsEditModalOpen(false)
    setEditingSongModal(null)
  }

  const handleDelete = async (songId: string) => {
    if (!confirm("この楽曲を削除しますか？")) return

    try {
      const response = await fetch(`/api/admin/songs/${songId}`, {
        method: "DELETE",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (response.ok) {
        setMessage({ type: "success", text: "楽曲を削除しました" })
        fetchData()
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "削除に失敗しました" })
      }
    } catch (error) {
      console.error("[v0] Error deleting song:", error)
      setMessage({ type: "error", text: "ネットワークエラーが発生しました" })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">楽曲管理</h1>
              <p className="text-sm md:text-base text-muted-foreground">楽曲データの追加・編集・削除</p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="h-7 bg-primary/30 rounded w-48 animate-pulse" />
            <div className="h-10 bg-primary/30 rounded w-40 animate-pulse" />
          </div>

          <div className="grid gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="w-full">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <div className="h-6 md:h-7 bg-primary/30 rounded w-full max-w-64 animate-pulse" />
                        <div className="h-5 md:h-6 bg-primary/30 rounded w-20 animate-pulse flex-shrink-0" />
                      </div>
                      <div className="h-4 md:h-5 bg-primary/30 rounded w-full max-w-48 mb-2 animate-pulse" />
                      <div className="h-3 md:h-4 bg-primary/30 rounded w-full max-w-80 mb-2 animate-pulse" />
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <div className="h-3 md:h-4 bg-primary/30 rounded w-24 animate-pulse" />
                        <div className="h-3 md:h-4 bg-primary/30 rounded w-24 animate-pulse" />
                        <div className="h-3 md:h-4 bg-primary/30 rounded w-28 animate-pulse" />
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 self-start">
                      <div className="h-8 w-8 bg-primary/30 rounded animate-pulse" />
                      <div className="h-8 w-8 bg-primary/30 rounded animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">楽曲管理</h1>
            <p className="text-sm md:text-base text-muted-foreground">楽曲データの追加・編集・削除</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {message && (
          <Alert className={`mb-6 ${message.type === "error" ? "border-destructive" : "border-green-500"}`}>
            {message.type === "error" ? <AlertCircle /> : <CheckCircle />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">楽曲一覧 ({songs.length}件)</h2>
          <Button onClick={handleAddNew}>
            <Plus />
            <span className="ml-2">新しい楽曲を追加</span>
          </Button>
        </div>

        <SongEditModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          song={editingSongModal}
          talents={talents}
          onSave={handleModalSave}
        />

        <div className="grid gap-4">
          {songs.map((song) => (
            <Card key={song.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{song.title}</h3>
                      <Badge
                        className={
                          song.type === "ORIGINAL"
                            ? "bg-primary text-primary-foreground"
                            : song.type === "COVER"
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-accent text-accent-foreground"
                        }
                      >
                        {song.type === "ORIGINAL" ? "オリジナル" : song.type === "COVER" ? "歌ってみた" : "コラボ"}
                      </Badge>
                      {song.isGroupSong && (
                        <Badge variant="outline" className="text-xs">
                          全体曲
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">
                      {song.talents && song.talents.length > 0
                        ? song.talents.map((t) => `${t.nameJp || t.name} (${t.branch})`).join(", ")
                        : `${song.talent.nameJp || song.talent.name} (${song.talent.branch})`}
                    </p>
                    {(song.lyrics || song.composer) && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {song.lyrics && `作詞: ${song.lyrics}`}
                        {song.lyrics && song.composer && " / "}
                        {song.composer && `作曲: ${song.composer}`}
                      </p>
                    )}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {song.viewCount && <span>再生数: {Number.parseInt(song.viewCount).toLocaleString()}</span>}
                      {song.likeCount && <span>評価数: {Number.parseInt(song.likeCount).toLocaleString()}</span>}
                      {song.commentCount && (
                        <span>コメント数: {Number.parseInt(song.commentCount).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(song)}>
                      <Edit />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(song.id)}>
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
