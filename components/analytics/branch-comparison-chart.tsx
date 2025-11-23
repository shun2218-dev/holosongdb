"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TooltipProps } from "@/types/chart"

interface BranchStat {
  branch: string
  talentCount: number
  totalSongs: number
  totalViews: number
  avgViewsPerSong: number
  originalSongs: number
  coverSongs: number
}

interface BranchComparisonChartProps {
  data: BranchStat[]
}

const COLORS = [
  "hsl(var(--chart-1))", // #27C7FF - Blue
  "hsl(var(--chart-2))", // #ff6b6b - Red
  "#4ECDC4", // Teal
  "#45B7D1", // Light Blue
  "#96CEB4", // Mint Green
  "#FFEAA7", // Light Yellow
  "#DDA0DD", // Plum
  "#FFB6C1", // Light Pink
  "#98D8C8", // Seafoam
  "#F7DC6F", // Gold
  "#BB8FCE", // Lavender
  "#85C1E9", // Sky Blue
]

const BRANCH_COLORS: Record<string, string> = {
  JP: "#FF6B6B", // Red for JP
  EN: "#4ECDC4", // Teal for EN
  ID: "#FFEAA7", // Yellow for ID
  STARS: "#45B7D1", // Blue for STARS
  DEV_IS: "#96CEB4", // Green for DEV_IS
}

export function BranchComparisonChart({ data }: BranchComparisonChartProps) {
  const pieData = data.map((branch, index) => ({
    name: branch.branch,
    value: branch.totalViews,
    fill: BRANCH_COLORS[branch.branch] || COLORS[index % COLORS.length],
    songs: branch.totalSongs,
    talents: branch.talentCount,
  }))

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">総再生数: {data.value.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">楽曲数: {data.songs}</p>
          <p className="text-sm text-muted-foreground">タレント数: {data.talents}</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>支部別総再生数比較</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
