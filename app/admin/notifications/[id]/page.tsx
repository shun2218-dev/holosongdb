"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Eye, X, Clock, Users, TrendingUp, ArrowLeft, BarChart3 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AdminStatCardSkeleton, AdminChartSkeleton } from "@/components/admin-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

interface NotificationDetail {
  notification_id: string
  title: string
  body: string
  sent_at_jst: string
  type: string
  data: any
  total_interactions: number
  view_clicks: number
  dismiss_clicks: number
  close_clicks: number
  unique_users: number
  click_through_rate: number
}

interface HourlyStats {
  hour: string
  views: number
  dismisses: number
}

export default function NotificationDetailPage({ params }: { params: { id: string } }) {
  const [notification, setNotification] = useState<NotificationDetail | null>(null)
  const [hourlyStats, setHourlyStats] = useState<HourlyStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotificationDetail()
  }, [params.id])

  const fetchNotificationDetail = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/notification-details/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setNotification(data.notification)
        setHourlyStats(data.hourly_stats || [])
      }
    } catch (error) {
      console.error("[v0] Notification detail fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tokyo",
    })
  }

  const formatHour = (dateString: string) => {
    return new Date(dateString).toLocaleString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/notifications">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  一覧に戻る
                </Button>
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <Bell className="h-6 w-6 md:h-8 md:w-8" />
                  通知詳細統計
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">個別通知のエンゲージメント詳細分析</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              エンゲージメント統計
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <AdminStatCardSkeleton />
              <AdminStatCardSkeleton />
              <AdminStatCardSkeleton />
              <AdminStatCardSkeleton />
              <AdminStatCardSkeleton />
            </div>
          </div>

          <AdminChartSkeleton />
        </main>
      </div>
    )
  }

  if (!notification) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0 flex items-center justify-center">
        <Card>
          <CardContent className="text-center py-8">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">通知が見つかりません</p>
            <Link href="/admin/notifications">
              <Button className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                通知一覧に戻る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/notifications">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                一覧に戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Bell className="h-6 w-6 md:h-8 md:w-8" />
                通知詳細統計
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">個別通知のエンゲージメント詳細分析</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 通知情報 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{notification.title}</CardTitle>
                <p className="text-muted-foreground mb-4">{notification.body}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDate(notification.sent_at_jst)}
                  </span>
                  <Badge className={getTypeColor(notification.type)} variant="secondary">
                    {notification.type}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 統計サマリー */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            エンゲージメント統計
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{notification.unique_users}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Users className="h-3 w-3" />
                  ユニークユーザー
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{notification.view_clicks}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Eye className="h-3 w-3" />
                  詳細表示
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{notification.dismiss_clicks}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <X className="h-3 w-3" />
                  閉じる
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{notification.total_interactions}</div>
                <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  総反応数
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${getClickRateColor(notification.click_through_rate || 0)}`}>
                  {notification.click_through_rate || 0}%
                </div>
                <div className="text-xs text-muted-foreground">クリック率</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 時間別統計グラフ */}
        {hourlyStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>時間別エンゲージメント推移</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" tickFormatter={formatHour} fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip
                      labelFormatter={(value) => formatHour(value as string)}
                      formatter={(value, name) => [value, name === "views" ? "詳細表示" : "閉じる"]}
                    />
                    <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} name="views" />
                    <Line type="monotone" dataKey="dismisses" stroke="#f59e0b" strokeWidth={2} name="dismisses" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
