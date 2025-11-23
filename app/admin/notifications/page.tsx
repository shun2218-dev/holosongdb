"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Bell, Eye, Clock, Users, RefreshCw, ChevronRight, BarChart3, Plus } from "lucide-react"
import { AdminNotificationSender } from "@/components/admin-notification-sender"
import { Skeleton } from "@/components/ui/skeleton"
import { ButtonLoading } from "@/components/ui/loading"

interface Admin {
  id: string
  username: string
  email: string
  role: string
}

// Mock admin data - in real app this would come from auth context
const mockAdmin: Admin = {
  id: "admin-1",
  username: "admin",
  email: "admin@example.com",
  role: "ADMIN",
}

interface OverallStats {
  total_notifications: number
  total_interactions: number
  total_views: number
  total_dismisses: number
  overall_ctr: number
}

interface NotificationSummary {
  notification_id: string
  title: string
  body: string
  sent_at_jst: string
  type: string
  total_interactions: number
  view_clicks: number
  dismiss_clicks: number
  close_clicks: number
  unique_users: number
  click_through_rate: number
}

export default function NotificationsPage() {
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null)
  const [notifications, setNotifications] = useState<NotificationSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [days, setDays] = useState(30)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [days])

  const fetchNotifications = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const timestamp = Date.now()
      const response = await fetch(`/api/admin/notification-details?days=${days}&t=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })
      if (response.ok) {
        const data = await response.json()
        setOverallStats(data.overall_stats)
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error("[v0] Notification details fetch error:", error)
    } finally {
      if (isRefresh) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  const handleNotificationSuccess = () => {
    setIsModalOpen(false)
    fetchNotifications(true)
  }

  const handleRefresh = () => {
    fetchNotifications(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tokyo",
    })
  }

  const getClickRateColor = (rate: number) => {
    if (rate >= 20) return "text-green-600"
    if (rate >= 10) return "text-yellow-600"
    return "text-red-600"
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "milestone":
        return "bg-blue-100 text-blue-800"
      case "trending":
        return "bg-green-100 text-green-800"
      case "weekly_report":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const StatsCardSkeleton = () => (
    <Card>
      <CardContent className="p-4 text-center">
        <Skeleton className="h-8 w-16 mx-auto mb-2" />
        <Skeleton className="h-3 w-20 mx-auto" />
      </CardContent>
    </Card>
  )

  const NotificationCardSkeleton = () => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex items-center gap-3 ml-4">
            <div className="text-right">
              <Skeleton className="h-6 w-12 mb-1" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Bell className="h-6 w-6 md:h-8 md:w-8" />
                通知管理
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-2">
                プッシュ通知の送信履歴とエンゲージメント統計
              </p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* 全体統計スケルトン */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              過去30日間の全体統計
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </div>
          </div>

          {/* コントロールスケルトン */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-16" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* 通知一覧スケルトン */}
          <div>
            <h2 className="text-lg font-semibold mb-4">個別通知一覧</h2>
            <div className="space-y-4">
              <NotificationCardSkeleton />
              <NotificationCardSkeleton />
              <NotificationCardSkeleton />
              <NotificationCardSkeleton />
              <NotificationCardSkeleton />
            </div>
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
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Bell className="h-6 w-6 md:h-8 md:w-8" />
              通知管理
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              プッシュ通知の送信履歴とエンゲージメント統計
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 全体統計 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            過去{days}日間の全体統計
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {refreshing ? (
              <>
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </>
            ) : overallStats ? (
              <>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{overallStats.total_notifications}</div>
                    <div className="text-xs text-muted-foreground">送信通知数</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{overallStats.total_views}</div>
                    <div className="text-xs text-muted-foreground">詳細表示</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">{overallStats.total_dismisses}</div>
                    <div className="text-xs text-muted-foreground">閉じる</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{overallStats.total_interactions}</div>
                    <div className="text-xs text-muted-foreground">総反応数</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${getClickRateColor(overallStats.overall_ctr || 0)}`}>
                      {overallStats.overall_ctr || 0}%
                    </div>
                    <div className="text-xs text-muted-foreground">全体CTR</div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </>
            )}
          </div>
        </div>

        {/* コントロール */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <label htmlFor="days-select" className="text-sm font-medium sr-only">
              表示期間を選択
            </label>
            <select
              id="days-select"
              name="days"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="text-sm border rounded px-3 py-2"
              aria-label="表示期間を選択"
            >
              <option value={7}>7日間</option>
              <option value={30}>30日間</option>
              <option value={90}>90日間</option>
            </select>
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <ButtonLoading size="sm" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              更新
            </Button>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新しい通知を作成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  プッシュ通知を送信
                </DialogTitle>
                <DialogDescription>
                  登録ユーザーにプッシュ通知を送信します。タイトル、本文、通知タイプを設定してください。
                </DialogDescription>
              </DialogHeader>
              <AdminNotificationSender admin={mockAdmin} onSuccess={handleNotificationSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        {/* 通知一覧 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">個別通知一覧</h2>
          {refreshing ? (
            <div className="space-y-4">
              <NotificationCardSkeleton />
              <NotificationCardSkeleton />
              <NotificationCardSkeleton />
              <NotificationCardSkeleton />
              <NotificationCardSkeleton />
            </div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">過去{days}日間に送信された通知がありません</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <Link
                  key={notification.notification_id}
                  href={`/admin/notifications/${notification.notification_id}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium truncate">{notification.title}</h3>
                            <Badge className={getTypeColor(notification.type)} variant="secondary">
                              {notification.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{notification.body}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{formatDate(notification.sent_at_jst)}</span>
                            </span>
                            <div className="flex items-center gap-3 sm:gap-4">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3 flex-shrink-0" />
                                <span className="whitespace-nowrap">{notification.unique_users}人</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3 flex-shrink-0" />
                                <span className="whitespace-nowrap">{notification.view_clicks}回表示</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4 flex-shrink-0">
                          <div className="text-right">
                            <div
                              className={`text-base sm:text-lg font-bold ${getClickRateColor(notification.click_through_rate || 0)}`}
                            >
                              {notification.click_through_rate || 0}%
                            </div>
                            <div className="text-xs text-muted-foreground">CTR</div>
                          </div>
                          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
