import type { Meta, StoryObj } from "@storybook/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

const meta = {
  title: "UI/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "destructive"],
    },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <Info className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>This is a default alert with some information.</AlertDescription>
    </Alert>
  ),
}

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="w-[400px]">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>Something went wrong. Please try again.</AlertDescription>
    </Alert>
  ),
}

export const Success: Story = {
  render: () => (
    <Alert className="w-[400px] border-green-200 bg-green-50 text-green-800">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>Your action was completed successfully.</AlertDescription>
    </Alert>
  ),
}

export const Warning: Story = {
  render: () => (
    <Alert className="w-[400px] border-yellow-200 bg-yellow-50 text-yellow-800">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>Please review your input before proceeding.</AlertDescription>
    </Alert>
  ),
}

export const AdminNotification: Story = {
  render: () => (
    <Alert className="w-[400px]">
      <Info className="h-4 w-4" />
      <AlertTitle>管理者通知</AlertTitle>
      <AlertDescription>楽曲データベースが正常に更新されました。新しい楽曲が追加されています。</AlertDescription>
    </Alert>
  ),
}

export const DatabaseError: Story = {
  render: () => (
    <Alert variant="destructive" className="w-[400px]">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>データベースエラー</AlertTitle>
      <AlertDescription>データベースへの接続に失敗しました。しばらく時間をおいて再度お試しください。</AlertDescription>
    </Alert>
  ),
}
