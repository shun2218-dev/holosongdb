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

    console.log("[v0] Optimizing database")

    // Run VACUUM and ANALYZE on main tables to optimize performance
    const tables = ["songs", "talents", "admins", "admin_sessions"]

    for (const table of tables) {
      try {
        // Check if table exists before optimizing
        const tableExists = await sql`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = ${table}
          )
        `

        if (tableExists[0]?.exists) {
          await sql`VACUUM ANALYZE ${sql(table)}`
          console.log(`[v0] Optimized table: ${table}`)
        }
      } catch (tableError) {
        console.warn(`[v0] Could not optimize table ${table}:`, tableError)
      }
    }

    console.log("[v0] Database optimization completed")

    return NextResponse.json({
      success: true,
      message: "データベースの最適化が完了しました",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error optimizing database:", error)
    return NextResponse.json({ error: "データベースの最適化に失敗しました" }, { status: 500 })
  }
}
