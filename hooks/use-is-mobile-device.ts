"use client"

import { useEffect, useState } from "react"

/**
 * User AgentとデバイスAPIを使用して実際のモバイルデバイスを検出するフック
 * ビューポート幅ではなく、デバイスの種類で判定
 */
export function useIsMobileDevice() {
  const [isMobileDevice, setIsMobileDevice] = useState(false)

  useEffect(() => {
    const checkMobileDevice = () => {
      // User Agent文字列でモバイルデバイスを検出
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = ["android", "webos", "iphone", "ipad", "ipod", "blackberry", "windows phone", "mobile"]

      const isMobileUA = mobileKeywords.some((keyword) => userAgent.includes(keyword))

      // タッチスクリーンの有無を確認
      const hasTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0

      // モバイルデバイスと判定する条件：
      // 1. User Agentがモバイルを示している
      // 2. タッチスクリーンがある
      // 3. 画面幅が768px未満（追加の確認）
      const isSmallScreen = window.innerWidth < 768

      setIsMobileDevice(isMobileUA && hasTouchScreen && isSmallScreen)
    }

    checkMobileDevice()
  }, [])

  return isMobileDevice
}
