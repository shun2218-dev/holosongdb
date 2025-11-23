import { notFound } from "next/navigation"
import { getSongById } from "@/lib/queries"
import { YouTubeEmbed } from "@/components/youtube-embed"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Eye, Heart, MessageCircle, Music, User, Clock } from "lucide-react"
import Link from "next/link"
import { generateMusicRecordingSchema, generateBreadcrumbSchema } from "@/lib/structured-data"
import { DynamicBreadcrumb } from "@/components/dynamic-breadcrumb"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SongDetailPage({ params }: PageProps) {
  const { id } = await params
  const song = await getSongById(id)

  if (!song) {
    notFound()
  }

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

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "ホーム", url: "https://www.holosongdb.com" },
    { name: "楽曲", url: "https://www.holosongdb.com/search" },
    { name: song.title, url: `https://www.holosongdb.com/songs/${song.id}` },
  ])

  const musicRecordingSchema = generateMusicRecordingSchema(song)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(musicRecordingSchema) }} />

      <main className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        <DynamicBreadcrumb />

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            {/* <Link href="/" className="hover:text-foreground transition-colors">
              ホーム
            </Link>
            <span>/</span>
            <Link href="/search" className="hover:text-foreground transition-colors">
              楽曲
            </Link>
            <span>/</span>
            <span className="text-foreground">{song.title}</span> */}
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{song.title}</h1>
              {song.titleJp && song.titleJp !== song.title && (
                <p className="text-xl text-muted-foreground">{song.titleJp}</p>
              )}
            </div>
            <Badge className={getTypeColor(song.type)}>{getTypeLabel(song.type)}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Embed */}
            {song.videoId && (
              <Card>
                <CardContent className="p-6">
                  <YouTubeEmbed videoId={song.videoId} title={song.title} />
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {song.description && (
              <Card>
                <CardHeader>
                  <CardTitle>説明</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{song.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>統計情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <Eye className="h-5 w-5 text-muted-foreground mb-2" />
                    <span className="text-2xl font-bold">{formatNumber(song.viewCount)}</span>
                    <span className="text-sm text-muted-foreground">再生回数</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <Heart className="h-5 w-5 text-muted-foreground mb-2" />
                    <span className="text-2xl font-bold">{formatNumber(song.likeCount)}</span>
                    <span className="text-sm text-muted-foreground">高評価</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                    <MessageCircle className="h-5 w-5 text-muted-foreground mb-2" />
                    <span className="text-2xl font-bold">{formatNumber(song.commentCount)}</span>
                    <span className="text-sm text-muted-foreground">コメント</span>
                  </div>
                  {song.duration && (
                    <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                      <Clock className="h-5 w-5 text-muted-foreground mb-2" />
                      <span className="text-2xl font-bold">{song.duration}</span>
                      <span className="text-sm text-muted-foreground">再生時間</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Talents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  タレント
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {song.talents.map((talent) => (
                    <Link
                      key={talent.id}
                      href={`/talents/${talent.id}`}
                      className="block p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="font-medium">{talent.nameJp || talent.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {talent.branch} - {talent.generation}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>詳細情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {song.releaseDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-muted-foreground">公開日</div>
                      <div className="font-medium">{song.releaseDate.toLocaleDateString("ja-JP")}</div>
                    </div>
                  </div>
                )}

                {song.lyrics && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2">
                      <Music className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-muted-foreground">作詞</div>
                        <div className="font-medium">{song.lyrics}</div>
                      </div>
                    </div>
                  </>
                )}

                {song.composer && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2">
                      <Music className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-muted-foreground">作曲</div>
                        <div className="font-medium">{song.composer}</div>
                      </div>
                    </div>
                  </>
                )}

                {song.arranger && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2">
                      <Music className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-muted-foreground">編曲</div>
                        <div className="font-medium">{song.arranger}</div>
                      </div>
                    </div>
                  </>
                )}

                {song.mixer && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2">
                      <Music className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-muted-foreground">ミックス</div>
                        <div className="font-medium">{song.mixer}</div>
                      </div>
                    </div>
                  </>
                )}

                {song.illustrator && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2">
                      <Music className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-muted-foreground">イラスト</div>
                        <div className="font-medium">{song.illustrator}</div>
                      </div>
                    </div>
                  </>
                )}

                {song.language && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2">
                      <Music className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-muted-foreground">言語</div>
                        <div className="font-medium">{song.language}</div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {song.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>タグ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {song.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* External Link */}
            {song.videoUrl && (
              <Card>
                <CardContent className="p-4">
                  <a
                    href={song.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 px-4 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    YouTubeで見る
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
