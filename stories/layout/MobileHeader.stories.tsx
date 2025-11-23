import type { Meta, StoryObj } from "@storybook/react"
import { MobileHeader } from "@/components/mobile-header"

const meta: Meta<typeof MobileHeader> = {
  title: "Layout/MobileHeader",
  component: MobileHeader,
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithNotifications: Story = {
  parameters: {
    mockData: [
      {
        url: "/api/notifications/unread-count",
        method: "GET",
        status: 200,
        response: { count: 3 },
      },
    ],
  },
}
