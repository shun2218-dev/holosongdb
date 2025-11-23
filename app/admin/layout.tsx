import type React from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { AdminLayoutClient } from "@/components/admin-layout-client"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin-session")?.value

  if (!sessionToken) {
    redirect("/admin-login")
  }

  const admin = await verifyAdminSession(sessionToken)
  if (!admin) {
    redirect("/admin-login")
  }

  return <AdminLayoutClient admin={admin}>{children}</AdminLayoutClient>
}
