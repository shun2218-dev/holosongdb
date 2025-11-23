"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, AlertCircle, CheckCircle, Users } from "lucide-react"
import { TalentEditModal } from "@/components/talent-edit-modal"
import Image from "next/image"

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
  debut: string | null
  active: boolean
  channelId: string | null
  subscriberCount: string | null
  mainColor: string | null
  image_url: string | null
  blur_data_url?: string | null
  createdAt: string | null
}

interface TalentManagementProps {
  admin: Admin
}

export function TalentManagement({ admin }: TalentManagementProps) {
  const [talents, setTalents] = useState<Talent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTalentModal, setEditingTalentModal] = useState<Talent | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [sortBy, setSortBy] = useState<"generation" | "createdAt">("generation")
  const [formData, setFormData] = useState({
    name: "",
    nameJp: "",
    nameEn: "",
    branch: "JP",
    generation: "",
    debut: "",
    active: true,
    channelId: "", // チャンネルIDフィールドを追加
    mainColor: "#4ECDC4", // メインカラーを追加
    image_url: "", // イメージURLフィールドを追加
  })

  useEffect(() => {
    fetchTalents()
  }, [])

  const fetchTalents = async () => {
    try {
      const response = await fetch("/api/admin/talents")
      if (response.ok) {
        const data = await response.json()
        setTalents(data.talents || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching talents:", error)
      setMessage({ type: "error", text: "データの読み込みに失敗しました" })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      nameJp: "",
      nameEn: "",
      branch: "JP",
      generation: "",
      debut: "",
      active: true,
      channelId: "",
      mainColor: "#4ECDC4",
      image_url: "",
    })
    setEditingTalentModal(null)
    setIsEditModalOpen(false)
  }

  const handleEdit = (talent: Talent) => {
    setEditingTalentModal(talent)
    setIsEditModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingTalentModal(null)
    setIsEditModalOpen(true)
  }

  const handleModalSave = () => {
    fetchTalents()
  }

  const handleModalClose = () => {
    setIsEditModalOpen(false)
    setEditingTalentModal(null)
  }

  const handleDelete = (talentId: string) => {
    // Implement delete logic here
  }

  const formatSubscriberCount = (count: string | null): string => {
    if (!count || count === "0") return "未設定"
    const num = Number.parseInt(count)
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`
    } else if (num >= 1000) {
      return `${Math.floor(num / 1000)}K`
    }
    return num.toLocaleString()
  }

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

  const sortedTalents =
    sortBy === "generation"
      ? sortTalentsByBranchAndDebut(talents) // 期生順の代わりに支部・デビュー日順を使用
      : [...talents].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">タレント管理</h1>
              <p className="text-sm md:text-base text-muted-foreground">タレント情報の追加・編集・削除</p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="h-7 bg-primary/30 rounded w-48 animate-pulse" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-5 bg-primary/30 rounded w-16 animate-pulse" />
                <div className="h-10 bg-primary/30 rounded w-32 animate-pulse" />
              </div>
              <div className="h-10 bg-primary/30 rounded w-48 animate-pulse" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-4 h-4 bg-primary/30 rounded-full animate-pulse" />
                        <div className="h-7 bg-primary/30 rounded w-32 animate-pulse" />
                      </div>
                      <div className="h-4 bg-primary/30 rounded w-24 mb-2 animate-pulse" />
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-6 bg-primary/30 rounded w-8 animate-pulse" />
                        <div className="h-6 bg-primary/30 rounded w-12 animate-pulse" />
                        <div className="h-6 bg-primary/30 rounded w-20 animate-pulse" />
                      </div>
                      <div className="h-4 bg-primary/30 rounded w-28 animate-pulse" />
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-3 w-3 bg-primary/30 rounded animate-pulse" />
                        <div className="h-4 bg-primary/30 rounded w-20 animate-pulse" />
                      </div>
                      <div className="h-3 bg-primary/30 rounded w-36 mt-1 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-8 bg-primary/30 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-primary/30 rounded animate-pulse" />
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
            <h1 className="text-xl md:text-2xl font-bold text-foreground">タレント管理</h1>
            <p className="text-sm md:text-base text-muted-foreground">タレント情報の追加・編集・削除</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {message && (
          <Alert className={`mb-6 ${message.type === "error" ? "border-destructive" : "border-green-500"}`}>
            {message.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex-shrink-0">
            <h2 className="text-lg sm:text-xl font-semibold whitespace-nowrap">タレント一覧 ({talents.length}件)</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="sort-select" className="text-sm whitespace-nowrap">
                並び順:
              </Label>
              <Select value={sortBy} onValueChange={(value: "generation" | "createdAt") => setSortBy(value)}>
                <SelectTrigger id="sort-select" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generation">期生順</SelectItem>
                  <SelectItem value="createdAt">登録日順</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddNew} className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2" />
              新しいタレントを追加
            </Button>
          </div>
        </div>

        <TalentEditModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          talent={editingTalentModal}
          onSave={handleModalSave}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedTalents.map((talent) => (
            <Card key={talent.id} className="relative">
              <CardContent className="p-6">
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-3 h-3 rounded-full ${talent.active ? "bg-green-500" : "bg-gray-400"}`}
                    title={talent.active ? "アクティブ" : "非アクティブ"}
                  />
                </div>

                <div className="flex gap-3 mb-4">
                  {talent.image_url && (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                      <Image
                        src={talent.image_url || "/placeholder.svg"}
                        alt={talent.nameJp || talent.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                        priority={false}
                        placeholder={talent.blur_data_url ? "blur" : "empty"}
                        blurDataURL={talent.blur_data_url || undefined}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {talent.mainColor && (
                        <div
                          className="w-4 h-4 rounded-full border border-border flex-shrink-0"
                          style={{ backgroundColor: talent.mainColor }}
                          title={`メインカラー: ${talent.mainColor}`}
                        />
                      )}
                      <h3 className="text-lg font-semibold truncate">{talent.nameJp || talent.name}</h3>
                    </div>
                    {talent.nameJp && talent.nameJp !== talent.name && (
                      <p className="text-sm text-muted-foreground mb-2 truncate">{talent.name}</p>
                    )}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="whitespace-nowrap">
                        {talent.branch}
                      </Badge>
                      {talent.generation && (
                        <Badge variant="secondary" className="text-xs">
                          {talent.generation}
                        </Badge>
                      )}
                    </div>
                    {talent.debut && (
                      <p className="text-sm text-muted-foreground">
                        デビュー: {new Date(talent.debut).toLocaleDateString("ja-JP")}
                      </p>
                    )}
                    {talent.subscriberCount && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Users className="h-3 w-3" />
                        <span>{formatSubscriberCount(talent.subscriberCount)} 登録者</span>
                      </div>
                    )}
                    {talent.channelId && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">チャンネルID: {talent.channelId}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(talent)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(talent.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
