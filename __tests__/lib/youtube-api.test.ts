import { YouTubeAPI } from "@/lib/youtube-api"
import type { jest } from "@jest/globals"

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe("YouTubeAPI", () => {
  let youtubeAPI: YouTubeAPI

  beforeEach(() => {
    youtubeAPI = new YouTubeAPI("test-api-key")
    mockFetch.mockClear()
  })

  describe("extractVideoId", () => {
    it("should extract video ID from standard YouTube URL", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      const result = youtubeAPI.extractVideoId(url)
      expect(result).toBe("dQw4w9WgXcQ")
    })

    it("should extract video ID from short YouTube URL", () => {
      const url = "https://youtu.be/dQw4w9WgXcQ"
      const result = youtubeAPI.extractVideoId(url)
      expect(result).toBe("dQw4w9WgXcQ")
    })

    it("should extract video ID from embed URL", () => {
      const url = "https://www.youtube.com/embed/dQw4w9WgXcQ"
      const result = youtubeAPI.extractVideoId(url)
      expect(result).toBe("dQw4w9WgXcQ")
    })

    it("should return null for invalid URL", () => {
      const url = "https://example.com/invalid"
      const result = youtubeAPI.extractVideoId(url)
      expect(result).toBeNull()
    })

    it("should handle URL with additional parameters", () => {
      const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s"
      const result = youtubeAPI.extractVideoId(url)
      expect(result).toBe("dQw4w9WgXcQ")
    })
  })

  describe("extractChannelId", () => {
    it("should extract channel ID from channel URL", () => {
      const url = "https://www.youtube.com/channel/UCDqI2jOz0weumE8s7paEk6g"
      const result = youtubeAPI.extractChannelId(url)
      expect(result).toBe("UCDqI2jOz0weumE8s7paEk6g")
    })

    it("should extract channel ID from custom URL", () => {
      const url = "https://www.youtube.com/c/HololiveOfficial"
      const result = youtubeAPI.extractChannelId(url)
      expect(result).toBe("HololiveOfficial")
    })

    it("should extract channel ID from @ handle URL", () => {
      const url = "https://www.youtube.com/@HololiveOfficial"
      const result = youtubeAPI.extractChannelId(url)
      expect(result).toBe("HololiveOfficial")
    })

    it("should return null for invalid URL", () => {
      const url = "https://example.com/invalid"
      const result = youtubeAPI.extractChannelId(url)
      expect(result).toBeNull()
    })
  })

  describe("searchVideos", () => {
    it("should search videos successfully", async () => {
      const mockResponse = {
        items: [
          {
            id: { kind: "youtube#video", videoId: "test123" },
            snippet: {
              title: "Test Video",
              description: "Test Description",
              channelTitle: "Test Channel",
              publishedAt: "2025-01-01T00:00:00Z",
              thumbnails: {
                default: { url: "https://example.com/thumb.jpg" },
                medium: { url: "https://example.com/thumb.jpg" },
                high: { url: "https://example.com/thumb.jpg" },
              },
            },
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await youtubeAPI.searchVideos("test query")

      expect(result).toHaveLength(1)
      expect(result[0].snippet.title).toBe("Test Video")
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("search"))
    })

    it("should handle API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: async () => '{"error": {"message": "API key invalid"}}',
      } as Response)

      await expect(youtubeAPI.searchVideos("test query")).rejects.toThrow(
        "YouTube Search API error: 403 Forbidden - API key invalid",
      )
    })

    it("should search with channel ID restriction", async () => {
      const mockResponse = { items: [] }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      await youtubeAPI.searchVideos("test query", "UCtest123")

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("channelId=UCtest123"))
    })
  })

  describe("getVideoDetails", () => {
    it("should get video details successfully", async () => {
      const mockResponse = {
        items: [
          {
            id: "test123",
            snippet: {
              title: "Test Video",
              description: "Test Description",
              channelTitle: "Test Channel",
              publishedAt: "2025-01-01T00:00:00Z",
              thumbnails: {
                default: { url: "https://example.com/thumb.jpg" },
                medium: { url: "https://example.com/thumb.jpg" },
                high: { url: "https://example.com/thumb.jpg" },
              },
            },
            statistics: {
              viewCount: "1000",
              likeCount: "100",
              commentCount: "10",
            },
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await youtubeAPI.getVideoDetails("test123")

      expect(result).not.toBeNull()
      expect(result!.id).toBe("test123")
      expect(result!.statistics.viewCount).toBe("1000")
    })

    it("should return null when video not found", async () => {
      const mockResponse = { items: [] }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await youtubeAPI.getVideoDetails("nonexistent")
      expect(result).toBeNull()
    })
  })

  describe("getVideoStatistics", () => {
    it("should get statistics for multiple videos", async () => {
      const mockResponse = {
        items: [
          {
            id: "video1",
            statistics: { viewCount: "1000", likeCount: "100", commentCount: "10" },
          },
          {
            id: "video2",
            statistics: { viewCount: "2000", likeCount: "200", commentCount: "20" },
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await youtubeAPI.getVideoStatistics(["video1", "video2"])

      expect(result.size).toBe(2)
      expect(result.get("video1")?.viewCount).toBe("1000")
      expect(result.get("video2")?.viewCount).toBe("2000")
    })

    it("should return empty map for empty input", async () => {
      const result = await youtubeAPI.getVideoStatistics([])
      expect(result.size).toBe(0)
    })
  })

  describe("getChannelStatistics", () => {
    it("should get statistics for multiple channels", async () => {
      const mockResponse = {
        items: [
          {
            id: "channel1",
            statistics: { subscriberCount: "1000000", viewCount: "50000000", videoCount: "500" },
          },
          {
            id: "channel2",
            statistics: { subscriberCount: "2000000", viewCount: "100000000", videoCount: "1000" },
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response)

      const result = await youtubeAPI.getChannelStatistics(["channel1", "channel2"])

      expect(result.size).toBe(2)
      expect(result.get("channel1")?.subscriberCount).toBe("1000000")
      expect(result.get("channel2")?.subscriberCount).toBe("2000000")
    })

    it("should return empty map for empty input", async () => {
      const result = await youtubeAPI.getChannelStatistics([])
      expect(result.size).toBe(0)
    })

    it("should handle API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        text: async () => '{"error": {"message": "Quota exceeded"}}',
      } as Response)

      await expect(youtubeAPI.getChannelStatistics(["channel1"])).rejects.toThrow(
        "YouTube API error: 403 Forbidden - Quota exceeded",
      )
    })
  })

  describe("getVideoStatisticsInChunks", () => {
    it("should process videos in chunks", async () => {
      const videoIds = Array.from({ length: 120 }, (_, i) => `video${i}`)

      mockFetch.mockImplementation(async (url) => {
        const urlStr = url.toString()
        const ids = new URL(urlStr).searchParams.get("id")?.split(",") || []

        return {
          ok: true,
          json: async () => ({
            items: ids.map((id) => ({
              id,
              statistics: { viewCount: "1000", likeCount: "100", commentCount: "10" },
            })),
          }),
        } as Response
      })

      const result = await youtubeAPI.getVideoStatisticsInChunks(videoIds, 50)

      expect(result.size).toBe(120)
      expect(mockFetch).toHaveBeenCalledTimes(3) // 120 videos / 50 per chunk = 3 calls
    })

    it("should handle single chunk", async () => {
      const videoIds = ["video1", "video2"]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          items: [
            { id: "video1", statistics: { viewCount: "1000", likeCount: "100", commentCount: "10" } },
            { id: "video2", statistics: { viewCount: "2000", likeCount: "200", commentCount: "20" } },
          ],
        }),
      } as Response)

      const result = await youtubeAPI.getVideoStatisticsInChunks(videoIds, 50)

      expect(result.size).toBe(2)
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe("getChannelStatisticsInChunks", () => {
    it("should process channels in chunks", async () => {
      const channelIds = Array.from({ length: 120 }, (_, i) => `channel${i}`)

      mockFetch.mockImplementation(async (url) => {
        const urlStr = url.toString()
        const ids = new URL(urlStr).searchParams.get("id")?.split(",") || []

        return {
          ok: true,
          json: async () => ({
            items: ids.map((id) => ({
              id,
              statistics: { subscriberCount: "1000000", viewCount: "50000000", videoCount: "500" },
            })),
          }),
        } as Response
      })

      const result = await youtubeAPI.getChannelStatisticsInChunks(channelIds, 50)

      expect(result.size).toBe(120)
      expect(mockFetch).toHaveBeenCalledTimes(3) // 120 channels / 50 per chunk = 3 calls
    })

    it("should handle errors in chunks", async () => {
      const channelIds = Array.from({ length: 60 }, (_, i) => `channel${i}`)

      mockFetch.mockRejectedValue(new Error("Network error"))

      await expect(youtubeAPI.getChannelStatisticsInChunks(channelIds, 50)).rejects.toThrow("Network error")
    })
  })
})
