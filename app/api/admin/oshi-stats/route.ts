import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Get total number of users with oshi preferences
    const totalUsersResult = await sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM user_oshi_preferences
    `
    const totalUsers = Number(totalUsersResult[0]?.count || 0)

    // Get total number of oshi preferences
    const totalPreferencesResult = await sql`
      SELECT COUNT(*) as count
      FROM user_oshi_preferences
    `
    const totalPreferences = Number(totalPreferencesResult[0]?.count || 0)

    // Get most popular oshi (top 10)
    const popularOshiResult = await sql`
      SELECT 
        t.id,
        t.name,
        t.name_jp,
        t.name_en,
        t.branch,
        t.main_color,
        COUNT(uop.id) as preference_count
      FROM user_oshi_preferences uop
      JOIN talents t ON uop.talent_id = t.id
      GROUP BY t.id, t.name, t.name_jp, t.name_en, t.branch, t.main_color
      ORDER BY preference_count DESC
      LIMIT 10
    `

    // Get oshi preferences by branch
    const branchStatsResult = await sql`
      SELECT 
        t.branch,
        COUNT(uop.id) as preference_count
      FROM user_oshi_preferences uop
      JOIN talents t ON uop.talent_id = t.id
      GROUP BY t.branch
      ORDER BY preference_count DESC
    `

    // Calculate average oshi per user
    const avgOshiPerUser = totalUsers > 0 ? (totalPreferences / totalUsers).toFixed(1) : "0"

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalPreferences,
        avgOshiPerUser,
        popularOshi: popularOshiResult.map((row) => ({
          id: row.id,
          name: row.name,
          nameJp: row.name_jp,
          nameEn: row.name_en,
          branch: row.branch,
          mainColor: row.main_color,
          preferenceCount: Number(row.preference_count),
        })),
        branchStats: branchStatsResult.map((row) => ({
          branch: row.branch,
          preferenceCount: Number(row.preference_count),
        })),
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching oshi stats:", error)
    return NextResponse.json({ success: false, error: "推し統計の取得に失敗しました" }, { status: 500 })
  }
}
