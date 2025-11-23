import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { AdminLoginForm } from "@/components/admin-login-form"
import { verifyAdminSession } from "@/lib/auth"

export default async function AdminLoginPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("admin-session")?.value

  if (sessionToken) {
    const admin = await verifyAdminSession(sessionToken)
    if (admin) {
      redirect("/admin")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">管理者ログイン</h1>
          <p className="text-muted-foreground mt-2">Hololive楽曲データベース管理システム</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  )
}
