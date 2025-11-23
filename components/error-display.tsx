"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { WifiOff, AlertCircle, RefreshCw, Database } from "lucide-react"
import type { ApiError } from "@/lib/api-utils"

interface ErrorDisplayProps {
  error: ApiError | string
  onRetry?: () => void
  showCacheInfo?: boolean
}

export function ErrorDisplay({ error, onRetry, showCacheInfo = false }: ErrorDisplayProps) {
  const apiError = typeof error === "string" ? { message: error, isNetworkError: false, isOffline: false } : error

  const getIcon = () => {
    if (apiError.isOffline) return <WifiOff className="h-4 w-4" />
    if (apiError.isNetworkError) return <WifiOff className="h-4 w-4" />
    return <AlertCircle className="h-4 w-4" />
  }

  const getVariant = () => {
    if (apiError.isOffline) return "default"
    if (apiError.isNetworkError) return "destructive"
    return "destructive"
  }

  return (
    <div className="space-y-4">
      <Alert variant={getVariant()}>
        {getIcon()}
        <AlertDescription>{apiError.message}</AlertDescription>
      </Alert>

      {showCacheInfo && apiError.isOffline && (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            オフライン中でも、以前に閲覧したデータはキャッシュから表示される場合があります。
            インターネット接続が復旧すると、最新のデータを取得できます。
          </AlertDescription>
        </Alert>
      )}

      {onRetry && !apiError.isOffline && (
        <div className="flex justify-center">
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            再試行
          </Button>
        </div>
      )}
    </div>
  )
}
