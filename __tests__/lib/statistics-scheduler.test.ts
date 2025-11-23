/**
 * @jest-environment node
 */

import { updateAllStatistics, scheduleStatisticsUpdate } from "@/lib/statistics-scheduler"
import jest from "jest"

// Mock dependencies
jest.mock("@/lib/db", () => ({
  query: jest.fn(),
}))

jest.mock("@/lib/youtube-api", () => ({
  getVideoDetails: jest.fn(),
  searchVideos: jest.fn(),
}))

const mockQuery = require("@/lib/db").query
const mockGetVideoDetails = require("@/lib/youtube-api").getVideoDetails

describe("Statistics Scheduler", () => {
  beforeEach(() => {
    mockQuery.mockClear()
    mockGetVideoDetails.mockClear()
  })

  describe("updateAllStatistics", () => {
    it("should update statistics for all songs", async () => {
      const mockSongs = [
        {
          id: "1",
          video_id: "test123",
          title: "Test Song",
        },
      ]

      const mockVideoDetails = {
        statistics: {
          viewCount: "2000000",
          likeCount: "100000",
          commentCount: "5000",
        },
      }

      mockQuery.mockResolvedValueOnce({ rows: mockSongs })
      mockGetVideoDetails.mockResolvedValueOnce(mockVideoDetails)
      mockQuery.mockResolvedValueOnce({ rows: [] }) // Update query

      const result = await updateAllStatistics()

      expect(result.updated).toBe(1)
      expect(result.errors).toBe(0)
      expect(mockGetVideoDetails).toHaveBeenCalledWith("test123")
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE songs SET"),
        expect.arrayContaining(["2000000", "100000", "5000", "1"]),
      )
    })

    it("should handle API errors gracefully", async () => {
      const mockSongs = [
        {
          id: "1",
          video_id: "test123",
          title: "Test Song",
        },
      ]

      mockQuery.mockResolvedValueOnce({ rows: mockSongs })
      mockGetVideoDetails.mockRejectedValueOnce(new Error("API Error"))

      const result = await updateAllStatistics()

      expect(result.updated).toBe(0)
      expect(result.errors).toBe(1)
    })

    it("should skip songs without video_id", async () => {
      const mockSongs = [
        {
          id: "1",
          video_id: null,
          title: "Test Song",
        },
      ]

      mockQuery.mockResolvedValueOnce({ rows: mockSongs })

      const result = await updateAllStatistics()

      expect(result.updated).toBe(0)
      expect(result.errors).toBe(0)
      expect(mockGetVideoDetails).not.toHaveBeenCalled()
    })
  })

  describe("scheduleStatisticsUpdate", () => {
    it("should schedule statistics update", async () => {
      const mockSchedule = jest.fn()

      // Mock node-cron
      jest.doMock("node-cron", () => ({
        schedule: mockSchedule,
      }))

      await scheduleStatisticsUpdate()

      expect(mockSchedule).toHaveBeenCalledWith(
        "0 */6 * * *", // Every 6 hours
        expect.any(Function),
      )
    })
  })
})
