"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, BookOpen, Loader2, AlertCircle, Info, Palette, Layout, Type, Zap } from "lucide-react"

export function StorybookAccess() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showComponents, setShowComponents] = useState(false)

  const handleStorybookAccess = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/storybook")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "アクセスに失敗しました")
      }

      if (data.isDevelopment) {
        // 開発環境：別タブでlocalhost:6006を開く
        window.open(data.storybookUrl, "_blank", "noopener,noreferrer")
      } else {
        // 本番環境：コンポーネントカタログを表示
        setShowComponents(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期しないエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  const componentCategories = [
    {
      title: "基本UIコンポーネント",
      icon: <Layout className="h-4 w-4" />,
      components: [
        {
          name: "Button",
          description: "クリック可能なボタン要素",
          variants: ["default", "destructive", "outline", "secondary", "ghost", "link"],
        },
        {
          name: "Card",
          description: "コンテンツをグループ化するカード",
          variants: ["default", "with-header", "with-footer"],
        },
        { name: "Input", description: "テキスト入力フィールド", variants: ["text", "email", "password", "search"] },
        { name: "Select", description: "ドロップダウン選択", variants: ["single", "multiple", "searchable"] },
        { name: "Alert", description: "重要な情報を表示", variants: ["default", "destructive", "warning"] },
        {
          name: "Badge",
          description: "ステータスやラベル表示",
          variants: ["default", "secondary", "destructive", "outline"],
        },
      ],
    },
    {
      title: "業務固有コンポーネント",
      icon: <Zap className="h-4 w-4" />,
      components: [
        { name: "SongCard", description: "楽曲情報を表示するカード", variants: ["compact", "detailed", "grid"] },
        { name: "MemberCard", description: "メンバー情報を表示", variants: ["avatar", "full", "mini"] },
        { name: "SearchFilters", description: "楽曲検索フィルター", variants: ["basic", "advanced"] },
        {
          name: "AdminTable",
          description: "管理画面用データテーブル",
          variants: ["sortable", "paginated", "filterable"],
        },
      ],
    },
    {
      title: "レイアウト・ナビゲーション",
      icon: <Type className="h-4 w-4" />,
      components: [
        { name: "Header", description: "サイトヘッダー", variants: ["public", "admin", "mobile"] },
        { name: "Sidebar", description: "サイドバーナビゲーション", variants: ["collapsed", "expanded", "mobile"] },
        { name: "Breadcrumb", description: "パンくずナビゲーション", variants: ["simple", "with-icons"] },
        { name: "Pagination", description: "ページネーション", variants: ["simple", "detailed", "compact"] },
      ],
    },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <CardTitle>Storybook コンポーネントカタログ</CardTitle>
        </div>
        <CardDescription>UIコンポーネントのドキュメントとテストを確認できます（スーパー管理者限定）</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {process.env.NODE_ENV === "development"
              ? "開発環境では別タブでStorybook（localhost:6006）が開きます。事前に `npm run storybook` でStorybookサーバーを起動してください。"
              : "本番環境では、このページでコンポーネントカタログを確認できます。フル機能を利用するには開発環境をご利用ください。"}
          </AlertDescription>
        </Alert>

        <Button onClick={handleStorybookAccess} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              アクセス中...
            </>
          ) : (
            <>
              <ExternalLink className="mr-2 h-4 w-4" />
              {process.env.NODE_ENV === "development" ? "Storybookを開く" : "コンポーネントカタログを表示"}
            </>
          )}
        </Button>

        {showComponents && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Palette className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">コンポーネントカタログ</h3>
            </div>

            {componentCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-3">
                <div className="flex items-center gap-2">
                  {category.icon}
                  <h4 className="font-medium text-foreground">{category.title}</h4>
                </div>

                <div className="grid gap-3">
                  {category.components.map((component, componentIndex) => (
                    <div key={componentIndex} className="bg-muted/50 p-4 rounded-lg border">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-medium text-sm">{component.name}</h5>
                          <p className="text-xs text-muted-foreground">{component.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {component.variants.map((variant, variantIndex) => (
                          <Badge key={variantIndex} variant="outline" className="text-xs">
                            {variant}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                開発環境では、これらのコンポーネントをインタラクティブにテストし、プロパティを変更してリアルタイムでプレビューできます。
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
          <strong>開発時の使用方法:</strong>
          <br />
          1. ターミナルで `npm run storybook` を実行
          <br />
          2. 上記ボタンをクリックしてStorybookにアクセス
          <br />
          <strong>本番環境:</strong> このページでコンポーネント一覧を確認できます
        </div>
      </CardContent>
    </Card>
  )
}
