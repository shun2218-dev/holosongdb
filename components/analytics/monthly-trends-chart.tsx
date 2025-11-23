"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MonthlyTrend {
  month: string
  totalUploads: number
  originalUploads: number
  coverUploads: number
  avgViews: number
}

interface MonthlyTrendsChartProps {
  data: MonthlyTrend[]
}

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  const chartData = data
    .map((trend) => ({
      月: new Date(trend.month).toLocaleDateString("ja-JP", { year: "numeric", month: "short" }),
      総アップロード数: trend.totalUploads,
      オリジナル楽曲: trend.originalUploads,
      カバー楽曲: trend.coverUploads,
      平均再生数: Math.round(trend.avgViews / 1000), // 千単位
    }))
    .reverse() // 古い順に並び替え

  return (
    <Card>
      <CardHeader>
        <CardTitle>月別アップロード傾向（過去12ヶ月）</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              dataKey="総アップロード数"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
            />
            <Line
              type="monotone"
              dataKey="オリジナル楽曲"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-1))" }}
            />
            <Line
              type="monotone"
              dataKey="カバー楽曲"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-2))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
