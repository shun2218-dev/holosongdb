import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { StorybookAccess } from "@/components/storybook-access"
import jest from "jest"

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

// Mock window.open
const mockWindowOpen = jest.fn()
Object.defineProperty(window, "open", {
  value: mockWindowOpen,
  writable: true,
})

describe("StorybookAccess Component", () => {
  beforeEach(() => {
    mockFetch.mockClear()
    mockWindowOpen.mockClear()
  })

  it("should render storybook access card", () => {
    render(<StorybookAccess />)

    expect(screen.getByText("Storybook コンポーネントカタログ")).toBeInTheDocument()
    expect(
      screen.getByText("UIコンポーネントのドキュメントとテストを確認できます（スーパー管理者限定）"),
    ).toBeInTheDocument()
  })

  it("should show development environment message", () => {
    // Mock development environment
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "development"

    render(<StorybookAccess />)

    expect(screen.getByText(/開発環境では別タブでStorybook/)).toBeInTheDocument()
    expect(screen.getByText("Storybookを開く")).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it("should show production environment message", () => {
    // Mock production environment
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "production"

    render(<StorybookAccess />)

    expect(screen.getByText(/本番環境では、このページでコンポーネントカタログ/)).toBeInTheDocument()
    expect(screen.getByText("コンポーネントカタログを表示")).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it("should handle development environment storybook access", async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "development"

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        isDevelopment: true,
        storybookUrl: "http://localhost:6006",
      }),
    } as Response)

    render(<StorybookAccess />)

    const button = screen.getByText("Storybookを開く")
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/admin/storybook")
      expect(mockWindowOpen).toHaveBeenCalledWith("http://localhost:6006", "_blank", "noopener,noreferrer")
    })

    process.env.NODE_ENV = originalEnv
  })

  it("should handle production environment component catalog", async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "production"

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        isDevelopment: false,
      }),
    } as Response)

    render(<StorybookAccess />)

    const button = screen.getByText("コンポーネントカタログを表示")
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText("コンポーネントカタログ")).toBeInTheDocument()
      expect(screen.getByText("基本UIコンポーネント")).toBeInTheDocument()
      expect(screen.getByText("業務固有コンポーネント")).toBeInTheDocument()
      expect(screen.getByText("レイアウト・ナビゲーション")).toBeInTheDocument()
    })

    process.env.NODE_ENV = originalEnv
  })

  it("should display component categories and variants", async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "production"

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        isDevelopment: false,
      }),
    } as Response)

    render(<StorybookAccess />)

    fireEvent.click(screen.getByText("コンポーネントカタログを表示"))

    await waitFor(() => {
      // Check for specific components
      expect(screen.getByText("Button")).toBeInTheDocument()
      expect(screen.getByText("クリック可能なボタン要素")).toBeInTheDocument()
      expect(screen.getByText("SongCard")).toBeInTheDocument()
      expect(screen.getByText("楽曲情報を表示するカード")).toBeInTheDocument()

      // Check for variants
      expect(screen.getByText("default")).toBeInTheDocument()
      expect(screen.getByText("destructive")).toBeInTheDocument()
      expect(screen.getByText("outline")).toBeInTheDocument()
    })

    process.env.NODE_ENV = originalEnv
  })

  it("should handle API errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("API Error"))

    render(<StorybookAccess />)

    const button = screen.getByRole("button")
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText("API Error")).toBeInTheDocument()
    })
  })

  it("should show loading state", async () => {
    // Mock a delayed response
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ isDevelopment: false }),
              } as Response),
            100,
          ),
        ),
    )

    render(<StorybookAccess />)

    const button = screen.getByRole("button")
    fireEvent.click(button)

    expect(screen.getByText("アクセス中...")).toBeInTheDocument()
    expect(button).toBeDisabled()

    await waitFor(() => {
      expect(screen.queryByText("アクセス中...")).not.toBeInTheDocument()
    })
  })

  it("should handle server error responses", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: "サーバーエラーが発生しました",
      }),
    } as Response)

    render(<StorybookAccess />)

    const button = screen.getByRole("button")
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText("サーバーエラーが発生しました")).toBeInTheDocument()
    })
  })
})
