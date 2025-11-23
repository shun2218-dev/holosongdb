"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, RefreshCw, History, Clock, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import type { JSX } from "react/jsx-runtime"

interface AIAnalysisSummaryProps {
  analyticsData: any
}

interface AnalysisHistory {
  id: string
  analysis_text: string
  generated_at: string
  generated_by_username: string
  generated_by?: string
}

export function AIAnalysisSummary({ analyticsData }: AIAnalysisSummaryProps) {
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [generatedAt, setGeneratedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)
  const [history, setHistory] = useState<AnalysisHistory[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null)
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string; role: string } | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadHistory()
    loadCurrentAdmin()
  }, [])

  const loadCurrentAdmin = async () => {
    try {
      const response = await fetch("/api/admin/auth/check")
      if (response.ok) {
        const data = await response.json()
        setCurrentAdmin(data.admin)
      }
    } catch (error) {
      console.error("Failed to load current admin:", error)
    }
  }

  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const response = await fetch("/api/admin/ai-analysis?limit=10")
      if (response.ok) {
        const data = await response.json()
        setHistory(data.analyses)
      }
    } catch (error) {
      console.error("Failed to load analysis history:", error)
    } finally {
      setHistoryLoading(false)
    }
  }

  const generateAnalysis = async (forceRegenerate = false) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/ai-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ analyticsData, forceRegenerate }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "分析の生成に失敗しました")
      }

      const data = await response.json()
      setAnalysis(data.analysis)
      setGeneratedAt(data.generatedAt)
      setIsFromCache(data.isFromCache || false)
      setSelectedHistoryId(data.analysisId)

      if (!data.isFromCache) {
        await loadHistory()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析の生成に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const loadHistoryAnalysis = (historyItem: AnalysisHistory) => {
    setAnalysis(historyItem.analysis_text)
    setGeneratedAt(historyItem.generated_at)
    setIsFromCache(true)
    setSelectedHistoryId(historyItem.id)
    setError(null)
  }

  const formatAnalysis = (text: string) => {
    const lines = text.split("\n")
    const result: JSX.Element[] = []
    let currentList: JSX.Element[] = []
    let listType: "bullet" | "numbered" | null = null

    lines.forEach((line, index) => {
      if (line.startsWith("# ")) {
        if (currentList.length > 0) {
          result.push(
            <ul key={`list-${result.length}`} className="list-disc list-inside space-y-1 mb-4 ml-4">
              {currentList}
            </ul>,
          )
          currentList = []
          listType = null
        }
        result.push(
          <h2 key={index} className="text-xl font-bold mt-6 mb-3 text-foreground">
            {line.substring(2)}
          </h2>,
        )
      } else if (line.startsWith("## ")) {
        if (currentList.length > 0) {
          result.push(
            <ul key={`list-${result.length}`} className="list-disc list-inside space-y-1 mb-4 ml-4">
              {currentList}
            </ul>,
          )
          currentList = []
          listType = null
        }
        result.push(
          <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-foreground">
            {line.substring(3)}
          </h3>,
        )
      } else if (line.startsWith("### ")) {
        if (currentList.length > 0) {
          result.push(
            <ul key={`list-${result.length}`} className="list-disc list-inside space-y-1 mb-4 ml-4">
              {currentList}
            </ul>,
          )
          currentList = []
          listType = null
        }
        result.push(
          <h4 key={index} className="text-base font-medium mt-3 mb-2 text-foreground">
            {line.substring(4)}
          </h4>,
        )
      } else if (line.startsWith("* ") || line.startsWith("- ")) {
        const content = line.startsWith("* ") ? line.substring(2) : line.substring(2)

        if (listType !== "bullet") {
          if (currentList.length > 0) {
            result.push(
              <ul key={`list-${result.length}`} className="list-disc list-inside space-y-1 mb-4 ml-4">
                {currentList}
              </ul>,
            )
          }
          currentList = []
          listType = "bullet"
        }

        currentList.push(
          <li key={index} className="text-muted-foreground leading-relaxed">
            {formatInlineMarkdown(content)}
          </li>,
        )
      } else if (line.trim() === "") {
        if (currentList.length > 0) {
          result.push(
            <ul key={`list-${result.length}`} className="list-disc list-inside space-y-1 mb-4 ml-4">
              {currentList}
            </ul>,
          )
          currentList = []
          listType = null
        }
        result.push(<br key={index} />)
      } else {
        const numberedListMatch = line.match(/^(\d+)\.\s+(.*)$/)
        if (numberedListMatch) {
          if (currentList.length > 0) {
            result.push(
              <ul key={`list-${result.length}`} className="list-disc list-inside space-y-1 mb-4 ml-4">
                {currentList}
              </ul>,
            )
            currentList = []
            listType = null
          }
          result.push(
            <div key={index} className="mb-2">
              <span className="font-semibold text-foreground">{numberedListMatch[1]}. </span>
              <span className="text-muted-foreground">{formatInlineMarkdown(numberedListMatch[2])}</span>
            </div>,
          )
        } else {
          if (currentList.length > 0) {
            result.push(
              <ul key={`list-${result.length}`} className="list-disc list-inside space-y-1 mb-4 ml-4">
                {currentList}
              </ul>,
            )
            currentList = []
            listType = null
          }
          result.push(
            <p key={index} className="mb-2 text-muted-foreground leading-relaxed">
              {formatInlineMarkdown(line)}
            </p>,
          )
        }
      }
    })

    if (currentList.length > 0) {
      result.push(
        <ul key={`list-${result.length}`} className="list-disc list-inside space-y-1 mb-4 ml-4">
          {currentList}
        </ul>,
      )
    }

    return result
  }

  const formatInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/)

    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const boldText = part.slice(2, -2)
        return (
          <strong key={index} className="font-semibold text-foreground">
            {boldText}
          </strong>
        )
      }
      return part
    })
  }

  const deleteAnalysis = async (analysisId: string, event: React.MouseEvent) => {
    event.stopPropagation()

    if (!confirm("この分析履歴を削除しますか？")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/ai-analysis?id=${analysisId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "削除に失敗しました")
      }

      if (selectedHistoryId === analysisId) {
        setAnalysis(null)
        setGeneratedAt(null)
        setSelectedHistoryId(null)
        setIsFromCache(false)
      }

      await loadHistory()
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました")
    }
  }

  const canDeleteAnalysis = (analysisItem: AnalysisHistory) => {
    if (!currentAdmin) return false
    return currentAdmin.role === "SUPER_ADMIN" || analysisItem.generated_by === currentAdmin.id
  }

  const toggleExpanded = (itemId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <Tabs defaultValue="current" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="current" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          現在の分析
        </TabsTrigger>
        <TabsTrigger value="history" className="flex items-center gap-2">
          <History className="h-4 w-4" />
          分析履歴
        </TabsTrigger>
      </TabsList>

      <TabsContent value="current">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>AI分析サマリー</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {generatedAt && (
                  <div className="flex items-center gap-2">
                    {isFromCache && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        キャッシュ
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {new Date(generatedAt).toLocaleString("ja-JP")}
                    </Badge>
                  </div>
                )}
                <Button
                  onClick={() => generateAnalysis(false)}
                  disabled={loading}
                  size="sm"
                  variant={analysis ? "outline" : "default"}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {analysis ? "最新データで分析" : "AI分析を生成"}
                    </>
                  )}
                </Button>
                {analysis && (
                  <Button onClick={() => generateAnalysis(true)} disabled={loading} size="sm" variant="ghost">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    強制再生成
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {!analysis && !loading && !error && (
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">AIがデータを分析して、詳細なインサイトを提供します</p>
                <p className="text-sm text-muted-foreground">「AI分析を生成」ボタンをクリックして開始してください</p>
              </div>
            )}

            {loading && (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 text-primary mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">AIがデータを分析しています...</p>
                <p className="text-sm text-muted-foreground mt-2">しばらくお待ちください</p>
              </div>
            )}

            {analysis && <div className="prose prose-sm max-w-none">{formatAnalysis(analysis)}</div>}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <CardTitle>分析履歴</CardTitle>
              </div>
              <Button onClick={loadHistory} disabled={historyLoading} size="sm" variant="outline">
                {historyLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                更新
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">履歴を読み込んでいます...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">まだ分析履歴がありません</p>
                <p className="text-sm text-muted-foreground">「現在の分析」タブでAI分析を生成してください</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg border transition-colors ${
                      selectedHistoryId === item.id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <div className="p-4 cursor-pointer hover:bg-muted/50" onClick={() => loadHistoryAnalysis(item)}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {new Date(item.generated_at).toLocaleString("ja-JP")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">by {item.generated_by_username}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            onClick={(e) => toggleExpanded(item.id, e)}
                          >
                            {expandedItems.has(item.id) ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </Button>
                          {canDeleteAnalysis(item) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={(e) => deleteAnalysis(item.id, e)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.analysis_text.substring(0, 150)}...
                      </p>
                    </div>
                    <Collapsible open={expandedItems.has(item.id)}>
                      <CollapsibleContent className="px-4 pb-4">
                        <div className="border-t pt-4 mt-2">
                          <div className="prose prose-sm max-w-none">{formatAnalysis(item.analysis_text)}</div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
