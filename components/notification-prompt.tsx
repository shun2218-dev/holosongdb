"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, X, Smartphone } from "lucide-react"
import { PushNotificationManager } from "@/lib/push-notification"

export function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    checkShouldShowPrompt()

    PushNotificationManager.initializeServiceWorkerMessaging()
  }, [])

  const checkShouldShowPrompt = async () => {
    // 既に通知を許可済みまたは拒否済みの場合は表示しない
    const dismissed = localStorage.getItem("notification-prompt-dismissed")
    if (dismissed) return

    const status = await PushNotificationManager.checkNotificationStatus()

    // サポートされていて、まだ許可されていない場合のみ表示
    if (status.supported && status.permission === "default") {
      // 少し遅延させて表示（ページ読み込み直後は避ける）
      setTimeout(() => setShowPrompt(true), 3000)
    }
  }

  const handleEnable = async () => {
    setLoading(true)
    try {
      const permission = await PushNotificationManager.requestPermissionWithUserGesture()

      if (permission === "granted") {
        const subscription = await PushNotificationManager.createSubscription()
        if (subscription) {
          await PushNotificationManager.saveSubscription(subscription)
          alert("通知が有効になりました！楽曲の節目達成時に通知をお送りします。")
        }
      } else if (permission === "denied") {
        alert("通知が拒否されました。ブラウザの設定から通知を有効にしてください。")
      } else {
        // "default" の場合（モバイルで許可ダイアログが表示されなかった場合）
        if (isMobile) {
          alert(
            "通知の許可が必要です。\n\n手順：\n1. ブラウザのメニューから「設定」を開く\n2. 「サイトの設定」または「通知」を選択\n3. このサイトの通知を「許可」に変更\n\nまたは、PWAをホーム画面に追加すると通知が確実に動作します。",
          )
        }
      }

      setShowPrompt(false)
      localStorage.setItem("notification-prompt-dismissed", "true")
    } catch (error) {
      console.error("Failed to enable notifications:", error)
      if (isMobile) {
        alert(
          "通知の設定に失敗しました。\n\nモバイルでの推奨手順：\n1. PWAをホーム画面に追加\n2. ホーム画面のアイコンからアプリを開く\n3. 再度通知を有効にする",
        )
      } else {
        alert("通知の設定に失敗しました。ブラウザを更新してから再度お試しください。")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("notification-prompt-dismissed", "true")
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-60 md:left-auto md:right-4 md:max-w-sm">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">通知を有効にしませんか？</CardTitle>
            </div>
            <Button size="sm" variant="ghost" onClick={handleDismiss} className="p-1 h-auto">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-sm">
            楽曲の節目達成や急上昇時に通知を受け取れます
            {isMobile && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700 border border-blue-200">
                <Smartphone className="h-3 w-3 inline mr-1" />
                <strong>スマホでの推奨設定：</strong>
                <br />
                1. 「有効にする」ボタンをタップ
                <br />
                2. ブラウザの通知許可ダイアログで「許可」を選択
                <br />
                3. PWAをホーム画面に追加すると確実に動作します
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button size="sm" onClick={handleEnable} disabled={loading}>
              {loading ? "設定中..." : "有効にする"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleDismiss}>
              後で
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
