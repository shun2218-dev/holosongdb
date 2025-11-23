"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[PWA] Service Worker registered:", registration)
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error)
        })
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallBanner(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    console.log("[PWA] Install prompt outcome:", outcome)
    setDeferredPrompt(null)
    setShowInstallBanner(false)
  }

  const handleDismiss = () => {
    setShowInstallBanner(false)
    setDeferredPrompt(null)
  }

  if (!showInstallBanner) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-background border border-border rounded-lg p-4 shadow-lg z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="flex items-start gap-3">
        <Download className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">アプリをインストール</h3>
          <p className="text-xs text-muted-foreground mt-1">
            HoloSong DBをホーム画面に追加して、より快適にご利用いただけます。
          </p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleInstallClick}>
              インストール
            </Button>
            <Button size="sm" variant="outline" onClick={handleDismiss}>
              後で
            </Button>
          </div>
        </div>
        <Button size="sm" variant="ghost" onClick={handleDismiss} className="p-1 h-auto">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
