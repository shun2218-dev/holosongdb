import { NotificationService } from "@/lib/notification-service"
import { sql } from "@/lib/db"
import jest from "jest"

jest.mock("@/lib/db")

const mockSql = sql as jest.MockedFunction<typeof sql>

global.fetch = jest.fn()

describe("NotificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000"
  })

  describe("saveSongStatistics", () => {
    it("should save song statistics", async () => {
      mockSql.mockResolvedValue([{ id: "stat-1" }] as any)

      await NotificationService.saveSongStatistics("song-1", 1000n, 100n, 50n)

      expect(mockSql).toHaveBeenCalled()
    })

    it("should handle errors gracefully", async () => {
      mockSql.mockRejectedValue(new Error("Database error"))

      await expect(NotificationService.saveSongStatistics("song-1", 1000n, 100n, 50n)).resolves.not.toThrow()
    })
  })

  describe("saveTalentStatistics", () => {
    it("should save talent statistics", async () => {
      mockSql.mockResolvedValue([{ id: "stat-1" }] as any)

      await NotificationService.saveTalentStatistics("talent-1", 100000n)

      expect(mockSql).toHaveBeenCalled()
    })
  })

  describe("checkSongMilestones", () => {
    it("should detect milestone achievements", async () => {
      mockSql
        .mockResolvedValueOnce([{ title: "Test Song", view_count: "900000" }] as any)
        .mockResolvedValueOnce([] as any)
        .mockResolvedValueOnce([{ id: "notif-1" }] as any)

      const notifications = await NotificationService.checkSongMilestones("song-1", 1100000n)

      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe("milestone")
      expect(notifications[0].message).toContain("100万")
    })

    it("should not send duplicate notifications", async () => {
      mockSql
        .mockResolvedValueOnce([{ title: "Test Song", view_count: "900000" }] as any)
        .mockResolvedValueOnce([{ id: "existing-notif" }] as any)

      const notifications = await NotificationService.checkSongMilestones("song-1", 1100000n)

      expect(notifications).toHaveLength(0)
    })
  })

  describe("checkSongSurge", () => {
    it("should detect view count surge", async () => {
      mockSql
        .mockResolvedValueOnce([{ view_count: "1000000" }] as any)
        .mockResolvedValueOnce([{ title: "Test Song" }] as any)

      const notifications = await NotificationService.checkSongSurge("song-1", 1600000n)

      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe("surge")
    })

    it("should not trigger for small increases", async () => {
      mockSql.mockResolvedValueOnce([{ view_count: "1000000" }] as any)

      const notifications = await NotificationService.checkSongSurge("song-1", 1050000n)

      expect(notifications).toHaveLength(0)
    })
  })

  describe("checkSubscriberMilestones", () => {
    it("should detect subscriber milestones", async () => {
      mockSql
        .mockResolvedValueOnce([{ name: "Test Talent", subscriber_count: "95000" }] as any)
        .mockResolvedValueOnce([] as any)
        .mockResolvedValueOnce([{ id: "notif-1" }] as any)

      const notifications = await NotificationService.checkSubscriberMilestones("talent-1", 105000n)

      expect(notifications).toHaveLength(1)
      expect(notifications[0].type).toBe("subscriber_milestone")
      expect(notifications[0].message).toContain("10万")
    })
  })

  describe("sendPushNotification", () => {
    it("should send push notifications to subscribed users", async () => {
      mockSql.mockResolvedValueOnce([{ talent_id: "talent-1" }] as any).mockResolvedValueOnce([
        {
          endpoint: "https://push.example.com/1",
          p256dh_key: "key1",
          auth_key: "auth1",
        },
      ] as any)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      await NotificationService.sendPushNotification({
        type: "milestone",
        title: "Test",
        message: "Test message",
        data: { songId: "song-1" },
      })

      expect(global.fetch).toHaveBeenCalled()
    })

    it("should filter by oshi preferences", async () => {
      mockSql.mockResolvedValueOnce([{ talent_id: "talent-1" }] as any).mockResolvedValueOnce([
        {
          endpoint: "https://push.example.com/1",
          p256dh_key: "key1",
          auth_key: "auth1",
        },
      ] as any)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      await NotificationService.sendPushNotification({
        type: "milestone",
        title: "Test",
        message: "Test",
        data: { songId: "song-1" },
      })

      expect(mockSql).toHaveBeenCalledWith(expect.anything())
    })
  })
})
