"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, TrendingUp } from "lucide-react"
import { InlineLoading } from "@/components/ui/loading"

interface OshiStats {
  totalUsers: number
  totalPreferences: number
  avgOshiPerUser: string
  popularOshi: Array<{
    id: string
    name: string
    nameJp: string | null
    nameEn: string | null
    branch: string
    mainColor: string | null
    preferenceCount: number
  }>
  branchStats: Array<{
    branch: string
    preferenceCount: number
  }>
}

export function OshiStatsCard() {
  const [stats, setStats] = useState<OshiStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/oshi-stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error("[v0] Error fetching oshi stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const getBranchColor = (branch: string) => {
    switch (branch) {
      case "JP":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "EN":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "ID":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "DEV_IS":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            推し統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InlineLoading text="統計を読み込み中..." />
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            推し統計
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">統計データがありません</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          推し統計
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">登録ユーザー</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">総推し数</p>
            <p className="text-2xl font-bold">{stats.totalPreferences}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">平均推し数</p>
            <p className="text-2xl font-bold">{stats.avgOshiPerUser}</p>
          </div>
        </div>

        {/* Branch Stats */}
        {stats.branchStats.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              ブランチ別
            </h4>
            <div className="flex flex-wrap gap-2">
              {stats.branchStats.map((branch) => (
                <Badge key={branch.branch} variant="outline" className={getBranchColor(branch.branch)}>
                  {branch.branch}: {branch.preferenceCount}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Popular Oshi */}
        {stats.popularOshi.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              人気の推し (Top 10)
            </h4>
            <div className="space-y-2">
              {stats.popularOshi.map((oshi, index) => {
                const displayName = oshi.nameJp || oshi.nameEn || oshi.name
                return (
                  <div key={oshi.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}</span>
                      {oshi.mainColor && (
                        <div
                          className="w-3 h-3 rounded-full border border-border flex-shrink-0"
                          style={{ backgroundColor: oshi.mainColor }}
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium">{displayName}</p>
                        <Badge variant="outline" className={`${getBranchColor(oshi.branch)} text-xs`}>
                          {oshi.branch}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{oshi.preferenceCount}</p>
                      <p className="text-xs text-muted-foreground">ユーザー</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
