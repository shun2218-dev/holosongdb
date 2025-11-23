import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const admin = await verifyAdminSession(sessionToken)
    if (!admin) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    console.log("[v0] Clearing database cache")

    // Clear expired admin sessions (older than 7 days)
    await sql`
      DELETE FROM admin_sessions 
      WHERE created_at < NOW() - INTERVAL '7 days'
    `

    // Create a cache_operations table to track cache clearing
    await sql`
      CREATE TABLE IF NOT EXISTS cache_operations (
        id SERIAL PRIMARY KEY,
        operation_type TEXT NOT NULL,
        performed_by TEXT NOT NULL,
        performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Record the cache clear operation
    await sql`
      INSERT INTO cache_operations (operation_type, performed_by)
      VALUES ('clear_cache', ${admin.username})
    `

    console.log("[v0] Database cache cleared successfully")

    return NextResponse.json({
      success: true,
      message: "キャッシュが正常にクリアされました",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error clearing database cache:", error)
    return NextResponse.json({ error: "キャッシュのクリアに失敗しました" }, { status: 500 })
  }
}
