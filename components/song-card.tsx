"use client"

import { Play, Heart, MessageCircle, Eye, Calendar, Music, User } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Song } from "@/types/song"
import Link from "next/link"

interface SongCardProps {
  song: Song
}

export function SongCard({ song }: SongCardProps) {
  const formatNumber = (num: bigint | null) => {
    if (!num) return "0"
    const n = Number(num)
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return n.toString()
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

  return (
    <Link href={`/songs/${song.id}`} className="block h-full">
      <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer h-full flex flex-col w-full min-w-0">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {song.title}
              </h3>
              {song.titleJp && song.titleJp !== song.title && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{song.titleJp}</p>
              )}
            </div>
            <Badge className={`${getTypeColor(song.type)} flex-shrink-0`}>{getTypeLabel(song.type)}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">タレント:</span>
            </div>
            <div className="flex flex-wrap gap-1 min-w-0">
              {song.talents.map((talent) => (
                <Badge key={talent.id} variant="outline" className="text-xs">
                  {talent.nameJp || talent.name} ({talent.branch})
                </Badge>
              ))}
            </div>
          </div>

          {(song.lyrics || song.composer) && (
            <div className="space-y-1 text-sm">
              {song.lyrics && (
                <div className="flex items-center gap-2 min-w-0">
                  <Music className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground flex-shrink-0">作詞:</span>
                  <span className="text-foreground truncate">{song.lyrics}</span>
                </div>
              )}
              {song.composer && (
                <div className="flex items-center gap-2 min-w-0">
                  <Music className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground flex-shrink-0">作曲:</span>
                  <span className="text-foreground truncate">{song.composer}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{formatNumber(song.viewCount)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                <span>{formatNumber(song.likeCount)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{formatNumber(song.commentCount)}</span>
              </div>
            </div>

            {song.releaseDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{song.releaseDate.toLocaleDateString("ja-JP")}</span>
              </div>
            )}
          </div>

          {song.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 min-w-0">
              {song.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {song.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{song.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {song.videoUrl && (
            <div className="pt-2 mt-auto">
              <a
                href={song.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>動画を見る</span>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
