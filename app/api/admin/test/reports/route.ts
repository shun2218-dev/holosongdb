import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession, requireSuperAdmin } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Test reports API called")

    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value

    if (!sessionToken) {
      console.log("[v0] No session token")
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const admin = await verifyAdminSession(sessionToken)
    if (!admin) {
      console.log("[v0] Invalid session")
      return NextResponse.json({ error: "無効なセッションです" }, { status: 401 })
    }

    try {
      requireSuperAdmin(admin)
    } catch (authError: any) {
      console.log("[v0] Not super admin:", authError.message)
      return NextResponse.json({ error: authError.message }, { status: 403 })
    }

    const mockReports = [
      {
        type: "coverage",
        name: "テストカバレッジレポート",
        path: "#coverage-report",
        lastModified: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        size: 45678,
      },
      {
        type: "test-result",
        name: "unit-test-results.json",
        path: "#unit-test-results",
        lastModified: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        size: 12345,
      },
      {
        type: "test-result",
        name: "integration-test-results.xml",
        path: "#integration-test-results",
        lastModified: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
        size: 23456,
      },
    ]

    console.log("[v0] Returning mock reports")

    return NextResponse.json({
      success: true,
      reports: mockReports,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] Test reports API error:", error)

    return NextResponse.json(
      {
        success: false,
        reports: [],
        error: "サーバーエラーが発生しました: " + (error.message || "不明なエラー"),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
