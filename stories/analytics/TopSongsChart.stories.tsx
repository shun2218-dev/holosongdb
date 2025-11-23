import type { Meta, StoryObj } from "@storybook/react"
import { TopSongsChart } from "@/components/analytics/top-songs-chart"

const meta: Meta<typeof TopSongsChart> = {
  title: "Analytics/TopSongsChart",
  component: TopSongsChart,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

const mockData = [
  { title: "Stellar Stellar", count: 1250 },
  { title: "KING", count: 980 },
  { title: "Ghost", count: 875 },
  { title: "Reflect", count: 720 },
  { title: "Palette", count: 650 },
]

export const Default: Story = {
  args: {
    data: mockData,
  },
}

export const EmptyData: Story = {
  args: {
    data: [],
  },
}

export const LongTitles: Story = {
  args: {
    data: [
      { title: "とても長いタイトルの楽曲名前がここに入ります", count: 500 },
      { title: "Another Very Long Song Title Here", count: 450 },
      { title: "超長い楽曲タイトル例", count: 400 },
    ],
  },
}
