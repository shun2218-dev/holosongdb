import { put, del } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"

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

    const formData = await request.formData()
    const file = formData.get("file") as File
    const oldImageUrl = formData.get("old_image_url") as string | null

    if (!file) {
      return NextResponse.json({ error: "ファイルが選択されていません" }, { status: 400 })
    }

    // ファイルサイズチェック (5MB制限)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "ファイルサイズは5MB以下にしてください" }, { status: 400 })
    }

    // ファイルタイプチェック
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "画像ファイルのみアップロード可能です" }, { status: 400 })
    }

    // Vercel Blobにアップロード
    const blob = await put(`talents/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    if (oldImageUrl) {
      try {
        await del(oldImageUrl)
        console.log("[v0] Deleted old image:", oldImageUrl)
      } catch (error) {
        console.error("[v0] Failed to delete old image:", error)
        // Continue even if deletion fails
      }
    }

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "アップロードに失敗しました" }, { status: 500 })
  }
}
