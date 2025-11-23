import { GET } from "@/app/api/admin/oshi-stats/route"
import { sql } from "@/lib/db"
import jest from "jest"

jest.mock("@/lib/db")

const mockSql = sql as jest.MockedFunction<typeof sql>

describe("/api/admin/oshi-stats", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should return oshi statistics", async () => {
    mockSql
      .mockResolvedValueOnce([{ count: "10" }] as any)
      .mockResolvedValueOnce([{ count: "25" }] as any)
      .mockResolvedValueOnce([
        {
          id: "talent-1",
          name: "Talent 1",
          name_jp: "タレント1",
          name_en: "Talent One",
          branch: "JP",
          main_color: "#FF0000",
          preference_count: "15",
        },
      ] as any)
      .mockResolvedValueOnce([{ branch: "JP", preference_count: "20" }] as any)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.stats.totalUsers).toBe(10)
    expect(data.stats.totalPreferences).toBe(25)
    expect(data.stats.avgOshiPerUser).toBe("2.5")
    expect(data.stats.popularOshi).toHaveLength(1)
    expect(data.stats.branchStats).toHaveLength(1)
  })

  it("should handle zero users", async () => {
    mockSql
      .mockResolvedValueOnce([{ count: "0" }] as any)
      .mockResolvedValueOnce([{ count: "0" }] as any)
      .mockResolvedValueOnce([] as any)
      .mockResolvedValueOnce([] as any)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.stats.avgOshiPerUser).toBe("0")
  })

  it("should handle database errors", async () => {
    mockSql.mockRejectedValue(new Error("Database error"))

    const response = await GET()
    expect(response.status).toBe(500)
  })
})
