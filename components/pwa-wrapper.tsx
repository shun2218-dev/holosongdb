"use client"

import { usePWAMode } from "@/hooks/use-pwa-mode"
import { useIsMobileDevice } from "@/hooks/use-is-mobile-device"
import { PWABottomNav } from "@/components/pwa-bottom-nav"
import type { ReactNode } from "react"

export function PWAWrapper({ children }: { children: ReactNode }) {
  const isPWA = usePWAMode()
  const isMobileDevice = useIsMobileDevice()

  const showBottomNav = isPWA || isMobileDevice

  return (
    <>
      <div className={showBottomNav ? "pb-16 md:pb-0" : ""}>{children}</div>
      {showBottomNav && <PWABottomNav />}
    </>
  )
}
