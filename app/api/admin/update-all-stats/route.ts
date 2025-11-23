import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("admin_session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"
    const results = []

    // Update cover song statistics
    try {
      const coverResponse = await fetch(`${baseUrl}/api/admin/update-statistics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `admin_session=${sessionCookie.value}`,
        },
        body: JSON.stringify({ songType: "cover" }),
      })
      const coverResult = await coverResponse.json()
      results.push({
        type: "cover_stats",
        success: coverResponse.ok,
        result: coverResult,
      })
    } catch (error) {
      console.error("[v0] Cover stats update failed:", error)
      results.push({
        type: "cover_stats",
        success: false,
        error: error.message,
      })
    }

    // Update original song statistics
    try {
      const originalResponse = await fetch(`${baseUrl}/api/admin/update-statistics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `admin_session=${sessionCookie.value}`,
        },
        body: JSON.stringify({ songType: "original" }),
      })
      const originalResult = await originalResponse.json()
      results.push({
        type: "original_stats",
        success: originalResponse.ok,
        result: originalResult,
      })
    } catch (error) {
      console.error("[v0] Original stats update failed:", error)
      results.push({
        type: "original_stats",
        success: false,
        error: error.message,
      })
    }

    // Update subscriber counts
    try {
      const subscriberResponse = await fetch(`${baseUrl}/api/admin/update-subscriber-counts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `admin_session=${sessionCookie.value}`,
        },
        body: JSON.stringify({}),
      })
      const subscriberResult = await subscriberResponse.json()
      results.push({
        type: "subscriber_counts",
        success: subscriberResponse.ok,
        result: subscriberResult,
      })
    } catch (error) {
      console.error("[v0] Subscriber counts update failed:", error)
      results.push({
        type: "subscriber_counts",
        success: false,
        error: error.message,
      })
    }

    const successCount = results.filter((r) => r.success).length
    const totalCount = results.length

    return NextResponse.json({
      success: successCount > 0,
      message: `Combined statistics update completed: ${successCount}/${totalCount} tasks successful`,
      results,
      summary: {
        total: totalCount,
        successful: successCount,
        failed: totalCount - successCount,
      },
    })
  } catch (error) {
    console.error("[v0] Combined update failed:", error)
    return NextResponse.json({ error: "Combined update failed" }, { status: 500 })
  }
}
