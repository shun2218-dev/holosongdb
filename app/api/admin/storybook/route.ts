import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminSession } from "@/lib/auth"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("admin-session")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const admin = await verifyAdminSession(sessionId)

    if (!admin) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    if (admin.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "スーパー管理者権限が必要です" }, { status: 403 })
    }

    console.log("[v0] Storybook access granted for:", admin.username)

    const storybookUrl = process.env.NODE_ENV === "development" ? "http://localhost:6006" : "/admin/storybook"

    return NextResponse.json({
      success: true,
      storybookUrl,
      message: "Storybookアクセスが許可されました",
      isDevelopment: process.env.NODE_ENV === "development",
    })
  } catch (error) {
    console.error("[v0] Storybook access error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "アクセスが拒否されました" },
      { status: 500 },
    )
  }
}
