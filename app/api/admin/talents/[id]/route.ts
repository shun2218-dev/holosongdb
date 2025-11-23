import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { del } from "@vercel/blob"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    await sql`
      UPDATE talents SET
        name = ${finalName},
        name_jp = ${nameJp || null},
        name_en = ${nameEn},
        branch = ${branch},
        generation = ${generation || null},
        debut = ${debut ? new Date(debut) : null},
        active = ${active},
        channel_id = ${channelId || null},
        main_color = ${mainColor || null},
        image_url = ${image_url || null},
        blur_data_url = ${blur_data_url || null},
        updated_at = NOW()
      WHERE id = ${params.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating talent:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const talent = await sql`SELECT image_url FROM talents WHERE id = ${params.id}`
    if (talent.rows[0]?.image_url) {
      try {
        await del(talent.rows[0].image_url)
        console.log("[v0] Deleted talent image:", talent.rows[0].image_url)
      } catch (error) {
        console.error("[v0] Failed to delete talent image:", error)
      }
    }

    await sql`DELETE FROM songs WHERE talent_id = ${params.id}`
    await sql`DELETE FROM talents WHERE id = ${params.id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting talent:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
