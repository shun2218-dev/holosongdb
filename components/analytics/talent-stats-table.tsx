"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TalentStat {
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
}

interface TalentStatsTableProps {
  data: TalentStat[]
  limit?: number
}

export function TalentStatsTable({ data, limit = 10 }: TalentStatsTableProps) {
  const sortTalentsByBranchAndDebut = (talents: TalentStat[]) => {
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

      // 同じ支部内では総再生数順（多い順）
      return b.totalViews - a.totalViews
    })
  }

  const displayData = sortTalentsByBranchAndDebut(data).slice(0, limit)

  return (
    <Card>
      <CardHeader>
        <CardTitle>タレント別詳細統計</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 font-medium">タレント</th>
                <th className="text-left p-2 font-medium">支部</th>
                <th className="text-right p-2 font-medium">総楽曲数</th>
                <th className="text-right p-2 font-medium">オリジナル</th>
                <th className="text-right p-2 font-medium">カバー</th>
                <th className="text-right p-2 font-medium">総再生数</th>
                <th className="text-right p-2 font-medium">平均再生数</th>
                <th className="text-right p-2 font-medium">オリジナル平均</th>
                <th className="text-left p-2 font-medium">最高再生楽曲</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((talent, index) => (
                <tr key={talent.id} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="p-2">
                    <div>
                      <div className="font-medium">{talent.nameJp || talent.name}</div>
                      {talent.generation && <div className="text-xs text-muted-foreground">{talent.generation}</div>}
                    </div>
                  </td>
                  <td className="p-2">
                    <Badge variant="outline" className="text-xs">
                      {talent.branch}
                    </Badge>
                  </td>
                  <td className="text-right p-2 font-medium">{talent.totalSongs}</td>
                  <td className="text-right p-2 text-primary">{talent.originalSongs}</td>
                  <td className="text-right p-2 text-chart-2">{talent.coverSongs}</td>
                  <td className="text-right p-2 font-medium">{talent.totalViews.toLocaleString()}</td>
                  <td className="text-right p-2">{talent.avgViews.toLocaleString()}</td>
                  <td className="text-right p-2 text-primary">
                    {talent.avgOriginalViews > 0 ? talent.avgOriginalViews.toLocaleString() : "-"}
                  </td>
                  <td className="p-2 max-w-[200px]">
                    {talent.mostViewedSong ? (
                      <div className="space-y-1">
                        <div className="text-xs font-medium line-clamp-2 leading-tight">{talent.mostViewedSong}</div>
                        {talent.mostViewedCount > 0 && (
                          <div className="text-xs text-muted-foreground whitespace-nowrap">
                            {talent.mostViewedCount.toLocaleString()} 回再生
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">-</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
