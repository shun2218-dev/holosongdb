/**
 * @jest-environment node
 */

import { POST } from "@/app/api/admin/send-notification/route"
import { NextRequest } from "next/server"
import jest from "jest"

// Mock dependencies
jest.mock("@/lib/db", () => ({
  query: jest.fn(),
}))

jest.mock("@/lib/auth", () => ({
  verifyAdminToken: jest.fn().mockResolvedValue({ id: "1", username: "testadmin", role: "admin" }),
}))

// Mock web push
jest.mock("web-push", () => ({
  sendNotification: jest.fn(),
  setVapidDetails: jest.fn(),
}))

const mockQuery = require("@/lib/db").query
const mockSendNotification = require("web-push").sendNotification

describe("/api/admin/send-notification", () => {
  beforeEach(() => {
    mockQuery.mockClear()
    mockSendNotification.mockClear()
  })

  it("should send notification successfully", async () => {
    const mockSubscriptions = [
      {
        id: "sub-1",
        endpoint: "https://fcm.googleapis.com/fcm/send/test",
        p256dh: "test-p256dh",
        auth: "test-auth",
      },
    ]

    mockQuery.mockResolvedValueOnce({ rows: mockSubscriptions })
    mockSendNotification.mockResolvedValue({ statusCode: 200 })
    mockQuery.mockResolvedValueOnce({ rows: [{ id: "notification-1" }] })

    const request = new NextRequest("http://localhost:3000/api/admin/send-notification", {
      method: "POST",
      headers: {
        authorization: "Bearer test-token",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: "Test Notification",
        body: "This is a test notification",
        url: "/test",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe("通知を送信しました")
    expect(data.sent).toBe(1)
    expect(mockSendNotification).toHaveBeenCalledTimes(1)
  })

  it("should validate required fields", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/send-notification", {
      method: "POST",
      headers: {
        authorization: "Bearer test-token",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: "",
        body: "Test body",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("タイトルと本文は必須です")
  })

  it("should handle no active subscriptions", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const request = new NextRequest("http://localhost:3000/api/admin/send-notification", {
      method: "POST",
      headers: {
        authorization: "Bearer test-token",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: "Test Notification",
        body: "This is a test notification",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe("通知を送信しました")
    expect(data.sent).toBe(0)
  })
})
