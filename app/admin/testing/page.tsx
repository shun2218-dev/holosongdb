import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyAdminSession, requireSuperAdmin } from "@/lib/auth"
import { TestingClient } from "./testing-client"

export default async function TestingPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin-session")?.value

  if (!sessionToken) {
    redirect("/admin/login")
  }

  const admin = await verifyAdminSession(sessionToken)
  if (!admin) {
    redirect("/admin/login")
  }

  try {
    requireSuperAdmin(admin)
  } catch {
    redirect("/admin") // スーパー管理者でない場合はダッシュボードにリダイレクト
  }

  return <TestingClient admin={admin} />
}
