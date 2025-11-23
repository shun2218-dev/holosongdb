import { render, screen, fireEvent } from "@testing-library/react"
import { SongSearch } from "@/components/song-search"
import { useRouter, useSearchParams } from "next/navigation"
import jest from "jest" // Declare the jest variable

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

jest.mock("@/hooks/use-online-status", () => ({
  useOnlineStatus: jest.fn(() => true),
}))

jest.mock("@/hooks/use-dismissible-banner", () => ({
  useDismissibleBanner: jest.fn(() => ({
    isDismissed: false,
    dismiss: jest.fn(),
  })),
}))

const mockPush = jest.fn()
const mockSearchParams = new URLSearchParams()

describe("SongSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
  })

  it("should render search input and filters", () => {
    render(<SongSearch />)

    expect(screen.getByPlaceholderText(/楽曲タイトル、タレント、作詞作曲者で検索/)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /検索/ })).toBeInTheDocument()
  })

  it("should handle search submission", () => {
    render(<SongSearch />)

    const input = screen.getByPlaceholderText(/楽曲タイトル、タレント、作詞作曲者で検索/)
    fireEvent.change(input, { target: { value: "test song" } })

    const searchButton = screen.getByRole("button", { name: /検索/ })
    fireEvent.click(searchButton)

    expect(mockPush).toHaveBeenCalledWith("/?q=test+song")
  })

  it("should handle Enter key press", () => {
    render(<SongSearch />)

    const input = screen.getByPlaceholderText(/楽曲タイトル、タレント、作詞作曲者で検索/)
    fireEvent.change(input, { target: { value: "test" } })
    fireEvent.keyDown(input, { key: "Enter" })

    expect(mockPush).toHaveBeenCalledWith("/?q=test")
  })

  it("should handle song type filter", () => {
    render(<SongSearch />)

    const typeSelect = screen.getByRole("combobox", { name: "" })
    fireEvent.click(typeSelect)

    const originalOption = screen.getByText("オリジナル曲")
    fireEvent.click(originalOption)

    const searchButton = screen.getByRole("button", { name: /検索/ })
    fireEvent.click(searchButton)

    expect(mockPush).toHaveBeenCalledWith("/?type=ORIGINAL")
  })

  it("should toggle sort order", () => {
    render(<SongSearch />)

    const sortButton = screen.getByRole("button", { name: "" })
    fireEvent.click(sortButton)

    const searchButton = screen.getByRole("button", { name: /検索/ })
    fireEvent.click(searchButton)

    expect(mockPush).toHaveBeenCalledWith("/?sortOrder=asc")
  })

  it("should call onOfflineSearch when offline", () => {
    const { useOnlineStatus } = require("@/hooks/use-online-status")
    useOnlineStatus.mockReturnValue(false)

    const mockOfflineSearch = jest.fn()
    render(<SongSearch onOfflineSearch={mockOfflineSearch} />)

    const input = screen.getByPlaceholderText(/楽曲タイトル、タレント、作詞作曲者で検索/)
    fireEvent.change(input, { target: { value: "test" } })

    const searchButton = screen.getByRole("button", { name: /フィルター/ })
    fireEvent.click(searchButton)

    expect(mockOfflineSearch).toHaveBeenCalledWith({
      query: "test",
      sortBy: "releaseDate",
      sortOrder: "desc",
      songType: "all",
    })
  })

  it("should show offline banner when offline", () => {
    const { useOnlineStatus } = require("@/hooks/use-online-status")
    useOnlineStatus.mockReturnValue(false)

    render(<SongSearch />)

    expect(screen.getByText(/オフライン中：キャッシュされたデータ内で検索します/)).toBeInTheDocument()
  })
})
