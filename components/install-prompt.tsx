"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, X, Info } from "lucide-react"
import { useInstallPrompt } from "@/hooks/use-install-prompt"
import { useIsMobileDevice } from "@/hooks/use-is-mobile-device"

export function InstallPrompt() {
  const isMobileDevice = useIsMobileDevice()
  const {
    isInstallable,
    isInstalled,
    promptInstall,
    showManualInstructions,
    showManualInstallInstructions,
    forceTriggerInstall,
  } = useInstallPrompt()
  const [isDismissed, setIsDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("install-prompt-dismissed") === "true"
    }
    return false
  })

  const handleInstall = async () => {
    console.log("[v0] Install button clicked")
    const success = await promptInstall()
    console.log("[v0] Install result:", success)
    if (success) {
      setIsDismissed(true)
    }
  }

  const handleForceTrigger = () => {
    console.log("[v0] Force trigger button clicked")
    forceTriggerInstall()
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem("install-prompt-dismissed", "true")
  }

  const handleManualInstall = () => {
    console.log("[v0] Manual install instructions requested")
    showManualInstallInstructions()
  }

  if (!isMobileDevice) {
    return null
  }

  // インストール済みの場合は表示しない
  if (isInstalled) {
    return null
  }

  if (isInstallable && !isDismissed) {
    return (
      <Card className="mx-4 mb-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">アプリをインストール</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">ホーム画面に追加してより快適に利用できます</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleInstall} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              インストール
            </Button>
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showManualInstructions && !isDismissed) {
    return (
      <Card className="mx-4 mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">アプリをインストール</p>
              <p className="text-sm text-green-700 dark:text-green-300">ブラウザのメニューからインストールできます</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleManualInstall} size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              手順を見る
            </Button>
            {process.env.NODE_ENV === "development" && (
              <Button
                onClick={handleForceTrigger}
                size="sm"
                variant="outline"
                className="text-green-600 border-green-600 bg-transparent"
              >
                テスト発火
              </Button>
            )}
            <Button
              onClick={handleDismiss}
              size="sm"
              variant="ghost"
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
