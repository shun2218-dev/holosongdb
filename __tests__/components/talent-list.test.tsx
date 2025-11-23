import { render, screen, waitFor } from "@testing-library/react"
import { TalentList } from "@/components/talent-list"
import jest from "jest"

global.fetch = jest.fn()

describe("TalentList", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render loading state", () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

    render(<TalentList />)
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("should render talents grouped by branch and generation", async () => {
    const mockTalents = [
      {
        id: "talent-1",
        name: "Talent 1",
        nameJp: "タレント1",
        nameEn: "Talent One",
        branch: "JP",
        generation: "1期生",
        active: true,
        mainColor: "#FF0000",
        subscriberCount: "1000000",
        image_url: null,
        blur_data_url: null,
        generation_display_order: 1,
      },
      {
        id: "talent-2",
        name: "Talent 2",
        nameJp: "タレント2",
        nameEn: "Talent Two",
        branch: "EN",
        generation: "Myth",
        active: true,
        mainColor: "#00FF00",
        subscriberCount: "2000000",
        image_url: null,
        blur_data_url: null,
        generation_display_order: 1,
      },
    ]
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ talents: mockTalents }),
    })

    render(<TalentList />)

    await waitFor(() => {
      expect(screen.getByText("タレント1")).toBeInTheDocument()
      expect(screen.getByText("タレント2")).toBeInTheDocument()
    })

    expect(screen.getByText("ホロライブJP")).toBeInTheDocument()
    expect(screen.getByText("ホロライブEN")).toBeInTheDocument()
    expect(screen.getByText("1期生")).toBeInTheDocument()
    expect(screen.getByText("Myth")).toBeInTheDocument()
  })

  it("should format subscriber counts", async () => {
    const mockTalents = [
      {
        id: "talent-1",
        name: "Talent 1",
        nameJp: "タレント1",
        nameEn: null,
        branch: "JP",
        generation: "1期生",
        active: true,
        mainColor: "#FF0000",
        subscriberCount: "1500000",
        image_url: null,
        blur_data_url: null,
        generation_display_order: 1,
      },
    ]
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ talents: mockTalents }),
    })

    render(<TalentList />)

    await waitFor(() => {
      expect(screen.getByText("1.5M 登録者")).toBeInTheDocument()
    })
  })

  it("should handle fetch errors", async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"))

    render(<TalentList />)

    await waitFor(() => {
      expect(screen.getByText("データの取得に失敗しました")).toBeInTheDocument()
    })
  })

  it("should handle multiple generations per talent", async () => {
    const mockTalents = [
      {
        id: "talent-1",
        name: "Talent 1",
        nameJp: "タレント1",
        nameEn: null,
        branch: "JP",
        generation: "1期生, ゲーマーズ",
        active: true,
        mainColor: "#FF0000",
        subscriberCount: "1000000",
        image_url: null,
        blur_data_url: null,
        generation_display_order: 1,
      },
    ]
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ talents: mockTalents }),
    })

    render(<TalentList />)

    await waitFor(() => {
      expect(screen.getByText("1期生")).toBeInTheDocument()
      expect(screen.getByText("ゲーマーズ")).toBeInTheDocument()
    })
  })
})
