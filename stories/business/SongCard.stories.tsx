import type { Meta, StoryObj } from "@storybook/react"
import { SongCard } from "@/components/song-card"

const meta = {
  title: "Business/SongCard",
  component: SongCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof SongCard>

export default meta
type Story = StoryObj<typeof meta>

const baseSong = {
  id: "1",
  title: "Reflect",
  titleJp: "リフレクト",
  titleEn: "Reflect",
  type: "ORIGINAL" as const,
  videoId: "WGgEFoI9MhE",
  videoUrl: "https://www.youtube.com/watch?v=WGgEFoI9MhE",
  releaseDate: new Date("2021-06-21"),
  viewCount: BigInt(1250000),
  likeCount: BigInt(45000),
  commentCount: BigInt(2300),
  lyrics: "Gawr Gura",
  composer: "Farhan Sarasin",
  tags: ["Original", "English", "Emotional", "Ballad"],
  language: "English",
  talents: [
    {
      id: "1",
      name: "Gawr Gura",
      nameJp: "がうる・ぐら",
      nameEn: "Gawr Gura",
      branch: "Hololive English",
    },
  ],
}

export const Original: Story = {
  args: {
    song: baseSong,
  },
}

export const Cover: Story = {
  args: {
    song: {
      ...baseSong,
      id: "2",
      title: "King",
      titleJp: "キング",
      titleEn: "King",
      type: "COVER",
      videoUrl: "https://www.youtube.com/watch?v=qNIhngowViI",
      releaseDate: new Date("2020-10-15"),
      viewCount: BigInt(890000),
      likeCount: BigInt(32000),
      commentCount: BigInt(1800),
      lyrics: "Kanaria",
      composer: "Kanaria",
      tags: ["Cover", "Japanese", "Rock", "Popular"],
      language: "Japanese",
      talents: [
        {
          id: "2",
          name: "Mori Calliope",
          nameJp: "森カリオペ",
          nameEn: "Mori Calliope",
          branch: "Hololive English",
        },
      ],
    },
  },
}

export const Collaboration: Story = {
  args: {
    song: {
      ...baseSong,
      id: "3",
      title: "A New Start",
      titleJp: "新しいスタート",
      titleEn: "A New Start",
      type: "COLLABORATION",
      videoUrl: "https://www.youtube.com/watch?v=example",
      releaseDate: new Date("2023-01-15"),
      viewCount: BigInt(2100000),
      likeCount: BigInt(78000),
      commentCount: BigInt(4500),
      lyrics: "Hololive Music Team",
      composer: "Various Artists",
      tags: ["Collaboration", "Original", "Group", "Celebration"],
      language: "Mixed",
      talents: [
        {
          id: "1",
          name: "Gawr Gura",
          nameJp: "がうる・ぐら",
          nameEn: "Gawr Gura",
          branch: "Hololive English",
        },
        {
          id: "2",
          name: "Mori Calliope",
          nameJp: "森カリオペ",
          nameEn: "Mori Calliope",
          branch: "Hololive English",
        },
        {
          id: "3",
          name: "Ninomae Ina'nis",
          nameJp: "一伊那尓栖",
          nameEn: "Ninomae Ina'nis",
          branch: "Hololive English",
        },
      ],
    },
  },
}

export const MinimalData: Story = {
  args: {
    song: {
      id: "4",
      title: "Simple Song",
      titleJp: null,
      titleEn: null,
      type: "ORIGINAL",
      videoId: null,
      videoUrl: null,
      releaseDate: null,
      viewCount: null,
      likeCount: null,
      commentCount: null,
      lyrics: null,
      composer: null,
      tags: [],
      language: null,
      talents: [
        {
          id: "1",
          name: "Unknown Artist",
          nameJp: null,
          nameEn: null,
          branch: "Independent",
        },
      ],
    },
  },
}

export const LongTitle: Story = {
  args: {
    song: {
      ...baseSong,
      title: "This is a Very Long Song Title That Should Be Truncated Properly in the Card Component",
      titleJp: "これは非常に長い楽曲タイトルでカードコンポーネントで適切に省略されるべきものです",
      tags: ["Very", "Long", "Tag", "Names", "That", "Should", "Be", "Handled", "Properly"],
    },
  },
}

export const HighStats: Story = {
  args: {
    song: {
      ...baseSong,
      title: "Viral Hit",
      viewCount: BigInt(50000000),
      likeCount: BigInt(2500000),
      commentCount: BigInt(150000),
      tags: ["Viral", "Popular", "Trending", "Hit"],
    },
  },
}
