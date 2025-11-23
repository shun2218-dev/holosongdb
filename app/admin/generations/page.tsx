import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/auth"
import { cookies } from "next/headers"
import { GenerationManagement } from "@/components/generation-management"

export const dynamic = "force-dynamic"

export default async function GenerationsPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin-session")?.value
  const admin = await verifyAdminSession(sessionToken || "")

  if (!admin) {
    redirect("/admin/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">期生管理</h1>
        <p className="text-muted-foreground mt-2">ブランチごとの期生情報を管理します</p>
      </div>

      <GenerationManagement />
    </div>
  )
}
