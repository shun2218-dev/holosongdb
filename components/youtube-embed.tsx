"use client"

interface YouTubeEmbedProps {
  videoId: string
  title: string
}

export function YouTubeEmbed({ videoId, title }: YouTubeEmbedProps) {
  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={`${title} - YouTube動画`}
        aria-label={`${title}のYouTube動画プレーヤー`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        loading="lazy"
      />
    </div>
  )
}
