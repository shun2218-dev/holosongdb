"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RefreshButton } from "@/components/refresh-button"
import { ArrowLeft, Home, Search, TrendingUp, Users, Settings } from "lucide-react"
import { usePWAMode } from "@/hooks/use-pwa-mode"
import { useIsMobileDevice } from "@/hooks/use-is-mobile-device"

const PAGE_CONFIG: Record<
  string,
  {
    title: string
    subtitle?: string
    backHref?: string
    backLabel?: string
    showHomeLink?: boolean
  }
> = {
  "/": {
    title: "HoloSong DB",
    subtitle: "ホロライブ楽曲データベース",
  },
  "/search": {
    title: "楽曲検索",
    subtitle: "楽曲を検索できます",
    backHref: "/",
  },
  "/popular": {
    title: "人気楽曲ランキング",
    subtitle: "人気の楽曲をチェック",
    backHref: "/",
  },
  "/talents": {
    title: "タレント一覧",
    subtitle: "ホロライブのタレント",
    backHref: "/",
  },
  "/settings": {
    title: "設定",
    subtitle: "アプリの設定を管理",
    backHref: "/",
  },
  "/settings/oshi": {
    title: "推し設定",
    subtitle: "お気に入りのタレントを選択すると、そのタレントに関連する通知のみを受け取れます",
    backHref: "/settings",
  },
  "/settings/notifications": {
    title: "通知設定",
    subtitle: "プッシュ通知の設定を管理できます",
    backHref: "/settings",
  },
}

export function DynamicHeader() {
  const pathname = usePathname()
  const isPWA = usePWAMode()
  const isMobileDevice = useIsMobileDevice()

  const useMobileUI = isPWA || isMobileDevice

  let config = PAGE_CONFIG[pathname]

  // Handle dynamic routes
  if (!config) {
    if (pathname.startsWith("/songs/")) {
      config = {
        title: "楽曲詳細",
        backHref: "/search",
      }
    } else if (pathname.match(/^\/talents\/[^/]+\/stats$/)) {
      config = {
        title: "タレント統計",
        backHref: pathname.replace("/stats", ""),
      }
    } else if (pathname.startsWith("/talents/")) {
      config = {
        title: "タレント詳細",
        backHref: "/talents",
      }
    } else if (pathname.startsWith("/admin")) {
      // Admin pages don't use this header
      return null
    } else {
      // Default fallback
      config = {
        title: "HoloSong DB",
        backHref: "/",
      }
    }
  }

  const { title, subtitle, backHref, backLabel = "戻る", showHomeLink = false } = config

  if (pathname === "/") {
    return (
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className={`md:hidden ${useMobileUI ? "flex" : "hidden"} items-center gap-4`}>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
          </div>

          <div className={`${useMobileUI ? "hidden" : "flex"} md:flex items-center justify-between gap-4`}>
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground mt-1 hidden sm:block">{subtitle}</p>}
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-2 flex-shrink-0">
              <Link href="/search">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>楽曲検索</span>
                </Button>
              </Link>
              <Link href="/popular">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>人気楽曲</span>
                </Button>
              </Link>
              <Link href="/talents">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>タレント</span>
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>設定</span>
                </Button>
              </Link>
            </nav>

            <div className="flex items-center gap-2 flex-shrink-0">
              <RefreshButton />
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className={`md:hidden ${useMobileUI ? "flex" : "hidden"} items-center gap-4`}>
          {backHref && (
            <Link href={backHref}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <h1 className="text-xl font-bold text-foreground truncate">{title}</h1>
        </div>

        <div className={`${useMobileUI ? "hidden" : "flex"} md:flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {backHref && (
              <Link href={backHref}>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">{backLabel}</span>
                </Button>
              </Link>
            )}
            {showHomeLink && (
              <Link href="/">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">ホーム</span>
                </Button>
              </Link>
            )}
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground mt-1 hidden sm:block">{subtitle}</p>}
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2 flex-shrink-0">
            <Link href="/search">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>楽曲検索</span>
              </Button>
            </Link>
            <Link href="/popular">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>人気楽曲</span>
              </Button>
            </Link>
            <Link href="/talents">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>タレント</span>
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>設定</span>
              </Button>
            </Link>
          </nav>

          <div className="flex items-center gap-2 flex-shrink-0">
            <RefreshButton />
          </div>
        </div>
      </div>
    </header>
  )
}
