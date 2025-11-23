import { sql } from "@/lib/db"

interface Admin {
  id: string
  username: string
  email: string
  role: string
  active?: boolean
}

export async function createSession(admin: Admin): Promise<string> {
  const sessionId = generateSessionId()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        admin_id VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    await sql`
      INSERT INTO admin_sessions (session_id, admin_id, expires_at)
      VALUES (${sessionId}, ${admin.id}, ${expiresAt})
    `

    // Clean up expired sessions
    await cleanupExpiredSessions()

    return sessionId
  } catch (error) {
    console.error("[v0] Failed to create session:", error)
    throw new Error("セッションの作成に失敗しました")
  }
}

export async function verifyAdminSession(sessionId: string): Promise<Admin | null> {
  try {
    // Handle demo admin with simple session
    if (sessionId.startsWith("demo-")) {
      return {
        id: "demo-admin-id",
        username: "admin",
        email: "admin@example.com",
        role: "SUPER_ADMIN",
        active: true,
      }
    }

    const result = await sql`
      SELECT 
        s.session_id,
        s.expires_at,
        a.id,
        a.username,
        a.email,
        a.role,
        a.active
      FROM admin_sessions s
      JOIN admins a ON s.admin_id = a.id
      WHERE s.session_id = ${sessionId}
        AND s.expires_at > NOW()
        AND a.active = true
      LIMIT 1
    `

    if (result.length === 0) {
      return null
    }

    const session = result[0]

    return {
      id: session.id,
      username: session.username,
      email: session.email,
      role: session.role,
      active: session.active,
    }
  } catch (error) {
    console.error("[v0] Session verification error:", error)
    return null
  }
}

export async function destroySession(sessionId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM admin_sessions 
      WHERE session_id = ${sessionId}
    `
  } catch (error) {
    console.error("[v0] Failed to destroy session:", error)
  }
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

async function cleanupExpiredSessions(): Promise<void> {
  try {
    await sql`
      DELETE FROM admin_sessions 
      WHERE expires_at <= NOW()
    `
  } catch (error) {
    console.error("[v0] Failed to cleanup expired sessions:", error)
  }
}

export function requireAdmin(admin: Admin | null) {
  if (!admin) {
    throw new Error("管理者権限が必要です")
  }
  return admin
}

export function requireSuperAdmin(admin: Admin | null) {
  if (!admin || admin.role !== "SUPER_ADMIN") {
    throw new Error("スーパー管理者権限が必要です")
  }
  return admin
}
