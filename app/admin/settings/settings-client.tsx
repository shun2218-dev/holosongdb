"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Users, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

interface AdminUser {
  id: string
  username: string
  email: string
  role: string
  created_at: string
}

interface Admin {
  id: string
  username: string
  email: string
  role: string
}

interface SettingsClientProps {
  admin: Admin
}

export function SettingsClient({ admin }: SettingsClientProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    email: "",
    password: "",
    role: "EDITOR",
  })
  const router = useRouter()

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admin/admins")
      if (response.ok) {
        const data = await response.json()
        setAdmins(data.admins || [])
      } else if (response.status === 401) {
        router.push("/admin/login")
      }
    } catch (error) {
      console.error("[v0] Admins fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (admin.role !== "SUPER_ADMIN") {
      alert("管理者の追加はスーパー管理者のみが実行できます")
      return
    }

    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdmin),
      })

      if (response.ok) {
        await fetchAdmins()
        setNewAdmin({ username: "", email: "", password: "", role: "EDITOR" })
        alert("管理者を追加しました")
      } else {
        alert("管理者の追加に失敗しました")
      }
    } catch (error) {
      console.error("[v0] Create admin error:", error)
      alert("エラーが発生しました")
    }
  }

  const handleDeleteAdmin = async (id: string) => {
    if (admin.role !== "SUPER_ADMIN") {
      alert("管理者の削除はスーパー管理者のみが実行できます")
      return
    }

    if (!confirm("本当にこの管理者を削除しますか？")) return

    try {
      const response = await fetch(`/api/admin/admins/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchAdmins()
        alert("管理者を削除しました")
      } else {
        alert("管理者の削除に失敗しました")
      }
    } catch (error) {
      console.error("[v0] Delete admin error:", error)
      alert("エラーが発生しました")
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  ダッシュボードに戻る
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">管理者設定</h1>
                <p className="text-muted-foreground">ユーザー管理とシステム設定</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                  <div className="h-6 bg-muted rounded w-40 animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="h-4 bg-muted rounded w-24 mb-2 animate-pulse" />
                    <div className="h-10 bg-muted rounded w-full animate-pulse" />
                  </div>
                  <div>
                    <div className="h-4 bg-muted rounded w-32 mb-2 animate-pulse" />
                    <div className="h-10 bg-muted rounded w-full animate-pulse" />
                  </div>
                  <div>
                    <div className="h-4 bg-muted rounded w-24 mb-2 animate-pulse" />
                    <div className="h-10 bg-muted rounded w-full animate-pulse" />
                  </div>
                  <div>
                    <div className="h-4 bg-muted rounded w-16 mb-2 animate-pulse" />
                    <div className="h-10 bg-muted rounded w-full animate-pulse" />
                  </div>
                  <div className="h-10 bg-muted rounded w-full animate-pulse" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                  <div className="h-6 bg-muted rounded w-24 animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="h-5 bg-muted rounded w-24 mb-1 animate-pulse" />
                        <div className="h-4 bg-muted rounded w-40 mb-1 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-16 animate-pulse" />
                      </div>
                      <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ダッシュボードに戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">管理者設定</h1>
              <p className="text-muted-foreground">ユーザー管理とシステム設定</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {admin.role === "SUPER_ADMIN" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  新しい管理者を追加
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div>
                    <Label htmlFor="username">ユーザー名</Label>
                    <Input
                      id="username"
                      value={newAdmin.username}
                      onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">パスワード</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">権限</Label>
                    <Select value={newAdmin.role} onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value })}>
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EDITOR">編集者</SelectItem>
                        <SelectItem value="ADMIN">管理者</SelectItem>
                        <SelectItem value="SUPER_ADMIN">スーパー管理者</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    管理者を追加
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card className={admin.role === "SUPER_ADMIN" ? "" : "lg:col-span-2"}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                管理者一覧
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {admins.map((adminUser) => (
                  <div key={adminUser.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{adminUser.username}</p>
                      <p className="text-sm text-muted-foreground">{adminUser.email}</p>
                      <p className="text-xs text-muted-foreground">{getRoleLabel(adminUser.role)}</p>
                    </div>
                    {admin.role === "SUPER_ADMIN" && (
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteAdmin(adminUser.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
