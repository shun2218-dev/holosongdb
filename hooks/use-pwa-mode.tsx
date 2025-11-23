"use client"

import { useState, useEffect } from "react"

export function usePWAMode() {
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    // Check if running in standalone mode (PWA installed and launched from home screen)
    const checkPWAMode = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      const isIOSStandalone = (window.navigator as any).standalone === true
      setIsPWA(isStandalone || isIOSStandalone)
    }

    checkPWAMode()

    // Listen for changes in display mode
    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    mediaQuery.addEventListener("change", checkPWAMode)

    return () => {
      mediaQuery.removeEventListener("change", checkPWAMode)
    }
  }, [])

  return isPWA
}
