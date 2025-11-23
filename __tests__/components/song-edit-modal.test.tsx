"use client"

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { SongEditModal } from "@/components/song-edit-modal"
import jest from "jest"

global.fetch = jest.fn()

describe("SongEditModal", () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  const mockTalents = [
    { id: 1, name: "Talent 1", name_en: "Talent 1", branch: "JP" },
    { id: 2, name: "Talent 2", name_en: "Talent 2", branch: "EN" },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render create mode", () => {
    render(<SongEditModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} talents={mockTalents} />)

    expect(screen.getByText(/add new song/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/youtube url/i)).toBeInTheDocument()
  })

  it("should render edit mode with existing song data", () => {
    const mockSong = {
      id: 1,
      title: "Test Song",
      youtube_url: "https://youtube.com/watch?v=test",
      release_date: "2024-01-01",
      view_count: 1000,
      talents: [{ id: 1, name: "Talent 1" }],
    }

    render(
      <SongEditModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        talents={mockTalents}
        song={mockSong}
      />,
    )

    expect(screen.getByText(/edit song/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue("Test Song")).toBeInTheDocument()
    expect(screen.getByDisplayValue("https://youtube.com/watch?v=test")).toBeInTheDocument()
  })

  it("should handle successful song creation", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1 }),
    })

    render(<SongEditModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} talents={mockTalents} />)

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "New Song" },
    })
    fireEvent.change(screen.getByLabelText(/youtube url/i), {
      target: { value: "https://youtube.com/watch?v=new" },
    })
    fireEvent.click(screen.getByRole("button", { name: /save/i }))

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it("should validate YouTube URL format", async () => {
    render(<SongEditModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} talents={mockTalents} />)

    fireEvent.change(screen.getByLabelText(/youtube url/i), {
      target: { value: "invalid-url" },
    })
    fireEvent.click(screen.getByRole("button", { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid youtube url/i)).toBeInTheDocument()
    })
  })

  it("should handle talent selection", () => {
    render(<SongEditModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} talents={mockTalents} />)

    const talentSelect = screen.getByLabelText(/talents/i)
    fireEvent.click(talentSelect)

    expect(screen.getByText("Talent 1")).toBeInTheDocument()
    expect(screen.getByText("Talent 2")).toBeInTheDocument()
  })

  it("should show error on failed submission", async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to save song" }),
    })

    render(<SongEditModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} talents={mockTalents} />)

    fireEvent.change(screen.getByLabelText(/title/i), {
      target: { value: "New Song" },
    })
    fireEvent.change(screen.getByLabelText(/youtube url/i), {
      target: { value: "https://youtube.com/watch?v=new" },
    })
    fireEvent.click(screen.getByRole("button", { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText(/failed to save song/i)).toBeInTheDocument()
    })
  })
})
