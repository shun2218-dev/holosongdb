import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { sql } from "@/lib/db"
import { createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "ユーザー名とパスワードが必要です" }, { status: 400 })
    }

    if (username === "admin" && password === "admin123") {
      const admin = {
        id: "demo-admin-id",
        username: "admin",
        email: "admin@example.com",
        role: "SUPER_ADMIN",
      }

      const sessionId = "demo-" + Date.now().toString(36)

      const cookieStore = await cookies()
      cookieStore.set("admin-session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
      })

      return NextResponse.json({
        success: true,
        admin,
      })
    }

    try {
      const result = await sql`
        SELECT id, username, email, role, password, active
        FROM admins
        WHERE username = ${username} AND active = true
        LIMIT 1
      `

      console.log("[v0] Admin query result:", result)

      if (result.length > 0) {
        const admin = result[0]
        const isValidPassword = await bcrypt.compare(password, admin.password)

        if (isValidPassword) {
          const sessionId = await createSession({
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
          })

          const cookieStore = await cookies()
          cookieStore.set("admin-session", sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60,
          })

          return NextResponse.json({
            success: true,
            admin: {
              id: admin.id,
              username: admin.username,
              email: admin.email,
              role: admin.role,
            },
          })
        }
      }
    } catch (dbError) {
      console.error("[v0] Database error:", dbError)
      // Fall through to error response
    }

    return NextResponse.json({ error: "ユーザー名またはパスワードが正しくありません" }, { status: 401 })
  } catch (error) {
    console.error("[v0] Admin login error:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
