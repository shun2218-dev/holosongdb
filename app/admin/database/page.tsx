"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Download, Trash2, RefreshCw } from "lucide-react"
import { AdminStatCardSkeleton, AdminTableSkeleton, AdminFormSkeleton } from "@/components/admin-skeleton"

interface DatabaseInfo {
  tables: Array<{
    name: string
    rows: number
    size: string
  }>
  totalSize: string
  lastBackup: string | null
}

export default function DatabasePage() {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchDatabaseInfo()
  }, [])

  const fetchDatabaseInfo = async () => {
    try {
      const response = await fetch("/api/admin/database")
      if (response.ok) {
        const data = await response.json()
        setDbInfo(data)
      } else if (response.status === 401) {
        router.push("/admin/login")
      }
    } catch (error) {
      console.error("[v0] Database info fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: string) => {
    setActionLoading(action)
    try {
      const response = await fetch(`/api/admin/database/${action}`, {
        method: "POST",
      })
      if (response.ok) {
        await fetchDatabaseInfo()
        alert(`${action}が完了しました`)
      } else {
        alert(`${action}に失敗しました`)
      }
    } catch (error) {
      console.error(`[v0] Database ${action} error:`, error)
      alert(`${action}中にエラーが発生しました`)
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">データベース管理</h1>
              <p className="text-sm md:text-base text-muted-foreground">バックアップとメンテナンス</p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <AdminStatCardSkeleton />
            <AdminStatCardSkeleton />
            <AdminStatCardSkeleton />
            <AdminStatCardSkeleton />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <AdminTableSkeleton rows={6} />
            <AdminFormSkeleton />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">データベース管理</h1>
            <p className="text-sm md:text-base text-muted-foreground">バックアップとメンテナンス</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {dbInfo && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">データベースサイズ</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dbInfo.totalSize}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">テーブル数</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dbInfo.tables.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">最終バックアップ</CardTitle>
                  <Download className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold">
                    {dbInfo.lastBackup ? new Date(dbInfo.lastBackup).toLocaleDateString("ja-JP") : "未実行"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ステータス</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">正常</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>テーブル情報</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dbInfo.tables.map((table) => (
                      <div key={table.name} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{table.name}</p>
                          <p className="text-sm text-muted-foreground">{table.rows} レコード</p>
                        </div>
                        <div className="text-sm font-medium">{table.size}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>データベース操作</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      onClick={() => handleAction("backup")}
                      disabled={actionLoading === "backup"}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {actionLoading === "backup" ? "バックアップ中..." : "バックアップ作成"}
                    </Button>

                    <Button
                      onClick={() => handleAction("optimize")}
                      disabled={actionLoading === "optimize"}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {actionLoading === "optimize" ? "最適化中..." : "データベース最適化"}
                    </Button>

                    <Button
                      onClick={() => {
                        if (confirm("本当にキャッシュをクリアしますか？")) {
                          handleAction("clear-cache")
                        }
                      }}
                      disabled={actionLoading === "clear-cache"}
                      variant="outline"
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {actionLoading === "clear-cache" ? "クリア中..." : "キャッシュクリア"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
