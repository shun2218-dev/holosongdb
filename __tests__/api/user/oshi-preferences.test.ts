import { GET, POST } from "@/app/api/user/oshi-preferences/route"
import { sql } from "@/lib/db"
import { NextRequest } from "next/server"
import jest from "jest"

jest.mock("@/lib/db")

const mockSql = sql as jest.MockedFunction<typeof sql>

describe("/api/user/oshi-preferences", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("GET", () => {
    it("should return user oshi preferences", async () => {
      const mockPreferences = [
        {
          id: "pref-1",
          talentId: "talent-1",
          createdAt: new Date(),
          name: "Talent 1",
          nameJp: "タレント1",
          nameEn: "Talent One",
          branch: "JP",
          generation: "1期生",
          mainColor: "#FF0000",
        },
      ]

      mockSql.mockResolvedValue(mockPreferences as any)

      const request = new NextRequest("http://localhost:3000/api/user/oshi-preferences", {
        headers: {
          "x-user-id": "user-1",
        },
      })

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.preferences).toHaveLength(1)
      expect(data.preferences[0].talentId).toBe("talent-1")
    })

    it("should require user ID", async () => {
      const request = new NextRequest("http://localhost:3000/api/user/oshi-preferences")

      const response = await GET(request)
      expect(response.status).toBe(400)
    })
  })

  describe("POST", () => {
    it("should update user oshi preferences", async () => {
      mockSql.mockResolvedValue([{ id: "pref-1" }] as any)

      const request = new NextRequest("http://localhost:3000/api/user/oshi-preferences", {
        method: "POST",
        headers: {
          "x-user-id": "user-1",
        },
        body: JSON.stringify({
          talentIds: ["talent-1", "talent-2"],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.count).toBe(2)
    })

    it("should clear all preferences when empty array", async () => {
      mockSql.mockResolvedValue([{ id: "pref-1" }] as any)

      const request = new NextRequest("http://localhost:3000/api/user/oshi-preferences", {
        method: "POST",
        headers: {
          "x-user-id": "user-1",
        },
        body: JSON.stringify({
          talentIds: [],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.count).toBe(0)
    })

    it("should require user ID", async () => {
      const request = new NextRequest("http://localhost:3000/api/user/oshi-preferences", {
        method: "POST",
        body: JSON.stringify({
          talentIds: ["talent-1"],
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it("should validate talentIds is array", async () => {
      const request = new NextRequest("http://localhost:3000/api/user/oshi-preferences", {
        method: "POST",
        headers: {
          "x-user-id": "user-1",
        },
        body: JSON.stringify({
          talentIds: "not-an-array",
        }),
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })
})
