import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const admin = await verifyAdminSession(sessionToken)
    if (!admin || (admin.role !== "SUPER_ADMIN" && admin.role !== "ADMIN")) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }

    const { id } = params

    // Prevent deleting self
    if (admin.id === id) {
      return NextResponse.json({ error: "自分自身を削除することはできません" }, { status: 400 })
    }

    // Check if admin exists and get their role
    const existingAdmin = await sql`
      SELECT id, username, role FROM admins WHERE id = ${id}
    `

    if (existingAdmin.length === 0) {
      return NextResponse.json({ error: "管理者が見つかりません" }, { status: 404 })
    }

    const targetAdmin = existingAdmin[0]

    const canDeleteRole = (currentRole: string, targetRole: string) => {
      if (currentRole === "SUPER_ADMIN") return true
      if (currentRole === "ADMIN" && targetRole === "EDITOR") return true
      return false
    }

    if (!canDeleteRole(admin.role, targetAdmin.role)) {
      return NextResponse.json({ error: "このアカウントを削除する権限がありません" }, { status: 403 })
    }

    // Delete admin
    await sql`
      DELETE FROM admins WHERE id = ${id}
    `

    console.log("[v0] Deleted admin user:", targetAdmin.username)

    return NextResponse.json({ message: "管理者を削除しました" })
  } catch (error) {
    console.error("[v0] Error deleting admin:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const admin = await verifyAdminSession(sessionToken)
    if (!admin || (admin.role !== "SUPER_ADMIN" && admin.role !== "ADMIN")) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }

    const { id } = params
    const { active } = await request.json()

    // Prevent deactivating self
    if (admin.id === id) {
      return NextResponse.json({ error: "自分自身を無効化することはできません" }, { status: 400 })
    }

    // Check if admin exists and get their role
    const existingAdmin = await sql`
      SELECT id, username, role FROM admins WHERE id = ${id}
    `

    if (existingAdmin.length === 0) {
      return NextResponse.json({ error: "管理者が見つかりません" }, { status: 404 })
    }

    const targetAdmin = existingAdmin[0]

    const canUpdateRole = (currentRole: string, targetRole: string) => {
      if (currentRole === "SUPER_ADMIN") return true
      if (currentRole === "ADMIN" && targetRole === "EDITOR") return true
      return false
    }

    if (!canUpdateRole(admin.role, targetAdmin.role)) {
      return NextResponse.json({ error: "このアカウントを更新する権限がありません" }, { status: 403 })
    }

    await sql`
      UPDATE admins 
      SET active = ${active}, updated_at = NOW()
      WHERE id = ${id}
    `

    console.log(`[v0] Updated admin status:`, targetAdmin.username, active ? "activated" : "deactivated")

    return NextResponse.json({ message: active ? "管理者を有効化しました" : "管理者を無効化しました" })
  } catch (error) {
    console.error("[v0] Error updating admin:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
