"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Music, Users, BarChart3, Bell } from "lucide-react"

interface NavItem {
  href: string
  icon: React.ReactNode
  label: string
  activePattern?: RegExp
}

export function MobileBottomNav() {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      href: "/admin",
      icon: <Home className="h-5 w-5" />,
      label: "ホーム",
      activePattern: /^\/admin$/,
    },
    {
      href: "/admin/songs",
      icon: <Music className="h-5 w-5" />,
      label: "楽曲",
      activePattern: /^\/admin\/songs/,
    },
    {
      href: "/admin/talents",
      icon: <Users className="h-5 w-5" />,
      label: "タレント",
      activePattern: /^\/admin\/talents/,
    },
    {
      href: "/admin/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      label: "統計",
      activePattern: /^\/admin\/analytics/,
    },
    {
      href: "/admin/notifications",
      icon: <Bell className="h-5 w-5" />,
      label: "通知",
      activePattern: /^\/admin\/notifications/,
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = item.activePattern ? item.activePattern.test(pathname) : pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-0 flex-1",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {item.icon}
              <span className="text-xs font-medium truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
