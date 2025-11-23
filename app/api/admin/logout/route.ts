import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { destroySession } from "@/lib/auth"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("admin-session")?.value

    if (sessionId) {
      destroySession(sessionId)
    }

    cookieStore.delete("admin-session")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Admin logout error:", error)
    return NextResponse.json({ error: "ログアウトに失敗しました" }, { status: 500 })
  }
}
