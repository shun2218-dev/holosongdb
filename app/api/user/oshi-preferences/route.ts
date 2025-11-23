import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { nanoid } from "nanoid"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "ユーザーIDが必要です" }, { status: 400 })
    }

    const preferences = await sql`
      SELECT 
        uop.id,
        uop.talent_id as "talentId",
        uop.created_at as "createdAt",
        t.name,
        t.name_jp as "nameJp",
        t.name_en as "nameEn",
        t.branch,
        t.generation,
        t.main_color as "mainColor"
      FROM user_oshi_preferences uop
      JOIN talents t ON t.id = uop.talent_id
      WHERE uop.user_id = ${userId}
      ORDER BY uop.created_at DESC
    `

    return NextResponse.json(
      { preferences },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Error fetching oshi preferences:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "ユーザーIDが必要です" }, { status: 400 })
    }

    const { talentIds } = await request.json()

    if (!Array.isArray(talentIds)) {
      return NextResponse.json({ error: "talentIdsは配列である必要があります" }, { status: 400 })
    }

    // Delete all existing preferences for this user
    await sql`
      DELETE FROM user_oshi_preferences
      WHERE user_id = ${userId}
    `

    // Insert new preferences
    if (talentIds.length > 0) {
      const values = talentIds.map((talentId) => ({
        id: nanoid(),
        userId,
        talentId,
      }))

      for (const value of values) {
        await sql`
          INSERT INTO user_oshi_preferences (id, user_id, talent_id, created_at, updated_at)
          VALUES (${value.id}, ${value.userId}, ${value.talentId}, NOW(), NOW())
        `
      }
    }

    return NextResponse.json(
      { success: true, count: talentIds.length },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Error updating oshi preferences:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
