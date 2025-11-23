"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Music, Eye, Heart, MessageCircle, TrendingUp, Award } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts"

interface TalentStats {
  talent: {
    id: string
    name: string
    nameJp: string | null
    nameEn: string | null
    branch: string
    generation: string | null
    mainColor: string | null
    subscriberCount: string | null
  }
  statistics: {
    totalSongs: number
    originalSongs: number
    coverSongs: number
    totalViews: number
    totalLikes: number
    totalComments: number
    avgViews: number
    avgOriginalViews: number
    avgCoverViews: number
  }
  topSongs: Array<{
    id: string
    title: string
    type: string
    viewCount: number
    likeCount: number
    releaseDate: string | null
  }>
  monthlyTrends: Array<{
    month: string
    totalUploads: number
    originalUploads: number
    coverUploads: number
    avgViews: number
  }>
}

interface TalentStatsContentProps {
  talentId: string
}

export function TalentStatsContent({ talentId }: TalentStatsContentProps) {
  const [stats, setStats] = useState<TalentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/talents/${talentId}/stats`)
        if (!response.ok) {
          throw new Error("統計情報の取得に失敗しました")
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error("[v0] Error fetching talent stats:", err)
        setError(err instanceof Error ? err.message : "データの取得に失敗しました")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [talentId])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toLocaleString()
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ORIGINAL":
        return "オリジナル"
      case "COVER":
        return "歌ってみた"
      case "COLLABORATION":
        return "コラボ"
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ORIGINAL":
        return "bg-primary text-primary-foreground"
      case "COVER":
        return "bg-secondary text-secondary-foreground"
      case "COLLABORATION":
        return "bg-accent text-accent-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || "データの取得に失敗しました"}</AlertDescription>
      </Alert>
    )
  }

  const songTypeData = [
    {
      name: "オリジナル",
      楽曲数: stats.statistics.originalSongs,
      平均再生数: Math.round(stats.statistics.avgOriginalViews / 1000),
      fill: stats.talent.mainColor || "#4ECDC4",
    },
    {
      name: "歌ってみた",
      楽曲数: stats.statistics.coverSongs,
      平均再生数: Math.round(stats.statistics.avgCoverViews / 1000),
      fill: `${stats.talent.mainColor || "#4ECDC4"}80`,
    },
  ]

  const monthlyData = stats.monthlyTrends
    .map((trend) => ({
      月: new Date(trend.month).toLocaleDateString("ja-JP", { month: "short" }),
      アップロード数: trend.totalUploads,
      オリジナル: trend.originalUploads,
      カバー: trend.coverUploads,
    }))
    .reverse()

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総楽曲数</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.statistics.totalSongs}</div>
            <p className="text-xs text-muted-foreground">
              オリジナル: {stats.statistics.originalSongs} | カバー: {stats.statistics.coverSongs}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総再生数</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.statistics.totalViews)}</div>
            <p className="text-xs text-muted-foreground">平均: {formatNumber(stats.statistics.avgViews)} 回/曲</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総いいね数</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.statistics.totalLikes)}</div>
            <p className="text-xs text-muted-foreground">
              エンゲージメント率:{" "}
              {stats.statistics.totalViews > 0
                ? ((stats.statistics.totalLikes / stats.statistics.totalViews) * 100).toFixed(2)
                : 0}
              %
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総コメント数</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.statistics.totalComments)}</div>
            <p className="text-xs text-muted-foreground">
              平均: {formatNumber(Math.round(stats.statistics.totalComments / stats.statistics.totalSongs))} 件/曲
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Song Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            楽曲タイプ別統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={songTypeData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-xs fill-muted-foreground" />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="楽曲数" fill={stats.talent.mainColor || "#4ECDC4"} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      {monthlyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              月別アップロード傾向
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="月" className="text-xs fill-muted-foreground" />
                <YAxis className="text-xs fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="アップロード数"
                  stroke={stats.talent.mainColor || "#4ECDC4"}
                  strokeWidth={2}
                  dot={{ fill: stats.talent.mainColor || "#4ECDC4" }}
                />
                <Line
                  type="monotone"
                  dataKey="オリジナル"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-1))" }}
                />
                <Line
                  type="monotone"
                  dataKey="カバー"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-2))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Top Songs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            人気楽曲 TOP 10
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topSongs.map((song, index) => (
              <div key={song.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground leading-tight line-clamp-2 text-sm">{song.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${getTypeColor(song.type)} text-xs`}>{getTypeLabel(song.type)}</Badge>
                        {song.releaseDate && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(song.releaseDate).toLocaleDateString("ja-JP")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm font-medium text-foreground whitespace-nowrap">
                        {formatNumber(song.viewCount)}
                      </div>
                      <div className="text-xs text-muted-foreground">回再生</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{formatNumber(song.likeCount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
