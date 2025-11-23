import type { Meta, StoryObj } from "@storybook/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchIcon, MailIcon } from "lucide-react"

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["text", "email", "password", "number", "search"],
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
  ),
}

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Password",
  },
}

export const SearchStory: Story = {
  render: () => (
    <div className="relative">
      <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Search songs..." className="pl-8" />
    </div>
  ),
}

export const WithIcon: Story = {
  render: () => (
    <div className="relative">
      <MailIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input type="email" placeholder="Email" className="pl-8" />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled input",
  },
}

export const WithError: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="error-input">Email</Label>
      <Input
        type="email"
        id="error-input"
        placeholder="Email"
        className="border-destructive focus-visible:ring-destructive"
      />
      <p className="text-sm text-destructive">This field is required.</p>
    </div>
  ),
}
