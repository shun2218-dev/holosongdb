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
import { ArrowLeft, Play, FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react"

interface Admin {
  id: string
  username: string
  email: string
  role: string
}

interface TestingClientProps {
  admin: Admin
}

interface TestResult {
  success: boolean
  output: string
  error: string
  timestamp: string
  testType?: string
}

interface StoredTestResult extends TestResult {
  id: string
  testType: string
  name: string
}

export function TestingClient({ admin }: TestingClientProps) {
  const [isRunningTest, setIsRunningTest] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [storedResults, setStoredResults] = useState<StoredTestResult[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [selectedReport, setSelectedReport] = useState<StoredTestResult | null>(null)

  useEffect(() => {
    loadStoredResults()
  }, [])

  const loadStoredResults = () => {
    try {
      const stored = localStorage.getItem("test-results")
      if (stored) {
        const results = JSON.parse(stored)
        setStoredResults(results)
      }
    } catch (error) {
      console.error("[v0] Failed to load stored results:", error)
    } finally {
      setLoadingReports(false)
    }
  }

  const saveTestResult = (result: TestResult, testType: string) => {
    const storedResult: StoredTestResult = {
      ...result,
      id: Date.now().toString(),
      testType,
      name: getTestTypeName(testType),
    }

    try {
      const existing = localStorage.getItem("test-results")
      const results = existing ? JSON.parse(existing) : []

      // Keep only the last 10 results
      const updatedResults = [storedResult, ...results].slice(0, 10)

      localStorage.setItem("test-results", JSON.stringify(updatedResults))
      setStoredResults(updatedResults)
    } catch (error) {
      console.error("[v0] Failed to save test result:", error)
    }
  }

  const getTestTypeName = (testType: string) => {
    switch (testType) {
      case "unit":
        return "ユニットテスト"
      case "coverage":
        return "カバレッジテスト"
      case "all":
        return "全テスト"
      default:
        return testType
    }
  }

  const runTest = async (testType: "all" | "unit" | "coverage") => {
    setIsRunningTest(true)
    setTestResult(null)

    try {
      console.log("[v0] Starting test run:", testType)

      const response = await fetch("/api/admin/test/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testType }),
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Error response:", errorText)

        try {
          const errorJson = JSON.parse(errorText)
          const errorResult = {
            success: false,
            output: "",
            error: errorJson.error || "テストの実行に失敗しました",
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
      console.log("[v0] Test result:", result)
      setTestResult(result)

      saveTestResult(result, testType)
    } catch (error) {
      console.error("[v0] Test run error:", error)
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

  const getTestStatusIcon = (result: TestResult) => {
    if (result.success) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    } else {
      return <XCircle className="h-5 w-5 text-red-600" />
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
              <h1 className="text-2xl font-bold text-foreground">テスト管理</h1>
              <p className="text-muted-foreground">ユニットテストの実行とレポート確認</p>
            </div>
            <Badge className="bg-destructive text-destructive-foreground ml-auto">スーパー管理者専用</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* テスト実行パネル */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                テスト実行
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Button onClick={() => runTest("unit")} disabled={isRunningTest} className="w-full justify-start">
                  <Play className="h-4 w-4 mr-2" />
                  ユニットテストを実行
                </Button>
                <Button
                  onClick={() => runTest("coverage")}
                  disabled={isRunningTest}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  カバレッジテストを実行
                </Button>
                <Button
                  onClick={() => runTest("all")}
                  disabled={isRunningTest}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  全テストを実行
                </Button>
              </div>

              {isRunningTest && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">テスト実行中...</span>
                </div>
              )}

              {testResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getTestStatusIcon(testResult)}
                    <span className="font-medium">{testResult.success ? "テスト完了" : "テスト失敗"}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(testResult.timestamp).toLocaleString("ja-JP")}
                    </span>
                  </div>

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
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                テスト履歴
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
                  {storedResults.slice(0, 3).map((result) => (
                    <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getTestStatusIcon(result)}
                          <p className="font-medium text-sm">{result.name}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(result.timestamp).toLocaleString("ja-JP")}
                          </span>
                          <Badge variant={result.success ? "default" : "destructive"} className="text-xs">
                            {result.success ? "成功" : "失敗"}
                          </Badge>
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
                            <DialogDescription>テストの詳細な実行結果とエラー情報を表示します。</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                実行時刻: {new Date(result.timestamp).toLocaleString("ja-JP")}
                              </span>
                              <Badge variant={result.success ? "default" : "destructive"}>
                                {result.success ? "成功" : "失敗"}
                              </Badge>
                            </div>

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
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  テスト履歴がありません。テストを実行して履歴を作成してください。
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
