"use client"

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { TalentEditModal } from "@/components/talent-edit-modal"
import jest from "jest"

global.fetch = jest.fn()

describe("TalentEditModal", () => {
  const mockOnClose = jest.fn()
  const mockOnSave = jest.fn()

  const mockTalent = {
    id: "1",
    name: "ときのそら",
    nameJp: "ときのそら",
    nameEn: "Tokino Sora",
    branch: "JP",
    generation: "0期生",
    debut: "2017-09-07",
    active: true,
    channelId: "UCp6993wxpyDPHUpavwDFqgg",
    subscriberCount: "1000000",
    mainColor: "#4ECDC4",
    image_url: "/tokino-sora.jpg",
    blur_data_url: "data:image/jpeg;base64,/9j/4AAQ...",
    createdAt: "2024-01-01T00:00:00Z",
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
  })

  it("should render edit mode with talent data", () => {
    render(<TalentEditModal isOpen={true} onClose={mockOnClose} talent={mockTalent} onSave={mockOnSave} />)

    expect(screen.getByText("タレントを編集")).toBeInTheDocument()
    expect(screen.getByDisplayValue("ときのそら")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Tokino Sora")).toBeInTheDocument()
  })

  it("should render create mode when talent is null", () => {
    render(<TalentEditModal isOpen={true} onClose={mockOnClose} talent={null} onSave={mockOnSave} />)

    expect(screen.getByText("新しいタレントを追加")).toBeInTheDocument()
  })

  it("should show Japanese name field for JP branch", () => {
    render(<TalentEditModal isOpen={true} onClose={mockOnClose} talent={mockTalent} onSave={mockOnSave} />)

    expect(screen.getByLabelText(/名前 $$日本語$$/)).toBeInTheDocument()
  })

  it("should show English name field for EN branch", () => {
    const enTalent = { ...mockTalent, branch: "EN", name: "Gawr Gura", nameEn: "Gawr Gura" }
    render(<TalentEditModal isOpen={true} onClose={mockOnClose} talent={enTalent} onSave={mockOnSave} />)

    expect(screen.getByLabelText(/名前 $$英語$$/)).toBeInTheDocument()
  })

  it("should submit form with correct data for JP talent", async () => {
    render(<TalentEditModal isOpen={true} onClose={mockOnClose} talent={null} onSave={mockOnSave} />)

    // Fill form
    const nameJpInput = screen.getByPlaceholderText("ときのそら")
    const nameEnInput = screen.getByPlaceholderText("Tokino Sora")

    fireEvent.change(nameJpInput, { target: { value: "ときのそら" } })
    fireEvent.change(nameEnInput, { target: { value: "Tokino Sora" } })

    // Submit
    const submitButton = screen.getByRole("button", { name: /追加/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/talents",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("ときのそら"),
        }),
      )
    })
  })

  it("should call onSave and onClose after successful submission", async () => {
    render(<TalentEditModal isOpen={true} onClose={mockOnClose} talent={null} onSave={mockOnSave} />)

    const nameJpInput = screen.getByPlaceholderText("ときのそら")
    const nameEnInput = screen.getByPlaceholderText("Tokino Sora")

    fireEvent.change(nameJpInput, { target: { value: "ときのそら" } })
    fireEvent.change(nameEnInput, { target: { value: "Tokino Sora" } })

    const submitButton = screen.getByRole("button", { name: /追加/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled()
    })

    // Wait for the timeout to close
    await waitFor(
      () => {
        expect(mockOnClose).toHaveBeenCalled()
      },
      { timeout: 1500 },
    )
  })

  it("should display error message on failed submission", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "保存に失敗しました" }),
    })

    render(<TalentEditModal isOpen={true} onClose={mockOnClose} talent={null} onSave={mockOnSave} />)

    const nameJpInput = screen.getByPlaceholderText("ときのそら")
    const nameEnInput = screen.getByPlaceholderText("Tokino Sora")

    fireEvent.change(nameJpInput, { target: { value: "ときのそら" } })
    fireEvent.change(nameEnInput, { target: { value: "Tokino Sora" } })

    const submitButton = screen.getByRole("button", { name: /追加/ })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText("保存に失敗しました")).toBeInTheDocument()
    })
  })
})
