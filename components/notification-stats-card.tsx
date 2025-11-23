"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, Eye, RefreshCw, ExternalLink } from "lucide-react"
import Link from "next/link"

interface NotificationStats {
  totalStats: {
    total_clicks: number
    total_unique_users: number
    view_clicks: number
    dismiss_clicks: number
    close_clicks: number
    click_through_rate: number
  }
  dailyStats: Array<{
    date: string
    action: string
    click_count: number
    unique_users: number
    unique_subscriptions: number
  }>
  hourlyStats: Array<{
    hour: number
    click_count: number
  }>
}

export function NotificationStatsCard() {
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    fetchStats()
  }, [days])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/notification-stats?days=${days}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("[v0] Notification stats fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMostActiveHour = () => {
    if (!stats?.hourlyStats.length) return null
    return stats.hourlyStats.reduce((max, current) => (current.click_count > max.click_count ? current : max))
  }

  const getRecentActivity = () => {
    if (!stats?.dailyStats.length) return []
    const grouped = stats.dailyStats.reduce(
      (acc, stat) => {
        if (!acc[stat.date]) {
          acc[stat.date] = { date: stat.date, total_clicks: 0, unique_users: 0 }
        }
        acc[stat.date].total_clicks += stat.click_count
        acc[stat.date].unique_users = Math.max(acc[stat.date].unique_users, stat.unique_users)
        return acc
      },
      {} as Record<string, { date: string; total_clicks: number; unique_users: number }>,
    )

    return Object.values(grouped).slice(0, 7)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            通知統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const mostActiveHour = getMostActiveHour()
  const recentActivity = getRecentActivity()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            通知統計
          </CardTitle>
          <div className="flex items-center gap-2">
            <Link href="/admin/notifications">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-1" />
                詳細
              </Button>
            </Link>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="text-sm border rounded px-2 py-1"
            >
              <option value={7}>7日間</option>
              <option value={30}>30日間</option>
              <option value={90}>90日間</option>
            </select>
            <Button variant="outline" size="sm" onClick={fetchStats}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">過去{days}日間の通知エンゲージメント統計</p>
      </CardHeader>
      <CardContent>
        {stats ? (
          <div className="space-y-6">
            {/* 概要統計 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalStats.total_clicks || 0}</div>
                <div className="text-xs text-muted-foreground">総クリック数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalStats.total_unique_users || 0}</div>
                <div className="text-xs text-muted-foreground">ユニークユーザー</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalStats.click_through_rate || 0}%</div>
                <div className="text-xs text-muted-foreground">クリック率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{mostActiveHour?.hour || 0}時</div>
                <div className="text-xs text-muted-foreground">最も活発な時間（JST）</div>
              </div>
            </div>

            {/* アクション別統計 */}
            <div>
              <h4 className="text-sm font-medium mb-3">アクション別クリック数</h4>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="default" className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  詳細表示: {stats.totalStats.view_clicks || 0}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  閉じる: {stats.totalStats.dismiss_clicks || 0}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  自動閉じ: {stats.totalStats.close_clicks || 0}
                </Badge>
              </div>
            </div>

            {/* 最近の活動 */}
            {recentActivity.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">最近の活動</h4>
                <div className="space-y-2">
                  {recentActivity.map((activity) => (
                    <div key={activity.date} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString("ja-JP", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <div className="flex gap-4">
                        <span>{activity.total_clicks} クリック</span>
                        <span className="text-muted-foreground">{activity.unique_users} ユーザー</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">統計データがありません</div>
        )}
      </CardContent>
    </Card>
  )
}
