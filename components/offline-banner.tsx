"use client"

import { useOnlineStatus } from "@/hooks/use-online-status"
import { usePWAMode } from "@/hooks/use-pwa-mode"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { WifiOff, Wifi, X } from "lucide-react"
import { useState, useEffect } from "react"

export function OfflineBanner() {
  const isOnline = useOnlineStatus()
  const isPWA = usePWAMode()
  const [showReconnected, setShowReconnected] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (isOnline && showReconnected === false && isPWA) {
      // Show reconnected message briefly when coming back online
      setShowReconnected(true)
      const timer = setTimeout(() => setShowReconnected(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, showReconnected, isPWA])

  useEffect(() => {
    if (!isOnline) {
      setIsDismissed(false)
    }
  }, [isOnline])

  if (isDismissed || (isOnline && (!showReconnected || !isPWA))) {
    return null
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    if (showReconnected) {
      setShowReconnected(false)
    }
  }

  return (
    <Alert className={`mb-4 ${isOnline ? "border-green-500 bg-green-50" : "border-orange-500 bg-orange-50"}`}>
      {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-orange-600" />}
      <AlertDescription className={`${isOnline ? "text-green-800" : "text-orange-800"} flex-1`}>
        {isOnline
          ? "インターネット接続が復旧しました。最新のデータを取得できます。"
          : "オフラインモードです。キャッシュされたデータのみ表示されます。"}
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        className={`ml-auto h-6 w-6 p-0 ${isOnline ? "text-green-600 hover:text-green-800" : "text-orange-600 hover:text-orange-800"}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  )
}
