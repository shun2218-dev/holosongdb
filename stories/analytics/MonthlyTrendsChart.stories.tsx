import type { Meta, StoryObj } from "@storybook/react"
import { MonthlyTrendsChart } from "@/components/analytics/monthly-trends-chart"

const meta: Meta<typeof MonthlyTrendsChart> = {
  title: "Analytics/MonthlyTrendsChart",
  component: MonthlyTrendsChart,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

const mockData = [
  { month: "2024-01", count: 45 },
  { month: "2024-02", count: 52 },
  { month: "2024-03", count: 38 },
  { month: "2024-04", count: 61 },
  { month: "2024-05", count: 49 },
  { month: "2024-06", count: 73 },
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

export const SingleDataPoint: Story = {
  args: {
    data: [{ month: "2024-01", count: 25 }],
  },
}
