"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Send, Users, Music, TrendingUp, BarChart3 } from "lucide-react"

interface NotificationForm {
  type: string
  title: string
  message: string
  targetAudience: string
}

interface Admin {
  id: string
  username: string
  email: string
  role: string
}

interface AdminNotificationSenderProps {
  admin: Admin
  onSuccess?: () => void
}

export function AdminNotificationSender({ admin, onSuccess }: AdminNotificationSenderProps) {
  const [form, setForm] = useState<NotificationForm>({
    type: "system",
    title: "",
    message: "",
    targetAudience: "all",
  })
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  // 管理者権限チェック
  if (admin.role !== "ADMIN" && admin.role !== "SUPER_ADMIN") {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">この機能は管理者以上の権限が必要です。</p>
      </div>
    )
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`成功: ${data.message}`)
        setForm({
          type: "system",
          title: "",
          message: "",
          targetAudience: "all",
        })
        onSuccess?.()
      } else {
        setResult(`エラー: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Notification send error:", error)
      setResult("エラー: 通知の送信に失敗しました")
    } finally {
      setSending(false)
    }
  }

  const handleTypeChange = (type: string) => {
    const preset = getPresetMessage(type)
    setForm({
      ...form,
      type,
      title: preset.title,
      message: preset.message,
    })
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "song":
        return <Music className="h-4 w-4" />
      case "milestone":
        return <TrendingUp className="h-4 w-4" />
      case "report":
        return <BarChart3 className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getPresetMessage = (type: string) => {
    switch (type) {
      case "song":
        return {
          title: "新楽曲追加のお知らせ",
          message: "新しい楽曲がデータベースに追加されました。ぜひチェックしてみてください！",
        }
      case "milestone":
        return {
          title: "楽曲が節目を達成！",
          message: "楽曲が再生数の節目を達成しました。おめでとうございます！",
        }
      case "report":
        return {
          title: "週間レポート配信",
          message: "今週の人気楽曲ランキングをお届けします。",
        }
      case "system":
        return {
          title: "システムからのお知らせ",
          message: "重要なお知らせがあります。",
        }
      default:
        return { title: "", message: "" }
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <Label htmlFor="type">通知の種類</Label>
          <Select value={form.type} onValueChange={handleTypeChange}>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  システム通知
                </div>
              </SelectItem>
              <SelectItem value="song">
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  楽曲関連
                </div>
              </SelectItem>
              <SelectItem value="milestone">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  節目達成
                </div>
              </SelectItem>
              <SelectItem value="report">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  統計レポート
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="targetAudience">送信対象</Label>
          <Select value={form.targetAudience} onValueChange={(value) => setForm({ ...form, targetAudience: value })}>
            <SelectTrigger id="targetAudience">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  全ユーザー
                </div>
              </SelectItem>
              <SelectItem value="milestones">節目達成通知を有効にしたユーザー</SelectItem>
              <SelectItem value="surge">急上昇通知を有効にしたユーザー</SelectItem>
              <SelectItem value="reports">統計レポート通知を有効にしたユーザー</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="title">通知タイトル</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="通知のタイトルを入力"
            required
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground mt-1">{form.title.length}/50文字</p>
        </div>

        <div>
          <Label htmlFor="message">通知メッセージ</Label>
          <Textarea
            id="message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="通知の内容を入力"
            required
            maxLength={200}
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">{form.message.length}/200文字</p>
        </div>

        {/* プレビュー */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          {getNotificationIcon(form.type)}
          <div className="flex-1">
            <p className="font-medium text-sm">{form.title || "通知タイトル"}</p>
            <p className="text-xs text-muted-foreground">{form.message || "通知メッセージ"}</p>
          </div>
        </div>

        <Button type="submit" disabled={sending || !form.title || !form.message} className="w-full">
          <Send className="h-4 w-4 mr-2" />
          {sending ? "送信中..." : "通知を送信"}
        </Button>

        {result && (
          <p className={`text-sm ${result.startsWith("成功") ? "text-green-600" : "text-red-600"}`}>{result}</p>
        )}
      </form>
    </div>
  )
}
