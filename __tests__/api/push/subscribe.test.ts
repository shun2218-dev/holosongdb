import { POST } from "@/app/api/push/subscribe/route"
import { sql } from "@/lib/db"
import { NextRequest } from "next/server"
import jest from "jest"

jest.mock("@/lib/db")

const mockSql = sql as jest.MockedFunction<typeof sql>

describe("/api/push/subscribe", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should save push subscription", async () => {
    mockSql.mockResolvedValue([{ id: "sub-1" }] as any)

    const request = new NextRequest("http://localhost:3000/api/push/subscribe", {
      method: "POST",
      body: JSON.stringify({
        endpoint: "https://push.example.com/endpoint",
        keys: {
          p256dh: "test-p256dh-key",
          auth: "test-auth-key",
        },
        userId: "user-1",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.subscriptionId).toBe("sub-1")
  })

  it("should update existing subscription", async () => {
    mockSql.mockResolvedValue([{ id: "sub-1" }] as any)

    const request = new NextRequest("http://localhost:3000/api/push/subscribe", {
      method: "POST",
      body: JSON.stringify({
        endpoint: "https://push.example.com/endpoint",
        keys: {
          p256dh: "new-p256dh-key",
          auth: "new-auth-key",
        },
        userId: "user-1",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it("should handle database errors", async () => {
    mockSql.mockRejectedValue(new Error("Database error"))

    const request = new NextRequest("http://localhost:3000/api/push/subscribe", {
      method: "POST",
      body: JSON.stringify({
        endpoint: "https://push.example.com/endpoint",
        keys: {
          p256dh: "test-p256dh-key",
          auth: "test-auth-key",
        },
        userId: "user-1",
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
  })
})
