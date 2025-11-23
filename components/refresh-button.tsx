"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"
import { useEffect, useState } from "react"

export function RefreshButton() {
  const router = useRouter()
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const checkStandalone = () => {
      // CSS display-mode: standalone の検出
      const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches
      // iOS Safari用の検出
      const isIOSStandalone = (window.navigator as any).standalone === true

      setIsStandalone(isStandaloneMode || isIOSStandalone)
    }

    checkStandalone()

    // display-modeの変更を監視
    const mediaQuery = window.matchMedia("(display-mode: standalone)")
    mediaQuery.addEventListener("change", checkStandalone)

    return () => mediaQuery.removeEventListener("change", checkStandalone)
  }, [])

  const handleRefresh = () => {
    router.refresh()
  }

  if (!isStandalone) {
    return null
  }

  return (
    <Button onClick={handleRefresh} variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
      <RotateCcw className="h-4 w-4" />
      リロード
    </Button>
  )
}
