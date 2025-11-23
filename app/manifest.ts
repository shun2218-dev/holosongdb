import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hololive楽曲データベース",
    short_name: "Hololive楽曲DB",
    description: "ホロライブの楽曲を検索・閲覧できるデータベースアプリ",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#27C7FF",
    orientation: "portrait",
    categories: ["music", "entertainment"],
    lang: "ja",
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/icon-192x192.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-192x192.jpg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  }
}
