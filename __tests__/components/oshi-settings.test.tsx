import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { OshiSettings } from "@/components/oshi-settings"
import jest from "jest" // Import jest to fix the undeclared variable error

global.fetch = jest.fn()

describe("OshiSettings", () => {
  const mockTalents = [
    { id: 1, name: "さくらみこ", name_en: "Sakura Miko", branch: "JP" },
    { id: 2, name: "Gawr Gura", name_en: "Gawr Gura", branch: "EN" },
    { id: 3, name: "星街すいせい", name_en: "Hoshimachi Suisei", branch: "JP" },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render talent list", () => {
    render(<OshiSettings talents={mockTalents} initialOshi={[]} />)

    expect(screen.getByText("さくらみこ")).toBeInTheDocument()
    expect(screen.getByText("Gawr Gura")).toBeInTheDocument()
    expect(screen.getByText("星街すいせい")).toBeInTheDocument()
  })

  it("should show initially selected oshi", () => {
    render(<OshiSettings talents={mockTalents} initialOshi={[1, 2]} />)

    const checkboxes = screen.getAllByRole("checkbox")
    expect(checkboxes[0]).toBeChecked() // Sakura Miko
    expect(checkboxes[1]).toBeChecked() // Gawr Gura
    expect(checkboxes[2]).not.toBeChecked() // Hoshimachi Suisei
  })

  it("should toggle talent selection", () => {
    render(<OshiSettings talents={mockTalents} initialOshi={[]} />)

    const firstCheckbox = screen.getAllByRole("checkbox")[0]
    fireEvent.click(firstCheckbox)

    expect(firstCheckbox).toBeChecked()

    fireEvent.click(firstCheckbox)
    expect(firstCheckbox).not.toBeChecked()
  })

  it("should save oshi preferences", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })

    render(<OshiSettings talents={mockTalents} initialOshi={[]} />)

    const firstCheckbox = screen.getAllByRole("checkbox")[0]
    fireEvent.click(firstCheckbox)

    const saveButton = screen.getByRole("button", { name: /save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/user/oshi-preferences",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ talentIds: [1] }),
        }),
      )
    })
  })

  it("should filter talents by branch", () => {
    render(<OshiSettings talents={mockTalents} initialOshi={[]} />)

    const branchFilter = screen.getByLabelText(/branch/i)
    fireEvent.change(branchFilter, { target: { value: "JP" } })

    expect(screen.getByText("さくらみこ")).toBeInTheDocument()
    expect(screen.queryByText("Gawr Gura")).not.toBeInTheDocument()
  })

  it("should search talents by name", () => {
    render(<OshiSettings talents={mockTalents} initialOshi={[]} />)

    const searchInput = screen.getByPlaceholderText(/search/i)
    fireEvent.change(searchInput, { target: { value: "Gura" } })

    expect(screen.getByText("Gawr Gura")).toBeInTheDocument()
    expect(screen.queryByText("さくらみこ")).not.toBeInTheDocument()
  })

  it("should show error on save failure", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to save preferences" }),
    })

    render(<OshiSettings talents={mockTalents} initialOshi={[]} />)

    const firstCheckbox = screen.getAllByRole("checkbox")[0]
    fireEvent.click(firstCheckbox)

    const saveButton = screen.getByRole("button", { name: /save/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to save preferences/i)).toBeInTheDocument()
    })
  })
})
