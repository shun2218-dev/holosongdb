"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StorybookAccess } from "@/components/storybook-access"
import { NotificationStatsCard } from "@/components/notification-stats-card"
import { OshiStatsCard } from "@/components/oshi-stats-card"
import { InlineLoading, ButtonLoading } from "@/components/ui/loading"
import {
  Music,
  Users,
  BarChart3,
  Database,
  Settings,
  RefreshCw,
  Monitor,
  CheckCircle,
  Bell,
  Shield,
} from "lucide-react"

interface AdminDashboardProps {
  admin?: {
    id: string
    username: string
    email: string
    role: string
  }
}

function RecentActivity() {
  const [activities, setActivities] = useState<
    Array<{
      id: string
      type: string
      title: string
      description: string
      timestamp: string
      data?: any
    }>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch("/api/admin/recent-activity")
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error("[v0] Recent activity fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近の活動</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <InlineLoading text="最近の活動を読み込み中..." />
        ) : activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                <div>
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString("ja-JP")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">最近の活動はありません。</p>
        )}
      </CardContent>
    </Card>
  )
}

export function AdminDashboard({ admin }: AdminDashboardProps = {}) {
  const [isUpdatingStats, setIsUpdatingStats] = useState(false)
  const [updateResult, setUpdateResult] = useState<string | null>(null)
  const [isUpdatingSubscribers, setIsUpdatingSubscribers] = useState(false)
  const [subscriberUpdateResult, setSubscriberUpdateResult] = useState<string | null>(null)

  const currentAdmin = admin || {
    id: "",
    username: "Admin",
    email: "",
    role: "ADMIN",
  }

  const handleUpdateStatistics = async (songType: "original" | "cover" | "all") => {
    setIsUpdatingStats(true)
    setUpdateResult(null)

    try {
      const response = await fetch("/api/admin/update-statistics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ songType }),
      })

      const result = await response.json()

      if (response.ok) {
        setUpdateResult(`成功: ${result.message}`)
      } else {
        setUpdateResult(`エラー: ${result.error}`)
      }
    } catch (error) {
      console.error("[v0] Statistics update error:", error)
      setUpdateResult("エラー: 統計情報の更新に失敗しました")
    } finally {
      setIsUpdatingStats(false)
    }
  }

  const handleUpdateSubscriberCounts = async () => {
    setIsUpdatingSubscribers(true)
    setSubscriberUpdateResult(null)

    try {
      const response = await fetch("/api/admin/update-subscriber-counts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (response.ok) {
        setSubscriberUpdateResult(`成功: ${result.message}`)
      } else {
        setSubscriberUpdateResult(`エラー: ${result.error}`)
      }
    } catch (error) {
      console.error("[v0] Subscriber count update error:", error)
      setSubscriberUpdateResult("エラー: 登録者数の更新に失敗しました")
    } finally {
      setIsUpdatingSubscribers(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Link href="/admin/songs">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">楽曲管理</CardTitle>
              <Music className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">楽曲データ</div>
              <p className="text-xs text-muted-foreground">楽曲の追加・編集・削除</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/talents">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">タレント管理</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">タレントデータ</div>
              <p className="text-xs text-muted-foreground">タレント情報の管理</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/analytics">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">統計情報</CardTitle>
              <BarChart3 className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">データ分析</div>
              <p className="text-xs text-muted-foreground">アクセス統計・人気楽曲</p>
            </CardContent>
          </Card>
        </Link>

        {(currentAdmin.role === "SUPER_ADMIN" || currentAdmin.role === "ADMIN") && (
          <Link href="/admin/notifications">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">通知管理</CardTitle>
                <Bell className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">通知システム</div>
                <p className="text-xs text-muted-foreground">通知送信・管理</p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <Link href="/admin/database">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">データベース</CardTitle>
              <Database className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">DB管理</div>
              <p className="text-xs text-muted-foreground">バックアップ・メンテナンス</p>
            </CardContent>
          </Card>
        </Link>

        {(currentAdmin.role === "SUPER_ADMIN" || currentAdmin.role === "ADMIN") && (
          <Link href="/admin/settings">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">システム設定</CardTitle>
                <Settings className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">管理者設定</div>
                <p className="text-xs text-muted-foreground">ユーザー管理・システム設定</p>
              </CardContent>
            </Card>
          </Link>
        )}

        {currentAdmin.role === "SUPER_ADMIN" && (
          <Link href="/admin/e2e-testing">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">E2Eテスト管理</CardTitle>
                <Monitor className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">E2Eテスト</div>
                <p className="text-xs text-muted-foreground">エンドツーエンドテスト</p>
              </CardContent>
            </Card>
          </Link>
        )}

        {currentAdmin.role === "SUPER_ADMIN" && (
          <Link href="/admin/testing">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">テスト管理</CardTitle>
                <CheckCircle className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">品質管理</div>
                <p className="text-xs text-muted-foreground">ユニットテスト・カバレッジ</p>
              </CardContent>
            </Card>
          </Link>
        )}

        {currentAdmin.role === "SUPER_ADMIN" && (
          <Link href="/admin/admin-management">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">管理者アカウント</CardTitle>
                <Shield className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">アカウント管理</div>
                <p className="text-xs text-muted-foreground">SUPER_ADMIN作成・管理</p>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YouTube統計更新</CardTitle>
            <RefreshCw className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">統計データ</div>
            <p className="text-xs text-muted-foreground">再生数・評価数・コメント数</p>
            <div className="space-y-2 mt-4">
              <Button
                className="w-full"
                size="sm"
                onClick={() => handleUpdateStatistics("all")}
                disabled={isUpdatingStats}
              >
                {isUpdatingStats ? <ButtonLoading /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-2">全楽曲統計を更新</span>
              </Button>
            </div>
            {isUpdatingStats && <p className="text-xs text-muted-foreground mt-2">更新中...</p>}
            {updateResult && (
              <p className={`text-xs mt-2 ${updateResult.startsWith("成功") ? "text-green-600" : "text-red-600"}`}>
                {updateResult}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">登録者数更新</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">登録者数</div>
            <p className="text-xs text-muted-foreground">タレントのYouTube登録者数</p>
            <div className="space-y-2 mt-4">
              <Button
                className="w-full"
                size="sm"
                onClick={handleUpdateSubscriberCounts}
                disabled={isUpdatingSubscribers}
              >
                {isUpdatingSubscribers ? <ButtonLoading /> : <RefreshCw className="h-4 w-4" />}
                <span className="ml-2">登録者数を更新</span>
              </Button>
            </div>
            {isUpdatingSubscribers && <p className="text-xs text-muted-foreground mt-2">更新中...</p>}
            {subscriberUpdateResult && (
              <p
                className={`text-xs mt-2 ${subscriberUpdateResult.startsWith("成功") ? "text-green-600" : "text-red-600"}`}
              >
                {subscriberUpdateResult}
              </p>
            )}
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">定期更新: 毎週水曜日 0:00</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {currentAdmin.role === "SUPER_ADMIN" && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">開発者ツール</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <StorybookAccess />
            <NotificationStatsCard />
            <OshiStatsCard />
          </div>
        </div>
      )}

      <div className="mt-8">
        <RecentActivity />
      </div>
    </div>
  )
}
