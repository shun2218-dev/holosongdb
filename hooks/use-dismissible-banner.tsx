"use client"

import { useState, useEffect } from "react"

interface UseDismissibleBannerProps {
  key: string
  resetTrigger?: any // オンライン状態など、リセットのトリガーとなる値
}

export function useDismissibleBanner({ key, resetTrigger }: UseDismissibleBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const storageKey = `banner-dismissed-${key}`

  useEffect(() => {
    // 初期化時にSessionStorageから状態を読み込み
    const dismissed = sessionStorage.getItem(storageKey) === "true"
    setIsDismissed(dismissed)
  }, [storageKey])

  useEffect(() => {
    // リセットトリガーが変わった時にSessionStorageをクリア
    if (resetTrigger !== undefined) {
      sessionStorage.removeItem(storageKey)
      setIsDismissed(false)
    }
  }, [resetTrigger, storageKey])

  const dismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem(storageKey, "true")
  }

  return {
    isDismissed,
    dismiss,
  }
}
