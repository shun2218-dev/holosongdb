"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import {
  Menu,
  LogOut,
  ExternalLink,
  Bell,
  Music,
  Users,
  BarChart3,
  Database,
  Settings,
  Monitor,
  CheckCircle,
} from "lucide-react"

interface Admin {
  id: string
  username: string
  email: string
  role: string
}

interface MobileHeaderProps {
  admin: Admin
  onLogout: () => void
  isLoggingOut: boolean
}

export function MobileHeader({ admin, onLogout, isLoggingOut }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-destructive text-destructive-foreground"
      case "ADMIN":
        return "bg-primary text-primary-foreground"
      case "EDITOR":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "スーパー管理者"
      case "ADMIN":
        return "管理者"
      case "EDITOR":
        return "編集者"
      default:
        return role
    }
  }

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">管理者ダッシュボード</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Hololive楽曲データベース管理システム
            </p>
          </div>

          <div>
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2" aria-label="メニューを開く">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader className="sr-only">
                  <SheetTitle>管理者メニュー</SheetTitle>
                  <SheetDescription>管理者向けのナビゲーションメニューです</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <div className="flex-1 py-6">
                    <div className="space-y-6">
                      <div className="text-center border-b border-border pb-4">
                        <p className="font-medium text-foreground text-lg">{admin.username}</p>
                        <div className="flex justify-center mt-2">
                          <Badge className={getRoleColor(admin.role)}>{getRoleLabel(admin.role)}</Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground px-2">メイン機能</h3>
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>ダッシュボード</span>
                        </Link>
                        <Link
                          href="/admin/songs"
                          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Music className="h-4 w-4" />
                          <span>楽曲管理</span>
                        </Link>
                        <Link
                          href="/admin/talents"
                          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Users className="h-4 w-4" />
                          <span>タレント管理</span>
                        </Link>
                        <Link
                          href="/admin/generations"
                          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Users className="h-4 w-4" />
                          <span>期生管理</span>
                        </Link>
                        <Link
                          href="/admin/analytics"
                          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span>統計情報</span>
                        </Link>
                        {(admin.role === "SUPER_ADMIN" || admin.role === "ADMIN") && (
                          <Link
                            href="/admin/notifications"
                            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Bell className="h-4 w-4" />
                            <span>通知管理</span>
                          </Link>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground px-2">システム</h3>
                        <Link
                          href="/admin/database"
                          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Database className="h-4 w-4" />
                          <span>データベース</span>
                        </Link>
                        {(admin.role === "SUPER_ADMIN" || admin.role === "ADMIN") && (
                          <Link
                            href="/admin/settings"
                            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4" />
                            <span>システム設定</span>
                          </Link>
                        )}
                        {admin.role === "SUPER_ADMIN" && (
                          <>
                            <Link
                              href="/admin/e2e-testing"
                              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Monitor className="h-4 w-4" />
                              <span>E2Eテスト</span>
                            </Link>
                            <Link
                              href="/admin/testing"
                              className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>テスト管理</span>
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground px-2">その他</h3>
                        <Link
                          href="/"
                          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-sm"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>サイトを表示</span>
                        </Link>
                        <button
                          onClick={() => {
                            onLogout()
                            setIsMenuOpen(false)
                          }}
                          disabled={isLoggingOut}
                          className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors text-sm w-full text-left text-destructive hover:text-destructive"
                          aria-label={isLoggingOut ? "ログアウト処理中" : "管理者アカウントからログアウト"}
                        >
                          <LogOut className="h-4 w-4" />
                          <span>{isLoggingOut ? "ログアウト中..." : "ログアウト"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
