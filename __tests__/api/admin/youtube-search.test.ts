import { GET } from "@/app/api/admin/youtube/search/route"
import { verifyAdminSession } from "@/lib/auth"
import { createYouTubeAPI } from "@/lib/youtube-api"
import { NextRequest } from "next/server"
import jest from "jest"

jest.mock("@/lib/auth")
jest.mock("@/lib/youtube-api")
jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      get: jest.fn((name: string) => ({ value: "test-session-token" })),
    }),
  ),
}))

const mockVerifyAdminSession = verifyAdminSession as jest.MockedFunction<typeof verifyAdminSession>
const mockCreateYouTubeAPI = createYouTubeAPI as jest.MockedFunction<typeof createYouTubeAPI>

describe("/api/admin/youtube/search", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should search YouTube videos", async () => {
    mockVerifyAdminSession.mockResolvedValue({
      id: "admin-1",
      username: "admin",
      email: "admin@test.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const mockResults = [
      {
        id: { videoId: "video-1" },
        snippet: {
          title: "Test Video",
          description: "Test Description",
          channelTitle: "Test Channel",
          publishedAt: "2024-01-01T00:00:00Z",
          thumbnails: {
            medium: { url: "https://example.com/thumb.jpg" },
          },
        },
      },
    ]

    const mockYouTubeAPI = {
      searchVideos: jest.fn().mockResolvedValue(mockResults),
    }
    mockCreateYouTubeAPI.mockReturnValue(mockYouTubeAPI as any)

    const request = new NextRequest("http://localhost:3000/api/admin/youtube/search?q=test")

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.results).toHaveLength(1)
    expect(data.results[0].videoId).toBe("video-1")
    expect(data.results[0].title).toBe("Test Video")
    expect(mockYouTubeAPI.searchVideos).toHaveBeenCalledWith("test", undefined, 10)
  })

  it("should search with channel filter", async () => {
    mockVerifyAdminSession.mockResolvedValue({
      id: "admin-1",
      username: "admin",
      email: "admin@test.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const mockYouTubeAPI = {
      searchVideos: jest.fn().mockResolvedValue([]),
    }
    mockCreateYouTubeAPI.mockReturnValue(mockYouTubeAPI as any)

    const request = new NextRequest("http://localhost:3000/api/admin/youtube/search?q=test&channelId=UC123")

    await GET(request)

    expect(mockYouTubeAPI.searchVideos).toHaveBeenCalledWith("test", "UC123", 10)
  })

  it("should require query parameter", async () => {
    mockVerifyAdminSession.mockResolvedValue({
      id: "admin-1",
      username: "admin",
      email: "admin@test.com",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new NextRequest("http://localhost:3000/api/admin/youtube/search")

    const response = await GET(request)
    expect(response.status).toBe(400)
  })

  it("should require authentication", async () => {
    mockVerifyAdminSession.mockResolvedValue(null)

    const request = new NextRequest("http://localhost:3000/api/admin/youtube/search?q=test")

    const response = await GET(request)
    expect(response.status).toBe(401)
  })
})
