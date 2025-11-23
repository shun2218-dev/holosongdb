import { PUT, DELETE } from "@/app/api/admin/talents/[id]/route"
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

describe("/api/admin/talents/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("PUT", () => {
    it("should update JP talent with Japanese name as main name", async () => {
      mockVerifyAdminSession.mockResolvedValue({ id: "admin-1", username: "admin" })
      mockSql.mockResolvedValue([])

      const request = new NextRequest("http://localhost:3000/api/admin/talents/1", {
        method: "PUT",
        body: JSON.stringify({
          nameJp: "ときのそら（更新）",
          nameEn: "Tokino Sora",
          branch: "JP",
          generation: "0期生",
          active: true,
        }),
      })

      const response = await PUT(request, { params: Promise.resolve({ id: "1" }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockSql).toHaveBeenCalledWith(expect.arrayContaining([expect.stringContaining("UPDATE talents")]))
    })

    it("should update EN talent with English name as main name", async () => {
      mockVerifyAdminSession.mockResolvedValue({ id: "admin-1", username: "admin" })
      mockSql.mockResolvedValue([])

      const request = new NextRequest("http://localhost:3000/api/admin/talents/2", {
        method: "PUT",
        body: JSON.stringify({
          nameEn: "Gawr Gura (Updated)",
          branch: "EN",
          generation: "Myth",
          active: true,
        }),
      })

      const response = await PUT(request, { params: Promise.resolve({ id: "2" }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it("should return 401 for unauthenticated request", async () => {
      mockVerifyAdminSession.mockResolvedValue(null)

      const request = new NextRequest("http://localhost:3000/api/admin/talents/1", {
        method: "PUT",
        body: JSON.stringify({
          nameJp: "ときのそら",
          nameEn: "Tokino Sora",
          branch: "JP",
        }),
      })

      const response = await PUT(request, { params: Promise.resolve({ id: "1" }) })

      expect(response.status).toBe(401)
    })
  })

  describe("DELETE", () => {
    it("should delete talent for authenticated admin", async () => {
      mockVerifyAdminSession.mockResolvedValue({ id: "admin-1", username: "admin" })
      mockSql.mockResolvedValue([])

      const request = new NextRequest("http://localhost:3000/api/admin/talents/1", {
        method: "DELETE",
      })

      const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockSql).toHaveBeenCalledWith(expect.arrayContaining([expect.stringContaining("DELETE FROM talents")]))
    })

    it("should return 401 for unauthenticated request", async () => {
      mockVerifyAdminSession.mockResolvedValue(null)

      const request = new NextRequest("http://localhost:3000/api/admin/talents/1", {
        method: "DELETE",
      })

      const response = await DELETE(request, { params: Promise.resolve({ id: "1" }) })

      expect(response.status).toBe(401)
    })
  })
})
