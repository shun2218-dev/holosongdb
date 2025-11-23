import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "オフライン | HoloSong DB",
  robots: {
    index: false,
    follow: false,
  },
}

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
