"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Play,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Monitor,
  Smartphone,
  Globe,
  Zap,
  Shield,
  Database,
} from "lucide-react"

interface Admin {
  id: string
  username: string
  email: string
  role: string
}

interface E2ETestingClientProps {
  admin: Admin
}

interface E2ETestResult {
  success: boolean
  output: string
  error: string
  timestamp: string
  testType?: string
  browser?: string
  passed?: number
  failed?: number
  skipped?: number
  duration?: number
  screenshots?: string[]
  videos?: string[]
}

interface StoredE2ETestResult extends E2ETestResult {
  id: string
  testType: string
  name: string
}

export function E2ETestingClient({ admin }: E2ETestingClientProps) {
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [testResult, setTestResult] = useState<E2ETestResult | null>(null)
  const [storedResults, setStoredResults] = useState<StoredE2ETestResult[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [selectedReport, setSelectedReport] = useState<StoredE2ETestResult | null>(null)

  useEffect(() => {
    loadStoredResults()
  }, [])

  const loadStoredResults = () => {
    try {
      const stored = localStorage.getItem("e2e-test-results")
      if (stored) {
        const results = JSON.parse(stored)
        setStoredResults(results)
      }
    } catch (error) {
      console.error("[v0] Failed to load stored E2E results:", error)
    } finally {
      setLoadingReports(false)
    }
  }

  const saveTestResult = (result: E2ETestResult, testType: string) => {
    const storedResult: StoredE2ETestResult = {
      ...result,
      id: Date.now().toString(),
      testType,
      name: getTestTypeName(testType),
    }

    try {
      const existing = localStorage.getItem("e2e-test-results")
      const results = existing ? JSON.parse(existing) : []

      // Keep only the last 15 results
      const updatedResults = [storedResult, ...results].slice(0, 15)

      localStorage.setItem("e2e-test-results", JSON.stringify(updatedResults))
      setStoredResults(updatedResults)
    } catch (error) {
      console.error("[v0] Failed to save E2E test result:", error)
    }
  }

  const getTestTypeName = (testType: string) => {
    switch (testType) {
      case "auth":
        return "認証テスト"
      case "song-management":
        return "楽曲管理テスト"
      case "talent-management":
        return "タレント管理テスト"
      case "analytics":
        return "分析画面テスト"
      case "mobile":
        return "モバイル対応テスト"
      case "performance":
        return "パフォーマンステスト"
      case "accessibility":
        return "アクセシビリティテスト"
      case "cross-browser":
        return "クロスブラウザテスト"
      case "all":
        return "全E2Eテスト"
      default:
        return testType
    }
  }

  const runE2ETest = async (testType: string) => {
    setIsRunningTest(true)
    setTestResult(null)

    try {
      console.log("[v0] Starting E2E test run:", testType)

      const response = await fetch("/api/admin/e2e-test/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testType }),
      })

      console.log("[v0] E2E Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] E2E Error response:", errorText)

        try {
          const errorJson = JSON.parse(errorText)
          const errorResult = {
            success: false,
            output: "",
            error: errorJson.error || "E2Eテストの実行に失敗しました",
            timestamp: new Date().toISOString(),
          }
          setTestResult(errorResult)
          saveTestResult(errorResult, testType)
        } catch {
          const errorResult = {
            success: false,
            output: "",
            error: `サーバーエラー (${response.status}): ${errorText.substring(0, 200)}`,
            timestamp: new Date().toISOString(),
          }
          setTestResult(errorResult)
          saveTestResult(errorResult, testType)
        }
        return
      }

      const result = await response.json()
      console.log("[v0] E2E Test result:", result)
      setTestResult(result)

      saveTestResult(result, testType)
    } catch (error) {
      console.error("[v0] E2E Test run error:", error)
      const errorResult = {
        success: false,
        output: "",
        error: "ネットワークエラーまたはサーバーエラーが発生しました",
        timestamp: new Date().toISOString(),
      }
      setTestResult(errorResult)
      saveTestResult(errorResult, testType)
    } finally {
      setIsRunningTest(false)
    }
  }

  const getTestStatusIcon = (result: E2ETestResult) => {
    if (result.success) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    } else {
      return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getTestTypeIcon = (testType: string) => {
    switch (testType) {
      case "auth":
        return <Shield className="h-4 w-4" />
      case "song-management":
      case "talent-management":
        return <Database className="h-4 w-4" />
      case "analytics":
        return <FileText className="h-4 w-4" />
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "performance":
        return <Zap className="h-4 w-4" />
      case "accessibility":
        return <Eye className="h-4 w-4" />
      case "cross-browser":
        return <Globe className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
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
              <h1 className="text-2xl font-bold text-foreground">E2Eテスト管理</h1>
              <p className="text-muted-foreground">エンドツーエンドテストの実行とレポート確認</p>
            </div>
            <Badge className="bg-destructive text-destructive-foreground ml-auto">スーパー管理者専用</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="functional" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="functional">機能テスト</TabsTrigger>
            <TabsTrigger value="performance">パフォーマンス</TabsTrigger>
            <TabsTrigger value="accessibility">アクセシビリティ</TabsTrigger>
            <TabsTrigger value="reports">テスト履歴</TabsTrigger>
          </TabsList>

          <TabsContent value="functional" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4" />
                    認証テスト
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">ログイン、ログアウト、権限チェック</p>
                  <Button onClick={() => runE2ETest("auth")} disabled={isRunningTest} className="w-full" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    実行
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Database className="h-4 w-4" />
                    楽曲管理テスト
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">楽曲の追加、編集、削除、検索</p>
                  <Button
                    onClick={() => runE2ETest("song-management")}
                    disabled={isRunningTest}
                    className="w-full"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    実行
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Database className="h-4 w-4" />
                    タレント管理テスト
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">タレントの追加、編集、削除</p>
                  <Button
                    onClick={() => runE2ETest("talent-management")}
                    disabled={isRunningTest}
                    className="w-full"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    実行
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4" />
                    分析画面テスト
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">チャート表示、データ切り替え</p>
                  <Button onClick={() => runE2ETest("analytics")} disabled={isRunningTest} className="w-full" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    実行
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Globe className="h-4 w-4" />
                    クロスブラウザテスト
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">Chrome、Firefox、Safari対応</p>
                  <Button
                    onClick={() => runE2ETest("cross-browser")}
                    disabled={isRunningTest}
                    className="w-full"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    実行
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertCircle className="h-4 w-4" />
                    全機能テスト
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">すべての機能テストを実行</p>
                  <Button
                    onClick={() => runE2ETest("all")}
                    disabled={isRunningTest}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    実行
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="h-4 w-4" />
                    パフォーマンステスト
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">ページ読み込み速度、レスポンス時間</p>
                  <Button
                    onClick={() => runE2ETest("performance")}
                    disabled={isRunningTest}
                    className="w-full"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    実行
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Smartphone className="h-4 w-4" />
                    モバイル対応テスト
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">レスポンシブデザイン、タッチ操作</p>
                  <Button onClick={() => runE2ETest("mobile")} disabled={isRunningTest} className="w-full" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    実行
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-4 w-4" />
                  アクセシビリティテスト
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  キーボードナビゲーション、スクリーンリーダー対応、色のコントラスト
                </p>
                <Button
                  onClick={() => runE2ETest("accessibility")}
                  disabled={isRunningTest}
                  className="w-full"
                  size="sm"
                >
                  <Play className="h-4 w-4 mr-2" />
                  実行
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  E2Eテスト履歴
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingReports ? (
                  <div className="flex items-center gap-2 p-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm">履歴を読み込み中...</span>
                  </div>
                ) : storedResults.length > 0 ? (
                  <div className="space-y-3">
                    {storedResults.slice(0, 5).map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {getTestStatusIcon(result)}
                            {getTestTypeIcon(result.testType)}
                            <p className="font-medium text-sm">{result.name}</p>
                            {result.browser && (
                              <Badge variant="outline" className="text-xs">
                                {result.browser}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(result.timestamp).toLocaleString("ja-JP")}
                            </span>
                            {result.passed !== undefined && (
                              <span className="text-green-600">成功: {result.passed}</span>
                            )}
                            {result.failed !== undefined && result.failed > 0 && (
                              <span className="text-red-600">失敗: {result.failed}</span>
                            )}
                            {result.duration && <span>実行時間: {Math.round(result.duration / 1000)}秒</span>}
                          </div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedReport(result)}>
                              <Eye className="h-4 w-4 mr-1" />
                              表示
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                {getTestStatusIcon(result)}
                                {result.name} - 詳細結果
                              </DialogTitle>
                              <DialogDescription>
                                E2Eテストの詳細な実行結果、統計情報、スクリーンショットを表示します。
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  実行時刻: {new Date(result.timestamp).toLocaleString("ja-JP")}
                                </span>
                                {result.browser && <Badge variant="outline">ブラウザ: {result.browser}</Badge>}
                                <Badge variant={result.success ? "default" : "destructive"}>
                                  {result.success ? "成功" : "失敗"}
                                </Badge>
                              </div>

                              {(result.passed !== undefined || result.failed !== undefined) && (
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div className="text-center p-2 bg-green-50 rounded">
                                    <div className="text-green-600 font-medium">{result.passed || 0}</div>
                                    <div className="text-green-600">成功</div>
                                  </div>
                                  <div className="text-center p-2 bg-red-50 rounded">
                                    <div className="text-red-600 font-medium">{result.failed || 0}</div>
                                    <div className="text-red-600">失敗</div>
                                  </div>
                                  <div className="text-center p-2 bg-gray-50 rounded">
                                    <div className="text-gray-600 font-medium">{result.skipped || 0}</div>
                                    <div className="text-gray-600">スキップ</div>
                                  </div>
                                </div>
                              )}

                              {result.output && (
                                <div>
                                  <h4 className="font-medium mb-2">実行結果:</h4>
                                  <div className="bg-muted p-4 rounded-lg">
                                    <pre className="text-sm whitespace-pre-wrap overflow-auto">{result.output}</pre>
                                  </div>
                                </div>
                              )}

                              {result.error && (
                                <div>
                                  <h4 className="font-medium mb-2 text-destructive">エラー:</h4>
                                  <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                                    <pre className="text-sm whitespace-pre-wrap overflow-auto text-destructive">
                                      {result.error}
                                    </pre>
                                  </div>
                                </div>
                              )}

                              {result.screenshots && result.screenshots.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">スクリーンショット:</h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    {result.screenshots.map((screenshot, index) => (
                                      <img
                                        key={index}
                                        src={screenshot || "/placeholder.svg"}
                                        alt={`Screenshot ${index + 1}`}
                                        className="border rounded"
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    E2Eテスト履歴がありません。テストを実行して履歴を作成してください。
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 実行中の状態表示 */}
        {isRunningTest && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">E2Eテスト実行中...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 最新の実行結果表示 */}
        {testResult && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTestStatusIcon(testResult)}
                最新の実行結果
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(testResult.timestamp).toLocaleString("ja-JP")}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(testResult.passed !== undefined || testResult.failed !== undefined) && (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-green-600 font-medium">{testResult.passed || 0}</div>
                    <div className="text-green-600">成功</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded">
                    <div className="text-red-600 font-medium">{testResult.failed || 0}</div>
                    <div className="text-red-600">失敗</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-gray-600 font-medium">{testResult.skipped || 0}</div>
                    <div className="text-gray-600">スキップ</div>
                  </div>
                </div>
              )}

              {testResult.output && (
                <div className="bg-muted p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">実行結果:</h4>
                  <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-40">{testResult.output}</pre>
                </div>
              )}

              {testResult.error && (
                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-2 text-destructive">エラー:</h4>
                  <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-40 text-destructive">
                    {testResult.error}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
