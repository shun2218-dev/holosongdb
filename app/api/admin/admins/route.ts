import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import { nanoid } from "nanoid"

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

    console.log("[v0] Fetching admin users")

    const admins = await sql`
      SELECT 
        id,
        username,
        email,
        role,
        active,
        created_at,
        updated_at
      FROM admins
      ORDER BY created_at DESC
    `

    const adminList = Array.isArray(admins)
      ? admins.map((adminUser) => ({
          id: adminUser.id,
          username: adminUser.username,
          email: adminUser.email,
          role: adminUser.role,
          active: adminUser.active,
          createdAt: adminUser.created_at,
          updatedAt: adminUser.updated_at,
        }))
      : []

    return NextResponse.json({ admins: adminList })
  } catch (error) {
    console.error("[v0] Error fetching admins:", error)
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
    if (!admin || (admin.role !== "SUPER_ADMIN" && admin.role !== "ADMIN")) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 })
    }

    const { username, email, password, role } = await request.json()

    if (!username || !email || !password || !role) {
      return NextResponse.json({ error: "必要な情報が不足しています" }, { status: 400 })
    }

    const canCreateRole = (currentRole: string, targetRole: string) => {
      if (currentRole === "SUPER_ADMIN") return true
      if (currentRole === "ADMIN" && targetRole === "EDITOR") return true
      return false
    }

    if (!canCreateRole(admin.role, role)) {
      return NextResponse.json({ error: "このロールを作成する権限がありません" }, { status: 403 })
    }

    const validRoles = ["SUPER_ADMIN", "ADMIN", "EDITOR"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "無効なロールです" }, { status: 400 })
    }

    // Check if username or email already exists
    const existingAdmin = await sql`
      SELECT id FROM admins 
      WHERE username = ${username} OR email = ${email}
    `

    if (existingAdmin.length > 0) {
      return NextResponse.json({ error: "ユーザー名またはメールアドレスが既に使用されています" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    const adminId = nanoid()

    await sql`
      INSERT INTO admins (id, username, email, password, role, active, created_at, updated_at)
      VALUES (${adminId}, ${username}, ${email}, ${hashedPassword}, ${role}, true, NOW(), NOW())
    `

    console.log("[v0] Created new admin user:", username)

    return NextResponse.json({ message: "管理者を作成しました" })
  } catch (error) {
    console.error("[v0] Error creating admin:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
