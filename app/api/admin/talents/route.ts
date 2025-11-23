import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { nanoid } from "nanoid"

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

    const talents = await sql`
      SELECT 
        id,
        name,
        name_jp,
        name_en,
        branch,
        generation,
        debut,
        active,
        channel_id,
        subscriber_count,
        main_color,
        image_url,
        blur_data_url,
        created_at,
        updated_at
      FROM talents
      ORDER BY created_at DESC
    `

    return NextResponse.json({ talents })
  } catch (error) {
    console.error("[v0] Error fetching talents:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

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

    const data = await request.json()
    const { name, nameJp, nameEn, branch, generation, debut, active, channelId, mainColor, image_url, blur_data_url } =
      data

    if (!branch) {
      return NextResponse.json({ error: "ブランチは必須です" }, { status: 400 })
    }

    if ((branch === "JP" || branch === "DEV_IS") && !nameJp) {
      return NextResponse.json({ error: "日本語名は必須です" }, { status: 400 })
    }

    if (!nameEn) {
      return NextResponse.json({ error: "英語名は必須です" }, { status: 400 })
    }

    const finalName = branch === "JP" || branch === "DEV_IS" ? nameJp : nameEn

    const talentId = nanoid()

    await sql`
      INSERT INTO talents (
        id, name, name_jp, name_en, branch, generation, debut, active, channel_id, main_color, image_url, blur_data_url, created_at, updated_at
      ) VALUES (
        ${talentId}, ${finalName}, ${nameJp || null}, ${nameEn}, ${branch},
        ${generation || null}, ${debut ? new Date(debut) : null}, ${active}, ${channelId || null}, ${mainColor || null}, ${image_url || null}, ${blur_data_url || null},
        NOW(), NOW()
      )
    `

    return NextResponse.json({ success: true, id: talentId })
  } catch (error) {
    console.error("[v0] Error creating talent:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
