"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { MobileHeader } from "@/components/mobile-header"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

interface Admin {
  id: string
  username: string
  email: string
  role: string
}

interface AdminLayoutClientProps {
  admin: Admin
  children: React.ReactNode
}

export function AdminLayoutClient({ admin, children }: AdminLayoutClientProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      })

      if (response.ok) {
        router.push("/admin/login")
      } else {
        console.error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader admin={admin} onLogout={handleLogout} isLoggingOut={isLoggingOut} />

      <main className="pb-20 md:pb-0">{children}</main>

      <MobileBottomNav />
    </div>
  )
}
