"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CustomBarProps } from "@/types/chart"

interface TopSong {
  id: string
  title: string
  viewCount: number
  likeCount: number
  talentName: string
  branch: string
}

interface TopSongsChartProps {
  originalSongs: TopSong[]
  coverSongs: TopSong[]
  talentStats?: Array<{
    name: string
    nameJp: string
    mainColor?: string
  }>
}

const SONG_COLORS = [
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
]

export function TopSongsChart({ originalSongs, coverSongs, talentStats = [] }: TopSongsChartProps) {
  const getTalentColor = (talentName: string, index: number) => {
    const talent = talentStats.find(
      (t) =>
        t.name === talentName ||
        t.nameJp === talentName ||
        talentName.includes(t.name) ||
        talentName.includes(t.nameJp || ""),
    )
    return talent?.mainColor || SONG_COLORS[index % SONG_COLORS.length]
  }

  const originalData = originalSongs.slice(0, 5).map((song, index) => ({
    title: song.title.length > 20 ? song.title.substring(0, 20) + "..." : song.title,
    再生数: Math.round(song.viewCount / 1000), // 千単位
    いいね数: Math.round(song.likeCount / 100), // 百単位
    talent: song.talentName,
    color: getTalentColor(song.talentName, index),
  }))

  const coverData = coverSongs.slice(0, 5).map((song, index) => ({
    title: song.title.length > 20 ? song.title.substring(0, 20) + "..." : song.title,
    再生数: Math.round(song.viewCount / 1000), // 千単位
    いいね数: Math.round(song.likeCount / 100), // 百単位
    talent: song.talentName,
    color: getTalentColor(song.talentName, index),
  }))

  const CustomBar = ({ fill, ...props }: CustomBarProps) => {
    const color = props.payload?.color || fill
    return <Bar {...props} fill={color} />
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>人気オリジナル楽曲 TOP 5</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={originalData} layout="horizontal" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs fill-muted-foreground" />
              <YAxis type="category" dataKey="title" className="text-xs fill-muted-foreground" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
                formatter={(value, name) => [name === "再生数" ? `${value}k回` : `${value * 100}`, name]}
              />
              {originalData.map((entry, index) => (
                <Bar key={index} dataKey="再生数" fill={entry.color} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>人気カバー楽曲 TOP 5</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={coverData} layout="horizontal" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs fill-muted-foreground" />
              <YAxis type="category" dataKey="title" className="text-xs fill-muted-foreground" width={100} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
                formatter={(value, name) => [name === "再生数" ? `${value}k回` : `${value * 100}`, name]}
              />
              {coverData.map((entry, index) => (
                <Bar key={index} dataKey="再生数" fill={entry.color} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
