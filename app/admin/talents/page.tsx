import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { TalentManagement } from "@/components/talent-management"

export default async function AdminTalentsPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin-session")?.value

  if (!sessionToken) {
    redirect("/admin/login")
  }

  const admin = await verifyAdminSession(sessionToken)
  if (!admin) {
    redirect("/admin/login")
  }

  return <TalentManagement admin={admin} />
}
