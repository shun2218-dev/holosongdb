"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TooltipProps } from "@/types/chart"

interface TalentStat {
  id: string
  name: string
  nameJp: string
  branch: string
  totalSongs: number
  originalSongs: number
  coverSongs: number
  totalViews: number
  originalViews: number
  coverViews: number
  avgViews: number
  avgOriginalViews: number
  avgCoverViews: number
  mainColor?: string
}

interface TalentPerformanceChartProps {
  data: TalentStat[]
  limit?: number
}

const TALENT_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#FFB6C1",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
  "#F1948A",
  "#85C1E9",
  "#F8D7DA",
  "#D5DBDB",
  "#AED6F1",
  "#A9DFBF",
  "#F9E79F",
]

export function TalentPerformanceChart({ data, limit = 10 }: TalentPerformanceChartProps) {
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

  const chartData = sortTalentsByBranchAndDebut(data)
    .slice(0, limit)
    .map((talent, index) => ({
      name: talent.nameJp || talent.name,
      オリジナル楽曲数: talent.originalSongs,
      カバー楽曲数: talent.coverSongs,
      総再生数: Math.round(talent.totalViews / 1000000), // 百万単位
      平均再生数: Math.round(talent.avgViews / 1000), // 千単位
      color: talent.mainColor || TALENT_COLORS[index % TALENT_COLORS.length],
    }))

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium" style={{ color: data.color }}>
            {label}
          </p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry.name}: {entry.value.toLocaleString()}
              {entry.name === "総再生数" ? "M" : entry.name === "平均再生数" ? "k" : ""}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>タレント別パフォーマンス（上位{limit}名）</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs fill-muted-foreground" angle={-45} textAnchor="end" height={80} />
            <YAxis className="text-xs fill-muted-foreground" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="オリジナル楽曲数" stackId="songs">
              {chartData.map((entry, index) => (
                <Cell key={`original-${index}`} fill={entry.color} />
              ))}
            </Bar>
            <Bar dataKey="カバー楽曲数" stackId="songs">
              {chartData.map((entry, index) => (
                <Cell key={`cover-${index}`} fill={`${entry.color}80`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
