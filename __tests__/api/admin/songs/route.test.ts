/**
 * @jest-environment node
 */

import { POST, GET } from "@/app/api/admin/songs/route"
import { NextRequest } from "next/server"
import jest from "jest"

// Mock the database
jest.mock("@/lib/db", () => ({
  query: jest.fn(),
}))

// Mock auth
jest.mock("@/lib/auth", () => ({
  verifyAdminToken: jest.fn().mockResolvedValue({ id: "1", username: "testadmin", role: "admin" }),
}))

const mockQuery = require("@/lib/db").query

describe("/api/admin/songs", () => {
  beforeEach(() => {
    mockQuery.mockClear()
  })

  describe("GET", () => {
    it("should return songs list", async () => {
      const mockSongs = [
        {
          id: "1",
          title: "Test Song",
          type: "ORIGINAL",
          talent_name: "Test Talent",
          talent_name_jp: "テストタレント",
          branch: "Test Branch",
        },
      ]

      mockQuery.mockResolvedValueOnce({ rows: mockSongs })

      const request = new NextRequest("http://localhost:3000/api/admin/songs", {
        headers: { authorization: "Bearer test-token" },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.songs).toHaveLength(1)
      expect(data.songs[0].title).toBe("Test Song")
    })

    it("should handle database errors", async () => {
      mockQuery.mockRejectedValueOnce(new Error("Database error"))

      const request = new NextRequest("http://localhost:3000/api/admin/songs", {
        headers: { authorization: "Bearer test-token" },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe("楽曲データの取得に失敗しました")
    })
  })

  describe("POST", () => {
    it("should create new song", async () => {
      const mockSongData = {
        title: "New Song",
        type: "ORIGINAL",
        talentIds: ["1"],
        tags: ["オリジナル曲", "テスト"],
      }

      mockQuery
        .mockResolvedValueOnce({ rows: [{ id: "new-song-id" }] }) // Insert song
        .mockResolvedValueOnce({ rows: [] }) // Insert song-talent relations

      const request = new NextRequest("http://localhost:3000/api/admin/songs", {
        method: "POST",
        headers: {
          authorization: "Bearer test-token",
          "content-type": "application/json",
        },
        body: JSON.stringify(mockSongData),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe("楽曲を追加しました")
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO songs"),
        expect.arrayContaining(["New Song", "ORIGINAL"]),
      )
    })

    it("should validate required fields", async () => {
      const request = new NextRequest("http://localhost:3000/api/admin/songs", {
        method: "POST",
        headers: {
          authorization: "Bearer test-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({ title: "" }), // Missing required fields
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("タイトルとタレントは必須です")
    })
  })
})
