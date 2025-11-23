import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { endpoint, keys, userId } = await request.json()

    const result = await sql`
      INSERT INTO push_subscriptions (endpoint, p256dh_key, auth_key, user_id, created_at)
      VALUES (${endpoint}, ${keys.p256dh}, ${keys.auth}, ${userId}, NOW())
      ON CONFLICT (endpoint) 
      DO UPDATE SET 
        p256dh_key = ${keys.p256dh},
        auth_key = ${keys.auth},
        user_id = ${userId},
        updated_at = NOW()
      RETURNING id
    `

    const subscriptionId = result[0]?.id

    return NextResponse.json({
      success: true,
      subscriptionId,
    })
  } catch (error) {
    console.error("Failed to save push subscription:", error)
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 })
  }
}
