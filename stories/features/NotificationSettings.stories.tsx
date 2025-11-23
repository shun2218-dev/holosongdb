import type { Meta, StoryObj } from "@storybook/react"
import { NotificationSettings } from "@/components/notification-settings"

const meta: Meta<typeof NotificationSettings> = {
  title: "Features/NotificationSettings",
  component: NotificationSettings,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NotificationsEnabled: Story = {
  parameters: {
    mockData: [
      {
        url: "/api/notifications/subscription",
        method: "GET",
        status: 200,
        response: { subscribed: true },
      },
    ],
  },
}

export const NotificationsDisabled: Story = {
  parameters: {
    mockData: [
      {
        url: "/api/notifications/subscription",
        method: "GET",
        status: 200,
        response: { subscribed: false },
      },
    ],
  },
}
