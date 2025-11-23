import { GET } from "@/app/api/admin/analytics/route"
import { neon } from "@neondatabase/serverless"
import jest from "jest" // Declare the jest variable

jest.mock("@neondatabase/serverless")

describe("/api/admin/analytics", () => {
  const mockSql = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(neon as jest.Mock).mockReturnValue(mockSql)
  })

  describe("GET", () => {
    it("should return analytics data successfully", async () => {
      const mockAnalytics = {
        totalSongs: 150,
        totalTalents: 25,
        totalViews: 1000000,
        averageViewsPerSong: 6666,
      }

      mockSql.mockResolvedValueOnce([mockAnalytics])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockAnalytics)
      expect(mockSql).toHaveBeenCalledTimes(1)
    })

    it("should handle database errors", async () => {
      mockSql.mockRejectedValueOnce(new Error("Database error"))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe("Failed to fetch analytics")
    })

    it("should return zero values when no data exists", async () => {
      mockSql.mockResolvedValueOnce([
        {
          totalSongs: 0,
          totalTalents: 0,
          totalViews: 0,
          averageViewsPerSong: 0,
        },
      ])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalSongs).toBe(0)
      expect(data.totalTalents).toBe(0)
    })
  })
})
