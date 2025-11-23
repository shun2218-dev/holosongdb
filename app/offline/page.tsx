"use client"

import { Wifi, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="flex justify-center">
          <div className="relative">
            <Wifi className="h-16 w-16 text-muted-foreground" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-destructive rounded-full flex items-center justify-center">
              <span className="text-destructive-foreground text-xs font-bold">×</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">オフラインです</h1>
          <p className="text-muted-foreground">
            インターネット接続を確認してください。一部のコンテンツはキャッシュから利用できます。
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={() => window.location.reload()} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            再読み込み
          </Button>

          <Button variant="outline" onClick={() => window.history.back()} className="w-full">
            戻る
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>HoloSong DB - オフラインモード</p>
        </div>
      </div>
    </div>
  )
}
