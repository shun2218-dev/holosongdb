import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession, requireSuperAdmin } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] E2E Test Reports API called")

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

    // In a real implementation, you would fetch reports from a database
    // For now, return mock report data
    const mockReports = [
      {
        id: "1",
        testType: "all",
        name: "全E2Eテスト",
        success: true,
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        passed: 27,
        failed: 0,
        skipped: 1,
        duration: 45000,
        browser: "chromium",
        output: "All E2E tests completed successfully",
        error: "",
      },
      {
        id: "2",
        testType: "auth",
        name: "認証テスト",
        success: true,
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        passed: 3,
        failed: 0,
        skipped: 0,
        duration: 8500,
        browser: "chromium",
        output: "Authentication tests passed",
        error: "",
      },
      {
        id: "3",
        testType: "performance",
        name: "パフォーマンステスト",
        success: false,
        timestamp: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
        passed: 2,
        failed: 1,
        skipped: 0,
        duration: 12000,
        browser: "chromium",
        output: "Performance test failed: Dashboard load time exceeded threshold",
        error: "Dashboard load time: 3.2s (threshold: 3.0s)",
      },
    ]

    console.log("[v0] E2E Test reports retrieved successfully")

    return NextResponse.json({
      success: true,
      reports: mockReports,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] E2E Test reports API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "サーバーエラーが発生しました: " + (error.message || "不明なエラー"),
        reports: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("[v0] E2E Test Reports DELETE API called")

    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const admin = await verifyAdminSession(sessionToken)
    if (!admin) {
      return NextResponse.json({ error: "無効なセッションです" }, { status: 401 })
    }

    try {
      requireSuperAdmin(admin)
    } catch (authError: any) {
      return NextResponse.json({ error: authError.message }, { status: 403 })
    }

    const { reportId } = await request.json()

    // In a real implementation, you would delete the report from the database
    console.log("[v0] Deleting E2E test report:", reportId)

    return NextResponse.json({
      success: true,
      message: "レポートが削除されました",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] E2E Test report deletion error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "レポートの削除に失敗しました: " + (error.message || "不明なエラー"),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
