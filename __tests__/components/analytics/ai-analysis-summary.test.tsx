import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { AIAnalysisSummary } from "@/components/analytics/ai-analysis-summary"
import type jest from "jest"

// Mock fetch
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

const mockAdmin = {
  id: "1",
  username: "testadmin",
  role: "admin" as const,
}

const mockAnalysisHistory = [
  {
    id: "1",
    analysis_type: "performance",
    period: "month",
    content: "This is a test analysis content that is quite long and should be truncated in the summary view.",
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    analysis_type: "trends",
    period: "week",
    content: "Short analysis",
    created_at: "2024-12-25T00:00:00Z",
  },
]

describe("AIAnalysisSummary Component", () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it("should render analysis history", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ analyses: mockAnalysisHistory }),
    } as Response)

    render(<AIAnalysisSummary admin={mockAdmin} />)

    await waitFor(() => {
      expect(screen.getByText("AI分析履歴")).toBeInTheDocument()
      expect(screen.getByText("パフォーマンス分析")).toBeInTheDocument()
      expect(screen.getByText("トレンド分析")).toBeInTheDocument()
    })
  })

  it("should expand and collapse analysis content", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ analyses: mockAnalysisHistory }),
    } as Response)

    render(<AIAnalysisSummary admin={mockAdmin} />)

    await waitFor(() => {
      const expandButton = screen.getAllByText("展開")[0]
      fireEvent.click(expandButton)
    })

    expect(screen.getByText(/This is a test analysis content that is quite long/)).toBeInTheDocument()

    const collapseButton = screen.getByText("折りたたみ")
    fireEvent.click(collapseButton)

    expect(screen.queryByText(/This is a test analysis content that is quite long/)).not.toBeInTheDocument()
  })

  it("should delete analysis item", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ analyses: mockAnalysisHistory }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "削除しました" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ analyses: [mockAnalysisHistory[1]] }),
      } as Response)

    render(<AIAnalysisSummary admin={mockAdmin} />)

    await waitFor(() => {
      const deleteButtons = screen.getAllByText("削除")
      fireEvent.click(deleteButtons[0])
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/admin/ai-analysis/1",
        expect.objectContaining({
          method: "DELETE",
        }),
      )
    })
  })

  it("should generate new analysis", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ analyses: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ analysis: "New AI analysis generated" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ analyses: [{ id: "new", content: "New AI analysis generated" }] }),
      } as Response)

    render(<AIAnalysisSummary admin={mockAdmin} />)

    await waitFor(() => {
      const generateButton = screen.getByText("新しい分析を生成")
      fireEvent.click(generateButton)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/admin/ai-analysis",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("performance"),
        }),
      )
    })
  })

  it("should handle loading states", async () => {
    // Mock slow response
    mockFetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ analyses: [] }),
              } as Response),
            100,
          ),
        ),
    )

    render(<AIAnalysisSummary admin={mockAdmin} />)

    expect(screen.getByText("読み込み中...")).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument()
    })
  })
})
