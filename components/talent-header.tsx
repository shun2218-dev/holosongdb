"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Music, BarChart3, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface TalentHeaderProps {
  talent: {
    id: string
    name: string
    nameJp: string | null
    nameEn: string | null
    branch: string
    generation: string | null
    debut: string | null
    subscriberCount: string | null
    mainColor: string | null
    image_url?: string | null
    blur_data_url?: string | null
    channelId?: string | null
    original_count?: number
    cover_count?: number
    total_songs?: number
  }
}

export function TalentHeader({ talent }: TalentHeaderProps) {
  const displayName = talent.nameJp || talent.nameEn || talent.name

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

  const getBranchName = (branch: string) => {
    switch (branch) {
      case "JP":
        return "ホロライブ"
      case "EN":
        return "ホロライブEN"
      case "ID":
        return "ホロライブID"
      case "DEV_IS":
        return "DEV_IS"
      default:
        return branch
    }
  }

  const formatSubscriberCount = (count: string | null) => {
    if (!count) return null
    const num = Number.parseInt(count)
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toLocaleString()
  }

  const subscriberCount = formatSubscriberCount(talent.subscriberCount)

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Talent Image/Color */}
          <div className="flex-shrink-0">
            {talent.image_url ? (
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-border">
                <Image
                  src={talent.image_url || "/placeholder.svg"}
                  alt={displayName}
                  fill
                  sizes="128px"
                  className="object-cover"
                  priority
                  placeholder={talent.blur_data_url ? "blur" : "empty"}
                  blurDataURL={talent.blur_data_url || undefined}
                />
              </div>
            ) : (
              <div
                className="w-32 h-32 rounded-full border-4 border-border"
                style={{
                  backgroundColor: talent.mainColor || "#4ECDC4",
                }}
              />
            )}
          </div>

          {/* Talent Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {talent.mainColor && (
                  <div
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: talent.mainColor }}
                  />
                )}
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{displayName}</h2>
              </div>
              {talent.nameJp && talent.nameJp !== talent.name && <p className="text-muted-foreground">{talent.name}</p>}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={getBranchColor(talent.branch)}>
                {getBranchName(talent.branch)}
              </Badge>
              {talent.generation && <Badge variant="secondary">{talent.generation}</Badge>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {subscriberCount && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">登録者:</span>
                  <span className="font-semibold">{subscriberCount}</span>
                </div>
              )}
              {talent.debut && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">デビュー:</span>
                  <span className="font-semibold">{new Date(talent.debut).toLocaleDateString("ja-JP")}</span>
                </div>
              )}
              {talent.total_songs !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <Music className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">総楽曲数:</span>
                  <span className="font-semibold">{talent.total_songs}曲</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link href={`/talents/${talent.id}/stats`}>
                <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                  <BarChart3 className="h-4 w-4" />
                  統計情報
                </Button>
              </Link>
              {talent.channelId && (
                <a
                  href={`https://www.youtube.com/channel/${talent.channelId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <ExternalLink className="h-4 w-4" />
                    YouTubeチャンネル
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
