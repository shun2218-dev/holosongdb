import type { Song } from "@/types/song"

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HoloSong DB",
    alternateName: "ホロライブ楽曲データベース",
    description: "ホロライブプロダクションのオリジナル曲や歌ってみた動画を検索できる非公式ファンサイト",
    url: "https://www.holosongdb.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.holosongdb.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "ja",
    publisher: {
      "@type": "Organization",
      name: "HoloSong DB",
      url: "https://www.holosongdb.com",
    },
  }
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HoloSong DB",
    alternateName: "ホロライブ楽曲データベース",
    url: "https://www.holosongdb.com",
    logo: "https://www.holosongdb.com/og-image.jpg",
    description: "ホロライブプロダクションの楽曲データベース",
    sameAs: ["https://www.holosongdb.com"],
  }
}

export function generateMusicRecordingSchema(song: Song) {
  return {
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    name: song.title,
    alternateName: song.titleJp || undefined,
    description: song.description || `${song.title} - ${song.talents.map((t) => t.nameJp || t.name).join(", ")}`,
    url: song.videoUrl || undefined,
    duration: song.duration || undefined,
    inLanguage: song.language || "ja",
    recordingOf: {
      "@type": "MusicComposition",
      name: song.title,
      composer: song.composer
        ? {
            "@type": "Person",
            name: song.composer,
          }
        : undefined,
      lyricist: song.lyrics
        ? {
            "@type": "Person",
            name: song.lyrics,
          }
        : undefined,
    },
    byArtist: song.talents.map((talent) => ({
      "@type": "MusicGroup",
      name: talent.nameJp || talent.name,
    })),
    datePublished: song.releaseDate?.toISOString() || undefined,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/WatchAction",
        userInteractionCount: song.viewCount ? Number(song.viewCount) : 0,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: song.likeCount ? Number(song.likeCount) : 0,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: song.commentCount ? Number(song.commentCount) : 0,
      },
    ],
    keywords: song.tags.join(", "),
  }
}

export function generateItemListSchema(songs: Song[], listName: string, listUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    description: `${listName}の一覧`,
    url: listUrl,
    numberOfItems: songs.length,
    itemListElement: songs.map((song, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "MusicRecording",
        name: song.title,
        alternateName: song.titleJp || undefined,
        url: song.videoUrl || undefined,
        byArtist: song.talents.map((talent) => ({
          "@type": "MusicGroup",
          name: talent.nameJp || talent.name,
        })),
      },
    })),
  }
}

export function generatePersonSchema(name: string, id: string, imageUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: name,
    url: `https://www.holosongdb.com/talents/${id}`,
    image: imageUrl || undefined,
    description: `${name}の楽曲一覧`,
    memberOf: {
      "@type": "Organization",
      name: "ホロライブプロダクション",
    },
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
