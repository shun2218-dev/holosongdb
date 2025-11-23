import type { Meta, StoryObj } from "@storybook/react"
import { TalentManagement } from "@/components/talent-management"

const meta: Meta<typeof TalentManagement> = {
  title: "Business/TalentManagement",
  component: TalentManagement,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

const mockTalents = [
  {
    id: 1,
    name: "さくらみこ",
    branch: "hololive",
    generation: "0期生",
    debut_date: "2018-08-01",
    youtube_channel: "https://youtube.com/@sakuramiko",
    twitter_handle: "@sakuramiko35",
    profile_image: "/anime-girl-pink-hair.jpg",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "白上フブキ",
    branch: "hololive",
    generation: "ゲーマーズ",
    debut_date: "2018-05-18",
    youtube_channel: "https://youtube.com/@shirakami_fubuki",
    twitter_handle: "@shirakamifubuki",
    profile_image: "/anime-girl-white-hair-fox-ears.jpg",
    is_active: true,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
]

export const Default: Story = {
  parameters: {
    mockData: [
      {
        url: "/api/admin/talents",
        method: "GET",
        status: 200,
        response: mockTalents,
      },
    ],
  },
}

export const Loading: Story = {
  parameters: {
    mockData: [
      {
        url: "/api/admin/talents",
        method: "GET",
        delay: 2000,
        status: 200,
        response: [],
      },
    ],
  },
}
