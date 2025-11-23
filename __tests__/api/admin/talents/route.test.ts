import { POST, GET } from "@/app/api/admin/talents/route"
import { verifyAdminSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { NextRequest } from "next/server"
import jest from "jest"

jest.mock("@/lib/auth")
jest.mock("@/lib/db")
jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      get: jest.fn((name: string) => ({ value: "mock-session-token" })),
    }),
  ),
}))

const mockVerifyAdminSession = verifyAdminSession as jest.MockedFunction<typeof verifyAdminSession>
const mockSql = sql as jest.MockedFunction<typeof sql>

describe("/api/admin/talents", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("GET", () => {
    it("should return talents list for authenticated admin", async () => {
      mockVerifyAdminSession.mockResolvedValue({ id: "admin-1", username: "admin" })
      mockSql.mockResolvedValue([
        {
          id: "1",
          name: "ときのそら",
          name_jp: "ときのそら",
          name_en: "Tokino Sora",
          branch: "JP",
          generation: "0期生",
          debut: "2017-09-07",
          active: true,
          channel_id: "UCp6993wxpyDPHUpavwDFqgg",
          subscriber_count: "1000000",
          main_color: "#4ECDC4",
          image_url: "/tokino-sora.jpg",
          blur_data_url: "data:image/jpeg;base64,/9j/4AAQ...",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ])

      const request = new NextRequest("http://localhost:3000/api/admin/talents")
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.talents).toHaveLength(1)
      expect(data.talents[0].name).toBe("ときのそら")
    })

    it("should return 401 for unauthenticated request", async () => {
      mockVerifyAdminSession.mockResolvedValue(null)

      const request = new NextRequest("http://localhost:3000/api/admin/talents")
      const response = await GET(request)

      expect(response.status).toBe(401)
    })
  })

  describe("POST", () => {
    it("should create JP talent with Japanese name as main name", async () => {
      mockVerifyAdminSession.mockResolvedValue({ id: "admin-1", username: "admin" })
      mockSql.mockResolvedValue([])

      const request = new NextRequest("http://localhost:3000/api/admin/talents", {
        method: "POST",
        body: JSON.stringify({
          nameJp: "ときのそら",
          nameEn: "Tokino Sora",
          branch: "JP",
          generation: "0期生",
          debut: "2017-09-07",
          active: true,
          channelId: "UCp6993wxpyDPHUpavwDFqgg",
          mainColor: "#4ECDC4",
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockSql).toHaveBeenCalledWith(expect.arrayContaining([expect.stringContaining("INSERT INTO talents")]))
      // Verify that name is set to nameJp for JP branch
      const sqlCall = mockSql.mock.calls[0]
      expect(sqlCall[1]).toBe("ときのそら") // name should be Japanese
    })

    it("should create EN talent with English name as main name", async () => {
      mockVerifyAdminSession.mockResolvedValue({ id: "admin-1", username: "admin" })
      mockSql.mockResolvedValue([])

      const request = new NextRequest("http://localhost:3000/api/admin/talents", {
        method: "POST",
        body: JSON.stringify({
          nameEn: "Gawr Gura",
          branch: "EN",
          generation: "Myth",
          debut: "2020-09-13",
          active: true,
          channelId: "UCoSrY_IQQVpmIRZ9Xf-y93g",
          mainColor: "#3D7DCA",
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      // Verify that name is set to nameEn for EN branch
      const sqlCall = mockSql.mock.calls[0]
      expect(sqlCall[1]).toBe("Gawr Gura") // name should be English
    })

    it("should return 400 if nameJp is missing for JP branch", async () => {
      mockVerifyAdminSession.mockResolvedValue({ id: "admin-1", username: "admin" })

      const request = new NextRequest("http://localhost:3000/api/admin/talents", {
        method: "POST",
        body: JSON.stringify({
          nameEn: "Tokino Sora",
          branch: "JP",
          generation: "0期生",
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("日本語名は必須です")
    })

    it("should return 400 if nameEn is missing", async () => {
      mockVerifyAdminSession.mockResolvedValue({ id: "admin-1", username: "admin" })

      const request = new NextRequest("http://localhost:3000/api/admin/talents", {
        method: "POST",
        body: JSON.stringify({
          nameJp: "ときのそら",
          branch: "JP",
          generation: "0期生",
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe("英語名は必須です")
    })

    it("should return 401 for unauthenticated request", async () => {
      mockVerifyAdminSession.mockResolvedValue(null)

      const request = new NextRequest("http://localhost:3000/api/admin/talents", {
        method: "POST",
        body: JSON.stringify({
          nameJp: "ときのそら",
          nameEn: "Tokino Sora",
          branch: "JP",
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(401)
    })
  })
})
