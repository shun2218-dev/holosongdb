import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { verifyAdminSession } from "@/lib/auth"
import { cookies } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value
    const admin = await verifyAdminSession(sessionToken || "")

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const branch = request.nextUrl.searchParams.get("branch")

    let generations
    if (branch) {
      generations = await sql`
        SELECT id, branch, name, display_order, created_at, updated_at
        FROM generations
        WHERE branch = ${branch}
        ORDER BY display_order, name
      `
    } else {
      generations = await sql`
        SELECT id, branch, name, display_order, created_at, updated_at
        FROM generations
        ORDER BY branch, display_order, name
      `
    }

    return NextResponse.json(generations, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    console.error("Failed to fetch generations:", error)
    return NextResponse.json({ error: "Failed to fetch generations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value
    const admin = await verifyAdminSession(sessionToken || "")

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { branch, name, display_order } = await request.json()

    if (!branch || !name) {
      return NextResponse.json({ error: "Branch and name are required" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO generations (branch, name, display_order)
      VALUES (${branch}, ${name}, ${display_order || 0})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Failed to create generation:", error)
    if (error.code === "23505" || error.message?.includes("duplicate key")) {
      return NextResponse.json({ error: "この期生は既に登録されています" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create generation" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value
    const admin = await verifyAdminSession(sessionToken || "")

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, name, display_order } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "Generation ID is required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE generations
      SET 
        name = COALESCE(${name}, name),
        display_order = COALESCE(${display_order}, display_order),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Failed to update generation:", error)
    return NextResponse.json({ error: "Failed to update generation" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value
    const admin = await verifyAdminSession(sessionToken || "")

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = request.nextUrl.searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Generation ID is required" }, { status: 400 })
    }

    await sql`DELETE FROM generations WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete generation:", error)
    return NextResponse.json({ error: "Failed to delete generation" }, { status: 500 })
  }
}
