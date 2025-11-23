"use client"

import { usePathname } from "next/navigation"
import { Breadcrumb } from "@/components/breadcrumb"

const BREADCRUMB_CONFIG: Record<string, Array<{ name: string; href?: string }>> = {
  "/search": [{ name: "ホーム", href: "/" }, { name: "楽曲検索" }],
  "/popular": [{ name: "ホーム", href: "/" }, { name: "人気楽曲" }],
  "/talents": [{ name: "ホーム", href: "/" }, { name: "タレント一覧" }],
  "/settings": [{ name: "ホーム", href: "/" }, { name: "設定" }],
  "/settings/oshi": [{ name: "ホーム", href: "/" }, { name: "設定", href: "/settings" }, { name: "推し設定" }],
  "/settings/notifications": [{ name: "ホーム", href: "/" }, { name: "設定", href: "/settings" }, { name: "通知設定" }],
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()

  // Don't show breadcrumb on home or admin pages
  if (pathname === "/" || pathname.startsWith("/admin")) {
    return null
  }

  // Get breadcrumb items
  let items = BREADCRUMB_CONFIG[pathname]

  // Handle dynamic routes
  if (!items) {
    if (pathname.startsWith("/songs/")) {
      items = [{ name: "ホーム", href: "/" }, { name: "楽曲検索", href: "/search" }, { name: "楽曲詳細" }]
    } else if (pathname.match(/^\/talents\/[^/]+\/stats$/)) {
      items = [
        { name: "ホーム", href: "/" },
        { name: "タレント一覧", href: "/talents" },
        { name: "タレント詳細", href: pathname.replace("/stats", "") },
        { name: "統計情報" },
      ]
    } else if (pathname.startsWith("/talents/")) {
      items = [{ name: "ホーム", href: "/" }, { name: "タレント一覧", href: "/talents" }, { name: "タレント詳細" }]
    }
  }

  // If no breadcrumb config found, don't render
  if (!items) {
    return null
  }

  return <Breadcrumb items={items} />
}
