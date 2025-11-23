"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, AlertCircle, CheckCircle, Upload, X } from "lucide-react"
import Image from "next/image"
import { optimizeImage, generateBlurDataURL } from "@/lib/image-optimizer"

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

interface TalentEditModalProps {
  isOpen: boolean
  onClose: () => void
  talent: Talent | null
  onSave: () => void
}

interface Generation {
  id: string
  branch: string
  name: string
  display_order: number
}

export function TalentEditModal({ isOpen, onClose, talent, onSave }: TalentEditModalProps) {
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loadingGenerations, setLoadingGenerations] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [blurDataURL, setBlurDataURL] = useState<string | null>(null)
  const [formData, setFormData] = useState({
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
    blur_data_url: "",
  })

  useEffect(() => {
    if (talent) {
      setFormData({
        name: talent.name,
        nameJp: talent.nameJp || "",
        nameEn: talent.nameEn || "",
        branch: talent.branch,
        generation: talent.generation || "",
        debut: talent.debut ? talent.debut.split("T")[0] : "",
        active: talent.active,
        channelId: talent.channelId || "",
        mainColor: talent.mainColor || "#4ECDC4",
        image_url: talent.image_url || "",
        blur_data_url: talent.blur_data_url || "",
      })
      setImagePreview(talent.image_url || null)
      setBlurDataURL(talent.blur_data_url || null)
    } else {
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
        blur_data_url: "",
      })
      setImagePreview(null)
      setBlurDataURL(null)
    }
    setMessage(null)
  }, [talent, isOpen])

  useEffect(() => {
    if (formData.branch) {
      fetchGenerations(formData.branch)
    }
  }, [formData.branch])

  const fetchGenerations = async (branch: string) => {
    setLoadingGenerations(true)
    try {
      const response = await fetch(`/api/admin/generations?branch=${branch}`)
      if (response.ok) {
        const data = await response.json()
        setGenerations(data)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch generations:", error)
    } finally {
      setLoadingGenerations(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "ファイルサイズは5MB以下にしてください" })
      return
    }

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "画像ファイルのみアップロード可能です" })
      return
    }

    setUploadingImage(true)
    setMessage(null)

    try {
      const blurData = await generateBlurDataURL(file)
      setBlurDataURL(blurData)

      const optimizedFile = await optimizeImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
        maxSizeMB: 1,
      })

      const uploadFormData = new FormData()
      uploadFormData.append("file", optimizedFile)
      if (formData.image_url) {
        uploadFormData.append("old_image_url", formData.image_url)
      }

      const response = await fetch("/api/admin/talents/upload-image", {
        method: "POST",
        body: uploadFormData,
      })

      if (response.ok) {
        const data = await response.json()
        setFormData({ ...formData, image_url: data.url, blur_data_url: blurData })
        setImagePreview(data.url)
        setMessage({ type: "success", text: "画像をアップロードしました" })
      } else {
        const error = await response.json()
        setMessage({ type: "error", text: error.error || "アップロードに失敗しました" })
      }
    } catch (error) {
      console.error("[v0] Image upload error:", error)
      setMessage({ type: "error", text: "画像の処理中にエラーが発生しました" })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: "", blur_data_url: "" })
    setImagePreview(null)
    setBlurDataURL(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      const url = talent ? `/api/admin/talents/${talent.id}` : "/api/admin/talents"
      const method = talent ? "PUT" : "POST"

      const submitData = {
        ...formData,
        name:
          formData.branch === "JP" || formData.branch === "DEV_IS" ? formData.nameJp || formData.name : formData.name,
        nameJp: formData.nameJp,
        nameEn: formData.nameEn || formData.name,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        setMessage({
          type: "success",
          text: talent ? "タレントを更新しました" : "タレントを追加しました",
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
      console.error("[v0] Error saving talent:", error)
      setMessage({ type: "error", text: "ネットワークエラーが発生しました" })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{talent ? "タレントを編集" : "新しいタレントを追加"}</DialogTitle>
          <DialogDescription>
            {talent ? "タレントの基本情報を編集できます。" : "新しいタレントの基本情報を入力してください。"}
          </DialogDescription>
        </DialogHeader>

        {message && (
          <Alert className={`mb-4 ${message.type === "error" ? "border-destructive" : "border-green-500"}`}>
            {message.type === "error" ? <AlertCircle /> : <CheckCircle />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">タレント画像</Label>
            <div className="flex flex-col gap-3">
              {imagePreview ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                  <Image
                    src={imagePreview || "/placeholder.svg"}
                    alt="タレント画像"
                    fill
                    sizes="128px"
                    className="object-cover"
                    placeholder={blurDataURL ? "blur" : "empty"}
                    blurDataURL={blurDataURL || undefined}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground">
                  <Upload className="h-8 w-8" />
                </div>
              )}
              <div>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {uploadingImage ? "最適化してアップロード中..." : "JPG, PNG, GIF (自動的に最適化されます)"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                {formData.branch === "JP" || formData.branch === "DEV_IS" ? "名前 (日本語) *" : "名前 (英語) *"}
              </Label>
              <Input
                id="name"
                value={formData.branch === "JP" || formData.branch === "DEV_IS" ? formData.nameJp : formData.name}
                onChange={(e) => {
                  if (formData.branch === "JP" || formData.branch === "DEV_IS") {
                    setFormData({ ...formData, nameJp: e.target.value })
                  } else {
                    setFormData({ ...formData, name: e.target.value })
                  }
                }}
                required
                placeholder={formData.branch === "JP" || formData.branch === "DEV_IS" ? "ときのそら" : "Tokino Sora"}
              />
              <p className="text-sm text-muted-foreground">
                {formData.branch === "JP" || formData.branch === "DEV_IS"
                  ? "メイン表示名として使用されます"
                  : "メイン表示名として使用されます"}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">名前 (英語) *</Label>
              <Input
                id="nameEn"
                value={formData.nameEn || formData.name}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                required
                placeholder="Tokino Sora"
              />
              <p className="text-sm text-muted-foreground">英語名は全タレント必須です</p>
            </div>
          </div>

          {(formData.branch === "JP" || formData.branch === "DEV_IS") && (
            <div className="space-y-2">
              <Label htmlFor="nameJp">名前 (日本語) *</Label>
              <Input
                id="nameJp"
                value={formData.nameJp}
                onChange={(e) => setFormData({ ...formData, nameJp: e.target.value })}
                required
                placeholder="ときのそら"
              />
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="branch">ブランチ</Label>
              <Select
                value={formData.branch}
                onValueChange={(value) => setFormData({ ...formData, branch: value, generation: "" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JP">JP (日本)</SelectItem>
                  <SelectItem value="EN">EN (英語)</SelectItem>
                  <SelectItem value="ID">ID (インドネシア)</SelectItem>
                  <SelectItem value="DEV_IS">DEV_IS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="generation">期生</Label>
              <Select
                value={formData.generation}
                onValueChange={(value) => setFormData({ ...formData, generation: value })}
                disabled={loadingGenerations}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingGenerations ? "読み込み中..." : "期生を選択"} />
                </SelectTrigger>
                <SelectContent>
                  {generations.length > 0 ? (
                    generations.map((gen) => (
                      <SelectItem key={gen.id} value={gen.name}>
                        {gen.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      期生が登録されていません
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="debut">デビュー日</Label>
              <Input
                id="debut"
                type="date"
                value={formData.debut}
                onChange={(e) => setFormData({ ...formData, debut: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channelId">YouTubeチャンネルID</Label>
            <Input
              id="channelId"
              value={formData.channelId}
              onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
              placeholder="UCp6993wxpyDPHUpavwDFqgg"
            />
            <p className="text-sm text-muted-foreground">
              チャンネルURLの「/channel/」以降の部分、または「@」以降のハンドル名を入力してください
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mainColor">メインカラー</Label>
            <div className="flex items-center gap-3">
              <Input
                id="mainColor"
                type="color"
                value={formData.mainColor}
                onChange={(e) => setFormData({ ...formData, mainColor: e.target.value })}
                className="w-16 h-10 p-1 border rounded cursor-pointer"
              />
              <Input
                type="text"
                value={formData.mainColor}
                onChange={(e) => setFormData({ ...formData, mainColor: e.target.value })}
                placeholder="#4ECDC4"
                className="flex-1 font-mono"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              タレントのテーマカラーを設定します。グラフや表示で使用されます。
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="rounded border-border"
            />
            <Label htmlFor="active">アクティブ</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={uploadingImage}>
              <Save className="h-4 w-4" />
              <span className="ml-2">{talent ? "更新" : "追加"}</span>
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
