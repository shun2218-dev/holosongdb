/**
 * @jest-environment node
 */

import { POST } from "@/app/api/admin/ai-analysis/route"
import { NextRequest } from "next/server"
import jest from "jest"

// Mock dependencies
jest.mock("@/lib/db", () => ({
  query: jest.fn(),
}))

jest.mock("@/lib/auth", () => ({
  verifyAdminToken: jest.fn().mockResolvedValue({ id: "1", username: "testadmin", role: "admin" }),
}))

// Mock AI SDK
jest.mock("ai", () => ({
  generateText: jest.fn(),
}))

const mockQuery = require("@/lib/db").query
const mockGenerateText = require("ai").generateText

describe("/api/admin/ai-analysis", () => {
  beforeEach(() => {
    mockQuery.mockClear()
    mockGenerateText.mockClear()
  })

  it("should generate AI analysis successfully", async () => {
    const mockSongs = [
      {
        title: "Test Song",
        view_count: "1000000",
        like_count: "50000",
        talent_name: "Test Talent",
        release_date: "2025-01-01",
      },
    ]

    const mockAnalysis = {
      text: "This is a test AI analysis of the songs data.",
    }

    mockQuery.mockResolvedValueOnce({ rows: mockSongs })
    mockGenerateText.mockResolvedValueOnce(mockAnalysis)
    mockQuery.mockResolvedValueOnce({ rows: [{ id: "analysis-1" }] })

    const request = new NextRequest("http://localhost:3000/api/admin/ai-analysis", {
      method: "POST",
      headers: {
        authorization: "Bearer test-token",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        period: "month",
        analysisType: "performance",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.analysis).toBe("This is a test AI analysis of the songs data.")
    expect(mockGenerateText).toHaveBeenCalledWith({
      model: expect.any(String),
      prompt: expect.stringContaining("Test Song"),
    })
  })

  it("should handle missing parameters", async () => {
    const request = new NextRequest("http://localhost:3000/api/admin/ai-analysis", {
      method: "POST",
      headers: {
        authorization: "Bearer test-token",
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("期間と分析タイプは必須です")
  })

  it("should handle AI generation errors", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    mockGenerateText.mockRejectedValueOnce(new Error("AI service error"))

    const request = new NextRequest("http://localhost:3000/api/admin/ai-analysis", {
      method: "POST",
      headers: {
        authorization: "Bearer test-token",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        period: "month",
        analysisType: "performance",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("AI分析の生成に失敗しました")
  })
})
