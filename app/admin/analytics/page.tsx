"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Music, Users, Eye, Heart, BarChart3 } from "lucide-react"
import { TalentPerformanceChart } from "@/components/analytics/talent-performance-chart"
import { MonthlyTrendsChart } from "@/components/analytics/monthly-trends-chart"
import { BranchComparisonChart } from "@/components/analytics/branch-comparison-chart"
import { TopSongsChart } from "@/components/analytics/top-songs-chart"
import { TalentStatsTable } from "@/components/analytics/talent-stats-table"
import { AIAnalysisSummary } from "@/components/analytics/ai-analysis-summary"
import { AdminStatCardSkeleton, AdminChartSkeleton } from "@/components/admin-skeleton"

interface AnalyticsData {
  totalSongs: number
  totalTalents: number
  totalViews: number
  totalLikes: number
  talentStats: Array<{
    id: string
    name: string
    nameJp: string
    branch: string
    generation: string
    totalSongs: number
    originalSongs: number
    coverSongs: number
    totalViews: number
    originalViews: number
    coverViews: number
    avgViews: number
    avgOriginalViews: number
    avgCoverViews: number
    totalLikes: number
    mostViewedCount: number
    mostViewedSong: string
  }>
  monthlyTrends: Array<{
    month: string
    totalUploads: number
    originalUploads: number
    coverUploads: number
    avgViews: number
  }>
  branchStats: Array<{
    branch: string
    talentCount: number
    totalSongs: number
    totalViews: number
    avgViewsPerSong: number
    originalSongs: number
    coverSongs: number
  }>
  topOriginalSongs: Array<{
    id: string
    title: string
    viewCount: number
    likeCount: number
    releaseDate: string
    talentName: string
    branch: string
  }>
  topCoverSongs: Array<{
    id: string
    title: string
    viewCount: number
    likeCount: number
    releaseDate: string
    talentName: string
    branch: string
  }>
  popularSongs: Array<{
    id: string
    title: string
    talent_name: string
    view_count: number
  }>
  recentSongs: Array<{
    id: string
    title: string
    talent_name: string
    created_at: string
  }>
}

const tabs = [
  { id: "overview", label: "概要", icon: BarChart3 },
  { id: "charts", label: "グラフ分析", icon: TrendingUp },
  { id: "details", label: "詳細統計", icon: Users },
  { id: "ai", label: "AI分析", icon: Music },
] as const

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "charts" | "details" | "ai">("overview")
  const router = useRouter()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else if (response.status === 401) {
        router.push("/admin/login")
      }
    } catch (error) {
      console.error("[v0] Analytics fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">高度データ分析</h1>
              <p className="text-sm md:text-base text-muted-foreground">AI搭載の包括的パフォーマンス分析</p>
            </div>

            <div className="flex gap-2 mt-4">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <AdminStatCardSkeleton />
              <AdminStatCardSkeleton />
              <AdminStatCardSkeleton />
              <AdminStatCardSkeleton />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <AdminChartSkeleton />
              <AdminChartSkeleton />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <AdminChartSkeleton />
              <AdminChartSkeleton />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">高度データ分析</h1>
            <p className="text-sm md:text-base text-muted-foreground">AI搭載の包括的パフォーマンス分析</p>
          </div>

          <div className="flex gap-2 mt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              )
            })}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 pb-20 md:pb-8">
        {analytics && (
          <>
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">総楽曲数</CardTitle>
                      <Music className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.totalSongs}</div>
                      <p className="text-xs text-muted-foreground">
                        オリジナル: {analytics.talentStats.reduce((sum, t) => sum + t.originalSongs, 0)} | カバー:{" "}
                        {analytics.talentStats.reduce((sum, t) => sum + t.coverSongs, 0)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">総タレント数</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.totalTalents}</div>
                      <p className="text-xs text-muted-foreground">アクティブタレント</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">総再生数</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        平均:{" "}
                        {analytics.totalSongs > 0
                          ? Math.round(analytics.totalViews / analytics.totalSongs).toLocaleString()
                          : 0}{" "}
                        回/曲
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">総いいね数</CardTitle>
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics.totalLikes.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        エンゲージメント率:{" "}
                        {analytics.totalViews > 0
                          ? ((analytics.totalLikes / analytics.totalViews) * 100).toFixed(2)
                          : 0}
                        %
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>人気楽曲 TOP 10</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.popularSongs.map((song, index) => (
                          <div
                            key={song.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                              {index + 1}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground leading-tight line-clamp-2 text-sm">
                                    {song.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{song.talent_name}</p>
                                </div>

                                <div className="flex-shrink-0 text-right">
                                  <div className="text-sm font-medium text-foreground whitespace-nowrap">
                                    {song.view_count.toLocaleString()}
                                  </div>
                                  <div className="text-xs text-muted-foreground">回再生</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>最近追加された楽曲</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics.recentSongs.map((song) => (
                          <div key={song.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{song.title}</p>
                              <p className="text-sm text-muted-foreground">{song.talent_name}</p>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(song.created_at).toLocaleDateString("ja-JP")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "charts" && (
              <div className="space-y-8">
                <TalentPerformanceChart data={analytics.talentStats} limit={15} />
                <MonthlyTrendsChart data={analytics.monthlyTrends} />
                <BranchComparisonChart data={analytics.branchStats} />
                <TopSongsChart
                  originalSongs={analytics.topOriginalSongs}
                  coverSongs={analytics.topCoverSongs}
                  talentStats={analytics.talentStats}
                />
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-8">
                <TalentStatsTable data={analytics.talentStats} limit={20} />

                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>支部別詳細統計</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left p-2 font-medium">支部</th>
                              <th className="text-right p-2 font-medium">タレント数</th>
                              <th className="text-right p-2 font-medium">楽曲数</th>
                              <th className="text-right p-2 font-medium">総再生数</th>
                              <th className="text-right p-2 font-medium">平均再生数</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics.branchStats.map((branch) => (
                              <tr key={branch.branch} className="border-b border-border/50">
                                <td className="p-2 font-medium">{branch.branch}</td>
                                <td className="text-right p-2">{branch.talentCount}</td>
                                <td className="text-right p-2">{branch.totalSongs}</td>
                                <td className="text-right p-2">{branch.totalViews.toLocaleString()}</td>
                                <td className="text-right p-2">{branch.avgViewsPerSong.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>月別アップロード詳細</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.monthlyTrends.slice(0, 6).map((trend) => (
                          <div
                            key={trend.month}
                            className="flex justify-between items-center p-2 rounded-lg bg-muted/50"
                          >
                            <div>
                              <p className="font-medium">
                                {new Date(trend.month).toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                オリジナル: {trend.originalUploads} | カバー: {trend.coverUploads}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{trend.totalUploads} 曲</p>
                              <p className="text-sm text-muted-foreground">
                                平均 {trend.avgViews.toLocaleString()} 回再生
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-8">
                <AIAnalysisSummary analyticsData={analytics} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
