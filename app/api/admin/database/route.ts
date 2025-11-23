import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
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

    console.log("[v0] Fetching database info")

    // Get table information
    const tableInfo = await sql`
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `

    // Get database size information
    const dbSize = await sql`
      SELECT 
        pg_size_pretty(pg_database_size(current_database())) as database_size
    `

    // Get table sizes
    const tableSizes = await sql`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `

    // Get record counts for main tables
    const [songsCount, talentsCount, adminsCount] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM songs`,
      sql`SELECT COUNT(*) as count FROM talents`,
      sql`SELECT COUNT(*) as count FROM admins`,
    ])

    let lastBackup = null
    try {
      const backupInfo = await sql`
        SELECT created_at FROM database_backups 
        ORDER BY created_at DESC 
        LIMIT 1
      `
      if (backupInfo.length > 0) {
        lastBackup = backupInfo[0].created_at
      }
    } catch (error) {
      // Backup table might not exist yet, that's okay
      console.log("[v0] No backup history found")
    }

    const databaseInfo = {
      totalSize: Array.isArray(dbSize) ? dbSize[0]?.database_size : "Unknown",
      lastBackup: lastBackup,
      tables: Array.isArray(tableSizes)
        ? tableSizes.map((table) => ({
            name: table.tablename,
            size: table.size,
            rows: 0, // We'll get actual row counts for main tables
          }))
        : [],
      overview: {
        databaseSize: Array.isArray(dbSize) ? dbSize[0]?.database_size : "Unknown",
        totalTables: Array.isArray(tableInfo) ? tableInfo.length : 0,
      },
      tableSizes: Array.isArray(tableSizes)
        ? tableSizes.map((table) => ({
            schema: table.schemaname,
            name: table.tablename,
            size: table.size,
            sizeBytes: Number.parseInt(table.size_bytes),
          }))
        : [],
      recordCounts: {
        songs: Array.isArray(songsCount) ? Number.parseInt(songsCount[0]?.count || "0") : 0,
        talents: Array.isArray(talentsCount) ? Number.parseInt(talentsCount[0]?.count || "0") : 0,
        admins: Array.isArray(adminsCount) ? Number.parseInt(adminsCount[0]?.count || "0") : 0,
      },
    }

    databaseInfo.tables = databaseInfo.tables.map((table) => {
      if (table.name === "songs") {
        table.rows = databaseInfo.recordCounts.songs
      } else if (table.name === "talents") {
        table.rows = databaseInfo.recordCounts.talents
      } else if (table.name === "admins") {
        table.rows = databaseInfo.recordCounts.admins
      }
      return table
    })

    return NextResponse.json(databaseInfo)
  } catch (error) {
    console.error("[v0] Error fetching database info:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
