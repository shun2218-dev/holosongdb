import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const result = await sql`
      SELECT 
        t.id, 
        t.name, 
        t.name_jp, 
        t.name_en, 
        t.branch, 
        t.generation, 
        t.active, 
        t.main_color,
        t.subscriber_count,
        t.image_url,
        t.blur_data_url,
        MIN(g.display_order) as generation_display_order
      FROM talents t
      LEFT JOIN generations g ON t.branch = g.branch 
        AND g.name = ANY(string_to_array(t.generation, ','))
      WHERE t.active = true
      GROUP BY t.id, t.name, t.name_jp, t.name_en, t.branch, t.generation, t.active, t.main_color, t.subscriber_count, t.image_url, t.blur_data_url
      ORDER BY t.branch, generation_display_order NULLS LAST, t.name
    `

    return NextResponse.json({ talents: result })
  } catch (error) {
    console.error("[v0] Error fetching talents:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
