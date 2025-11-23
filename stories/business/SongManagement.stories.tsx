import type { Meta, StoryObj } from "@storybook/react"
import { SongManagement } from "@/components/song-management"
import { mockSongs } from "../mock-data"

const meta: Meta<typeof SongManagement> = {
  title: "Business/SongManagement",
  component: SongManagement,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    mockData: [
      {
        url: "/api/songs",
        method: "GET",
        status: 200,
        response: { songs: mockSongs, total: mockSongs.length },
      },
    ],
  },
}

export const Loading: Story = {
  parameters: {
    mockData: [
      {
        url: "/api/songs",
        method: "GET",
        delay: 2000,
        status: 200,
        response: { songs: [], total: 0 },
      },
    ],
  },
}

export const Empty: Story = {
  parameters: {
    mockData: [
      {
        url: "/api/songs",
        method: "GET",
        status: 200,
        response: { songs: [], total: 0 },
      },
    ],
  },
}
