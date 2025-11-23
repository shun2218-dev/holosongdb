"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, TrendingUp, Users, Settings, Home } from "lucide-react"

export function PWABottomNav() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "ホーム",
      active: pathname === "/",
    },
    {
      href: "/search",
      icon: Search,
      label: "検索",
      active: pathname === "/search",
    },
    {
      href: "/popular",
      icon: TrendingUp,
      label: "人気",
      active: pathname === "/popular",
    },
    {
      href: "/talents",
      icon: Users,
      label: "タレント",
      active: pathname === "/talents" || pathname?.startsWith("/talents/"),
    },
    {
      href: "/settings",
      icon: Settings,
      label: "設定",
      active: pathname?.startsWith("/settings"),
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-area-pb md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center flex-1 h-full transition-colors ${
                item.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label={item.label}
            >
              <Icon className="h-6 w-6" />
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
