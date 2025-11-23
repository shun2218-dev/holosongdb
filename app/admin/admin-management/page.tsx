"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InlineLoading, ButtonLoading } from "@/components/ui/loading"
import { UserPlus, Shield, Trash2, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

interface Admin {
  id: string
  username: string
  email: string
  role: string
  active: boolean
  createdAt: string
}

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "EDITOR",
  })

  const canCreateRole = (role: string) => {
    if (!currentAdmin) return false
    if (currentAdmin.role === "SUPER_ADMIN") return true
    if (currentAdmin.role === "ADMIN" && role === "EDITOR") return true
    return false
  }

  const canDeleteAdmin = (admin: Admin) => {
    if (!currentAdmin) return false
    if (admin.id === currentAdmin.id) return false

    if (currentAdmin.role === "SUPER_ADMIN") return true
    if (currentAdmin.role === "ADMIN" && admin.role === "EDITOR") return true
    return false
  }

  const getAvailableRoles = () => {
    if (!currentAdmin) return []
    if (currentAdmin.role === "SUPER_ADMIN") return ["SUPER_ADMIN", "ADMIN", "EDITOR"]
    if (currentAdmin.role === "ADMIN") return ["EDITOR"]
    return []
  }

  const getPageTitle = () => {
    if (currentAdmin?.role === "SUPER_ADMIN") return "管理者アカウント管理"
    if (currentAdmin?.role === "ADMIN") return "編集者アカウント管理"
    return "アカウント管理"
  }

  const getPageDescription = () => {
    if (currentAdmin?.role === "SUPER_ADMIN") return "全ての管理者アカウントの作成・管理"
    if (currentAdmin?.role === "ADMIN") return "編集者アカウントの作成・管理"
    return "アカウント管理"
  }

  useEffect(() => {
    checkAdminAuth()
    fetchAdmins()
  }, [])

  const checkAdminAuth = async () => {
    try {
      const response = await fetch("/api/admin/auth/check")
      if (!response.ok) {
        router.push("/admin/login")
        return
      }
      const admin = await response.json()
      if (admin.role !== "SUPER_ADMIN" && admin.role !== "ADMIN") {
        router.push("/admin")
        return
      }
      setCurrentAdmin(admin)
    } catch (error) {
      console.error("[v0] Auth check error:", error)
      router.push("/admin/login")
    }
  }

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admin/admins")
      if (response.ok) {
        const data = await response.json()
        setAdmins(data.admins || [])
      }
    } catch (error) {
      console.error("[v0] Failed to fetch admins:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "パスワードが一致しません" })
      return
    }

    if (formData.password.length < 8) {
      setMessage({ type: "error", text: "パスワードは8文字以上で入力してください" })
      return
    }

    if (!canCreateRole(formData.role)) {
      setMessage({ type: "error", text: "このロールを作成する権限がありません" })
      return
    }

    setCreating(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        const roleNames = {
          SUPER_ADMIN: "スーパー管理者",
          ADMIN: "管理者",
          EDITOR: "編集者",
        }
        setMessage({
          type: "success",
          text: `${roleNames[formData.role as keyof typeof roleNames]}アカウントが作成されました`,
        })
        setFormData({ username: "", email: "", password: "", confirmPassword: "", role: "EDITOR" })
        setShowCreateForm(false)
        fetchAdmins()
      } else {
        setMessage({ type: "error", text: result.error || "アカウント作成に失敗しました" })
      }
    } catch (error) {
      console.error("[v0] Create admin error:", error)
      setMessage({ type: "error", text: "アカウント作成に失敗しました" })
    } finally {
      setCreating(false)
    }
  }

  const handleDeactivateAdmin = async (adminId: string) => {
    const adminToDelete = admins.find((admin) => admin.id === adminId)
    if (!adminToDelete) return

    if (!canDeleteAdmin(adminToDelete)) {
      setMessage({ type: "error", text: "このアカウントを削除する権限がありません" })
      return
    }

    if (currentAdmin?.role === "SUPER_ADMIN" && adminToDelete.role === "SUPER_ADMIN") {
      const activeSuperAdmins = admins.filter((admin) => admin.active && admin.role === "SUPER_ADMIN")
      if (activeSuperAdmins.length <= 1) {
        setMessage({ type: "error", text: "最後のSUPER_ADMINアカウントは削除できません" })
        return
      }
    }

    if (!confirm("このアカウントを削除しますか？")) return

    try {
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMessage({ type: "success", text: "アカウントを削除しました" })
        fetchAdmins()
      } else {
        const result = await response.json()
        setMessage({ type: "error", text: result.error || "削除に失敗しました" })
      }
    } catch (error) {
      console.error("[v0] Delete admin error:", error)
      setMessage({ type: "error", text: "削除に失敗しました" })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <InlineLoading text="管理者情報を読み込み中..." />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
          <p className="text-muted-foreground mt-2">{getPageDescription()}</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          {currentAdmin?.role === "SUPER_ADMIN" ? "新しい管理者作成" : "新しい編集者作成"}
        </Button>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === "error" ? "border-red-500" : "border-green-500"}`}>
          <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              新しいアカウント作成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">ユーザー名</Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    placeholder="admin_user"
                  />
                </div>
                <div>
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="admin@example.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="role">権限</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  required
                >
                  {getAvailableRoles().map((role) => (
                    <option key={role} value={role}>
                      {role === "SUPER_ADMIN" && "スーパー管理者"}
                      {role === "ADMIN" && "管理者"}
                      {role === "EDITOR" && "編集者"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">パスワード</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                      placeholder="8文字以上"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirmPassword">パスワード確認</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={8}
                    placeholder="パスワードを再入力"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={creating}>
                  {creating ? <ButtonLoading /> : <UserPlus className="h-4 w-4" />}
                  <span className="ml-2">アカウント作成</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false)
                    setFormData({ username: "", email: "", password: "", confirmPassword: "", role: "EDITOR" })
                    setMessage(null)
                  }}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>既存の管理者アカウント</CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length > 0 ? (
            <div className="space-y-4">
              {admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-medium">{admin.username}</span>
                      {admin.id === currentAdmin?.id && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">現在のユーザー</span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">{admin.email}</div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          admin.role === "SUPER_ADMIN"
                            ? "bg-red-100 text-red-800"
                            : admin.role === "ADMIN"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {admin.role === "SUPER_ADMIN" && "スーパー管理者"}
                        {admin.role === "ADMIN" && "管理者"}
                        {admin.role === "EDITOR" && "編集者"}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          admin.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {admin.active ? "有効" : "無効"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      作成日: {new Date(admin.createdAt).toLocaleDateString("ja-JP")}
                    </div>
                    {canDeleteAdmin(admin) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeactivateAdmin(admin.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">管理者アカウントがありません。</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
