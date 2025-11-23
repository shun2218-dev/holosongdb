import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint is required" }, { status: 400 })
    }

    // Find subscription by endpoint
    const result = await sql`
      SELECT id, user_id 
      FROM push_subscriptions 
      WHERE endpoint = ${endpoint} AND active = true
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    return NextResponse.json({
      subscriptionId: result[0].id,
      userId: result[0].user_id || "anonymous",
    })
  } catch (error) {
    console.error("Error getting subscription ID:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
