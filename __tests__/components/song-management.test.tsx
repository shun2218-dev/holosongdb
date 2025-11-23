import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { SongManagement } from "@/components/song-management"
import type jest from "jest" // Import jest to declare the variable

// Mock the API calls
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

const mockAdmin = {
  id: "1",
  username: "testadmin",
  role: "admin",
}

const mockTalents = [
  {
    id: "1",
    name: "Tokino Sora",
    nameJp: "ときのそら",
    nameEn: "Tokino Sora",
    branch: "ホロライブ0期生",
    generation: "0期生",
    channelId: "UCp6993wxpyDPHUpavwDFqgg",
  },
  {
    id: "2",
    name: "AZKi",
    nameJp: "AZKi",
    nameEn: "AZKi",
    branch: "ホロライブ0期生",
    generation: "0期生",
    channelId: "UC0TXe_LYZ4scaW2XMyi5_kw",
  },
]

const mockSongs = [
  {
    id: "1",
    title: "Dancing Reed",
    titleJp: "Dancing Reed",
    titleEn: null,
    type: "ORIGINAL",
    videoId: "test123",
    videoUrl: "https://www.youtube.com/watch?v=test123",
    releaseDate: "2025-01-01T00:00:00Z",
    viewCount: "1000000",
    likeCount: "50000",
    commentCount: "5000",
    lyrics: "アオワイファイ",
    composer: "アオワイファイ",
    arranger: null,
    mixer: null,
    illustrator: null,
    description: "Test description",
    tags: ["オリジナル曲", "アオワイファイ", "ときのそら", "2025"],
    language: "ja",
    talentId: "1",
    talent: mockTalents[0],
    talents: [mockTalents[0]],
  },
]

describe("SongManagement Component", () => {
  beforeEach(() => {
    mockFetch.mockClear()

    // Mock initial data fetch
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ songs: mockSongs }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ talents: mockTalents }),
      } as Response)
  })

  it("should render song list", async () => {
    render(<SongManagement admin={mockAdmin} />)

    await waitFor(() => {
      expect(screen.getByText("Dancing Reed")).toBeInTheDocument()
      expect(screen.getByText("楽曲一覧 (1件)")).toBeInTheDocument()
    })
  })

  it("should open add form when clicking add button", async () => {
    render(<SongManagement admin={mockAdmin} />)

    await waitFor(() => {
      expect(screen.getByText("新しい楽曲を追加")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("新しい楽曲を追加"))

    expect(screen.getByText("新しい楽曲を追加")).toBeInTheDocument()
    expect(screen.getByLabelText("楽曲タイトル *")).toBeInTheDocument()
  })

  it("should handle YouTube search", async () => {
    const mockSearchResults = {
      results: [
        {
          videoId: "search123",
          title: "Search Result",
          description: "Test description",
          channelTitle: "Test Channel",
          publishedAt: "2025-01-01T00:00:00Z",
          thumbnail: "https://example.com/thumb.jpg",
          url: "https://www.youtube.com/watch?v=search123",
        },
      ],
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    } as Response)

    render(<SongManagement admin={mockAdmin} />)

    await waitFor(() => {
      fireEvent.click(screen.getByText("新しい楽曲を追加"))
    })

    const searchInput = screen.getByPlaceholderText("楽曲名やキーワードを入力...")
    const searchButton = screen.getByText("検索")

    await userEvent.type(searchInput, "test search")
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText("Search Result")).toBeInTheDocument()
    })
  })

  it("should auto-fill video data", async () => {
    const mockVideoData = {
      video: {
        videoId: "search123",
        title: "Auto Fill Test",
        url: "https://www.youtube.com/watch?v=search123",
        publishedAt: "2025-01-01T00:00:00Z",
        statistics: {
          viewCount: "2000000",
          likeCount: "100000",
          commentCount: "10000",
        },
      },
    }

    // Mock search results first
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            videoId: "search123",
            title: "Auto Fill Test",
            description: "Test",
            channelTitle: "Test Channel",
            publishedAt: "2025-01-01T00:00:00Z",
            thumbnail: "https://example.com/thumb.jpg",
            url: "https://www.youtube.com/watch?v=search123",
          },
        ],
      }),
    } as Response)

    // Mock video details
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockVideoData,
    } as Response)

    render(<SongManagement admin={mockAdmin} />)

    await waitFor(() => {
      fireEvent.click(screen.getByText("新しい楽曲を追加"))
    })

    // Perform search
    const searchInput = screen.getByPlaceholderText("楽曲名やキーワードを入力...")
    await userEvent.type(searchInput, "test")
    fireEvent.click(screen.getByText("検索"))

    await waitFor(() => {
      const autoFillButton = screen.getByText("自動入力")
      fireEvent.click(autoFillButton)
    })

    await waitFor(() => {
      expect(screen.getByDisplayValue("Auto Fill Test")).toBeInTheDocument()
      expect(screen.getByDisplayValue("2000000")).toBeInTheDocument()
    })
  })

  it("should handle smart tag auto-fill", async () => {
    render(<SongManagement admin={mockAdmin} />)

    await waitFor(() => {
      fireEvent.click(screen.getByText("新しい楽曲を追加"))
    })

    // Fill form data
    const titleInput = screen.getByLabelText("楽曲タイトル *")
    const composerInput = screen.getByLabelText("作曲者")
    const releaseDateInput = screen.getByLabelText("リリース日")

    await userEvent.type(titleInput, "Test Song")
    await userEvent.type(composerInput, "Test Composer")
    await userEvent.type(releaseDateInput, "2025-01-01")

    // Select talent
    const talentCheckbox = screen.getByLabelText("ときのそら (ホロライブ0期生)")
    fireEvent.click(talentCheckbox)

    await waitFor(() => {
      expect(screen.getByText("タグを追加")).toBeInTheDocument()
    })

    // Click auto-fill tags
    fireEvent.click(screen.getByText("タグを追加"))

    await waitFor(() => {
      const tagsInput = screen.getByLabelText("タグ (カンマ区切り)")
      expect(tagsInput).toHaveValue(expect.stringContaining("オリジナル曲"))
      expect(tagsInput).toHaveValue(expect.stringContaining("Test Composer"))
      expect(tagsInput).toHaveValue(expect.stringContaining("ときのそら"))
      expect(tagsInput).toHaveValue(expect.stringContaining("2025"))
    })
  })

  it("should prevent duplicate tags", async () => {
    render(<SongManagement admin={mockAdmin} />)

    await waitFor(() => {
      fireEvent.click(screen.getByText("新しい楽曲を追加"))
    })

    const tagsInput = screen.getByLabelText("タグ (カンマ区切り)")

    // Type tags with duplicates
    await userEvent.type(tagsInput, "オリジナル曲, オリジナル曲, test, TEST")

    // Trigger change event
    fireEvent.blur(tagsInput)

    await waitFor(() => {
      expect(tagsInput).toHaveValue("オリジナル曲, test")
    })
  })

  it("should submit form successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    render(<SongManagement admin={mockAdmin} />)

    await waitFor(() => {
      fireEvent.click(screen.getByText("新しい楽曲を追加"))
    })

    // Fill required fields
    const titleInput = screen.getByLabelText("楽曲タイトル *")
    await userEvent.type(titleInput, "New Test Song")

    // Select talent
    const talentCheckbox = screen.getByLabelText("ときのそら (ホロライブ0期生)")
    fireEvent.click(talentCheckbox)

    // Submit form
    const submitButton = screen.getByText("追加")
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/admin/songs",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: expect.stringContaining("New Test Song"),
        }),
      )
    })
  })
})
