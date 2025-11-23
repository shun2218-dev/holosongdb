"use client"

import { useIsMobileDevice } from "@/hooks/use-is-mobile-device"
import { usePWAMode } from "@/hooks/use-pwa-mode"

export function SiteFooter() {
  const isMobileDevice = useIsMobileDevice()
  const isPWA = usePWAMode()
  const showBottomNav = isPWA || isMobileDevice

  return (
    <footer className={`border-t border-border mt-16 ${showBottomNav ? "pb-32 md:pb-8" : "pb-8"}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-sm text-muted-foreground">
          <p>HoloSong DB は非公式のファンサイトです。</p>
          <p className="mt-2">© 2025 HoloSong DB. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
