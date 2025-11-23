import type { Meta, StoryObj } from "@storybook/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="select-demo">Choose an option</Label>
      <Select>
        <SelectTrigger id="select-demo">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const SongType: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="song-type">楽曲タイプ</Label>
      <Select>
        <SelectTrigger id="song-type">
          <SelectValue placeholder="タイプを選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ORIGINAL">オリジナル</SelectItem>
          <SelectItem value="COVER">歌ってみた</SelectItem>
          <SelectItem value="COLLABORATION">コラボ</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const TalentBranch: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="branch">ブランチ</Label>
      <Select>
        <SelectTrigger id="branch">
          <SelectValue placeholder="ブランチを選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hololive-jp">Hololive Japan</SelectItem>
          <SelectItem value="hololive-en">Hololive English</SelectItem>
          <SelectItem value="hololive-id">Hololive Indonesia</SelectItem>
          <SelectItem value="holostars">Holostars</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Language: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="language">言語</Label>
      <Select>
        <SelectTrigger id="language">
          <SelectValue placeholder="言語を選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="japanese">日本語</SelectItem>
          <SelectItem value="english">English</SelectItem>
          <SelectItem value="indonesian">Bahasa Indonesia</SelectItem>
          <SelectItem value="mixed">Mixed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Disabled select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </SelectContent>
    </Select>
  ),
}
