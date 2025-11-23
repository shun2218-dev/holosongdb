import { GET, POST } from "@/app/api/admin/update-subscriber-counts/route"
import { verifyAdminSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { createYouTubeAPI } from "@/lib/youtube-api"
import { NotificationService } from "@/lib/notification-service"
import { NextRequest } from "next/server"
import jest from "jest"

jest.mock("@/lib/auth")
jest.mock("@/lib/db")
jest.mock("@/lib/youtube-api")
jest.mock("@/lib/notification-service")
jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      get: jest.fn((name: string) => ({ value: "test-session-token" })),
    }),
  ),
}))

const mockVerifyAdminSession = verifyAdminSession as jest.MockedFunction<typeof verifyAdminSession>
const mockSql = sql as jest.MockedFunction<typeof sql>
const mockCreateYouTubeAPI = createYouTubeAPI as jest.MockedFunction<typeof createYouTubeAPI>

describe("/api/admin/update-subscriber-counts", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("GET (Cron Job)", () => {
    it("should accept cron job with valid secret", async () => {
      const request = new NextRequest("http://localhost:3000/api/admin/update-subscriber-counts", {
        headers: {
          "x-vercel-cron-signature": "test-secret",
        },
      })

      process.env.CRON_SECRET = "test-secret"
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ updated: 5 }),
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain("Cron job completed")
    })

    it("should reject cron job with invalid secret", async () => {
      const request = new NextRequest("http://localhost:3000/api/admin/update-subscriber-counts", {
        headers: {
          "x-vercel-cron-signature": "wrong-secret",
        },
      })

      process.env.CRON_SECRET = "test-secret"

      const response = await GET(request)
      expect(response.status).toBe(401)
    })
  })

  describe("POST", () => {
    it("should update subscriber counts for all talents", async () => {
      mockVerifyAdminSession.mockResolvedValue({
        id: "admin-1",
        username: "admin",
        email: "admin@test.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const mockTalents = [
        { id: "talent-1", name: "Talent 1", channel_id: "UC123", subscriber_count: "100000" },
        { id: "talent-2", name: "Talent 2", channel_id: "UC456", subscriber_count: "200000" },
      ]

      mockSql.mockResolvedValueOnce(mockTalents as any)

      const mockYouTubeAPI = {
        getChannelStatisticsInChunks: jest.fn().mockResolvedValue(
          new Map([
            ["UC123", { subscriberCount: "150000" }],
            ["UC456", { subscriberCount: "250000" }],
          ]),
        ),
      }
      mockCreateYouTubeAPI.mockReturnValue(mockYouTubeAPI as any)

      jest.spyOn(NotificationService, "saveTalentStatistics").mockResolvedValue(undefined)
      jest.spyOn(NotificationService, "checkSubscriberMilestones").mockResolvedValue([])
      jest.spyOn(NotificationService, "sendPushNotification").mockResolvedValue(undefined)

      mockSql.mockResolvedValue([{ id: "log-1" }] as any)

      const request = new NextRequest("http://localhost:3000/api/admin/update-subscriber-counts", {
        method: "POST",
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.updated).toBe(2)
      expect(mockYouTubeAPI.getChannelStatisticsInChunks).toHaveBeenCalledWith(["UC123", "UC456"], 50)
    })

    it("should handle YouTube API errors", async () => {
      mockVerifyAdminSession.mockResolvedValue({
        id: "admin-1",
        username: "admin",
        email: "admin@test.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockSql.mockResolvedValueOnce([
        { id: "talent-1", name: "Talent 1", channel_id: "UC123", subscriber_count: "100000" },
      ] as any)

      const mockYouTubeAPI = {
        getChannelStatisticsInChunks: jest.fn().mockRejectedValue(new Error("403 Forbidden")),
      }
      mockCreateYouTubeAPI.mockReturnValue(mockYouTubeAPI as any)

      mockSql.mockResolvedValue([{ id: "log-1" }] as any)

      const request = new NextRequest("http://localhost:3000/api/admin/update-subscriber-counts", {
        method: "POST",
      })

      const response = await POST(request)
      expect(response.status).toBe(403)
    })

    it("should send milestone notifications", async () => {
      mockVerifyAdminSession.mockResolvedValue({
        id: "admin-1",
        username: "admin",
        email: "admin@test.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockSql.mockResolvedValueOnce([
        { id: "talent-1", name: "Talent 1", channel_id: "UC123", subscriber_count: "99000" },
      ] as any)

      const mockYouTubeAPI = {
        getChannelStatisticsInChunks: jest.fn().mockResolvedValue(new Map([["UC123", { subscriberCount: "101000" }]])),
      }
      mockCreateYouTubeAPI.mockReturnValue(mockYouTubeAPI as any)

      const mockNotification = {
        type: "subscriber_milestone" as const,
        title: "登録者数の節目達成！",
        message: "Talent 1が10万登録者を達成しました！",
      }

      jest.spyOn(NotificationService, "saveTalentStatistics").mockResolvedValue(undefined)
      jest.spyOn(NotificationService, "checkSubscriberMilestones").mockResolvedValue([mockNotification])
      jest.spyOn(NotificationService, "sendPushNotification").mockResolvedValue(undefined)

      mockSql.mockResolvedValue([{ id: "log-1" }] as any)

      const request = new NextRequest("http://localhost:3000/api/admin/update-subscriber-counts", {
        method: "POST",
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.notifications).toBe(1)
      expect(NotificationService.sendPushNotification).toHaveBeenCalledWith(mockNotification)
    })

    it("should require authentication for manual updates", async () => {
      mockVerifyAdminSession.mockResolvedValue(null)

      const request = new NextRequest("http://localhost:3000/api/admin/update-subscriber-counts", {
        method: "POST",
      })

      const response = await POST(request)
      expect(response.status).toBe(401)
    })
  })
})
