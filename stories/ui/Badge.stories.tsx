import type { Meta, StoryObj } from "@storybook/react"
import { Badge } from "@/components/ui/badge"

const meta = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "secondary", "destructive", "outline"],
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: "Badge",
  },
}

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
}

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive",
  },
}

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
}

export const SongTypes: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge className="bg-primary text-primary-foreground">オリジナル</Badge>
      <Badge className="bg-secondary text-secondary-foreground">歌ってみた</Badge>
      <Badge className="bg-accent text-accent-foreground">コラボ</Badge>
    </div>
  ),
}

export const TalentBranches: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">Hololive English</Badge>
      <Badge variant="outline">Hololive Japan</Badge>
      <Badge variant="outline">Hololive Indonesia</Badge>
      <Badge variant="outline">Holostars</Badge>
    </div>
  ),
}

export const Tags: Story = {
  render: () => (
    <div className="flex flex-wrap gap-1">
      <Badge variant="secondary" className="text-xs">
        Original
      </Badge>
      <Badge variant="secondary" className="text-xs">
        English
      </Badge>
      <Badge variant="secondary" className="text-xs">
        Emotional
      </Badge>
      <Badge variant="secondary" className="text-xs">
        Ballad
      </Badge>
      <Badge variant="secondary" className="text-xs">
        +3
      </Badge>
    </div>
  ),
}
