import { GET } from "@/app/api/songs/search/route"
import { neon } from "@neondatabase/serverless"
import { NextRequest } from "next/server"
import jest from "jest" // Declaring the jest variable

jest.mock("@neondatabase/serverless")

describe("/api/songs/search", () => {
  const mockSql = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(neon as jest.Mock).mockReturnValue(mockSql)
  })

  describe("GET", () => {
    it("should search songs by title", async () => {
      const mockSongs = [
        {
          id: 1,
          title: "Test Song",
          youtube_url: "https://youtube.com/watch?v=test",
          release_date: "2024-01-01",
          view_count: 1000,
        },
      ]

      mockSql.mockResolvedValueOnce(mockSongs)

      const request = new NextRequest("http://localhost:3000/api/songs/search?q=Test")
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockSongs)
      expect(mockSql).toHaveBeenCalledWith(expect.stringContaining("%Test%"), expect.any(Number), expect.any(Number))
    })

    it("should filter by talent", async () => {
      const mockSongs = [
        {
          id: 1,
          title: "Talent Song",
          youtube_url: "https://youtube.com/watch?v=test",
          release_date: "2024-01-01",
          view_count: 1000,
        },
      ]

      mockSql.mockResolvedValueOnce(mockSongs)

      const request = new NextRequest("http://localhost:3000/api/songs/search?talent=1")
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockSongs)
    })

    it("should filter by branch", async () => {
      const mockSongs = [
        {
          id: 1,
          title: "JP Song",
          youtube_url: "https://youtube.com/watch?v=test",
          release_date: "2024-01-01",
          view_count: 1000,
        },
      ]

      mockSql.mockResolvedValueOnce(mockSongs)

      const request = new NextRequest("http://localhost:3000/api/songs/search?branch=JP")
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockSongs)
    })

    it("should handle pagination", async () => {
      mockSql.mockResolvedValueOnce([])

      const request = new NextRequest("http://localhost:3000/api/songs/search?page=2&limit=20")
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockSql).toHaveBeenCalledWith(
        expect.any(String),
        20, // limit
        20, // offset (page 2 * limit 20)
      )
    })

    it("should return empty array when no results", async () => {
      mockSql.mockResolvedValueOnce([])

      const request = new NextRequest("http://localhost:3000/api/songs/search?q=NonexistentSong")
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })

    it("should handle database errors", async () => {
      mockSql.mockRejectedValueOnce(new Error("Database error"))

      const request = new NextRequest("http://localhost:3000/api/songs/search?q=Test")
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe("Failed to search songs")
    })
  })
})
