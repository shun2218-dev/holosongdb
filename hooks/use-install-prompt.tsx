"use client"

import { useState, useEffect } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showManualInstructions, setShowManualInstructions] = useState(false)

  useEffect(() => {
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      const installed = isStandalone || isInWebAppiOS
      setIsInstalled(installed)
    }

    checkIfInstalled()

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    const timeoutId = setTimeout(() => {
      if (!isInstallable && !isInstalled) {
        setShowManualInstructions(true)
      }
    }, 5000)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
      clearTimeout(timeoutId)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) {
      return false
    }

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice

      if (choiceResult.outcome === "accepted") {
        setIsInstallable(false)
        setDeferredPrompt(null)
        return true
      }
      return false
    } catch (error) {
      console.error("インストールプロンプトでエラーが発生しました:", error)
      return false
    }
  }

  const forceTriggerInstall = () => {
    // カスタムイベントを作成
    const mockEvent = new Event("beforeinstallprompt") as BeforeInstallPromptEvent

    // イベントオブジェクトにprompt()メソッドを追加
    mockEvent.prompt = async () => {
      const userConfirmed = confirm("このアプリをインストールしますか？")
      if (userConfirmed) {
        // インストール成功をシミュレート
        window.dispatchEvent(new Event("appinstalled"))
      }
    }

    // userChoiceプロパティを追加
    mockEvent.userChoice = new Promise((resolve) => {
      setTimeout(() => {
        resolve({ outcome: "accepted" as const })
      }, 100)
    })

    // イベントを発火
    window.dispatchEvent(mockEvent)
  }

  const showManualInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    let instructions = ""

    if (userAgent.includes("chrome") && !userAgent.includes("edg")) {
      instructions = "Chrome: アドレスバーの右側にあるインストールアイコン（⊕）をクリックしてください。"
    } else if (userAgent.includes("edg")) {
      instructions = "Edge: アドレスバーの右側にあるアプリアイコンをクリックしてください。"
    } else if (userAgent.includes("safari")) {
      instructions = "Safari: 共有ボタン（□↗）→「ホーム画面に追加」を選択してください。"
    } else if (userAgent.includes("firefox")) {
      instructions = "Firefox: メニュー（☰）→「このサイトをインストール」を選択してください。"
    } else {
      instructions = "ブラウザのメニューから「アプリをインストール」または「ホーム画面に追加」を選択してください。"
    }

    alert(`このアプリをホーム画面に追加できます：\n\n${instructions}`)
  }

  return {
    isInstallable,
    isInstalled,
    promptInstall,
    showManualInstructions,
    showManualInstallInstructions,
    forceTriggerInstall, // 強制発火機能を公開
  }
}
