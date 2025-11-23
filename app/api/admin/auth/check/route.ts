import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("admin_session")?.value

    if (!sessionId) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const admin = await verifyAdminSession(sessionId)

    if (!admin) {
      return NextResponse.json({ error: "無効なセッションです" }, { status: 401 })
    }

    return NextResponse.json(admin)
  } catch (error) {
    console.error("[v0] Auth check error:", error)
    return NextResponse.json({ error: "認証チェックに失敗しました" }, { status: 500 })
  }
}
