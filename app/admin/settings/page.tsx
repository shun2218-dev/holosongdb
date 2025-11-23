import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { SettingsClient } from "./settings-client"

export default async function SettingsPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin-session")?.value

  if (!sessionToken) {
    redirect("/admin/login")
  }

  const admin = await verifyAdminSession(sessionToken)
  if (!admin) {
    redirect("/admin/login")
  }

  if (admin.role !== "SUPER_ADMIN" && admin.role !== "ADMIN") {
    redirect("/admin")
  }

  return <SettingsClient admin={admin} />
}
