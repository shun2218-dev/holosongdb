import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyAdminSession, requireSuperAdmin } from "@/lib/auth"
import { StorybookAccess } from "@/components/storybook-access"

export default async function StorybookPage() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("admin_session")?.value

  if (!sessionId) {
    redirect("/admin/login")
  }

  const admin = await verifyAdminSession(sessionId)

  try {
    requireSuperAdmin(admin)
  } catch {
    redirect("/admin")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Storybook アクセス</h1>
              <p className="text-muted-foreground">UIコンポーネントカタログ（スーパー管理者限定）</p>
            </div>
            <div className="flex items-center gap-4">
              <a href="/admin" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                ダッシュボードに戻る
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <StorybookAccess />

          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold">Storybookについて</h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-muted-foreground">
                Storybookは、UIコンポーネントを独立した環境で開発・テスト・ドキュメント化するためのツールです。
                このプロジェクトでは、以下のコンポーネントカタログが利用可能です：
              </p>

              <div className="grid gap-4 mt-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">基本UIコンポーネント</h3>
                  <p className="text-sm text-muted-foreground">
                    Button, Card, Input, Select, Alert, Badge
                    など、アプリケーション全体で使用される基本的なUIコンポーネント
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">業務固有コンポーネント</h3>
                  <p className="text-sm text-muted-foreground">
                    SongCard など、Hololive楽曲データベース専用のビジネスロジックを含むコンポーネント
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-medium mb-2">テーマとレスポンシブ対応</h3>
                  <p className="text-sm text-muted-foreground">
                    ダークモード/ライトモードの切り替え、モバイル/デスクトップでの表示確認が可能
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
