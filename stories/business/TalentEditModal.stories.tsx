"use client"

import type { Meta, StoryObj } from "@storybook/react"
import { TalentEditModal } from "@/components/talent-edit-modal"
import { useState } from "react"

const meta: Meta<typeof TalentEditModal> = {
  title: "Business/TalentEditModal",
  component: TalentEditModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

const mockJPTalent = {
  id: "1",
  name: "ときのそら",
  nameJp: "ときのそら",
  nameEn: "Tokino Sora",
  branch: "JP",
  generation: "0期生",
  debut: "2017-09-07",
  active: true,
  channelId: "UCp6993wxpyDPHUpavwDFqgg",
  subscriberCount: "1000000",
  mainColor: "#4ECDC4",
  image_url: "/anime-blue-hair.png",
  blur_data_url: "data:image/jpeg;base64,/9j/4AAQ...",
  createdAt: "2024-01-01T00:00:00Z",
}

const mockENTalent = {
  id: "2",
  name: "Gawr Gura",
  nameJp: null,
  nameEn: "Gawr Gura",
  branch: "EN",
  generation: "Myth",
  debut: "2020-09-13",
  active: true,
  channelId: "UCoSrY_IQQVpmIRZ9Xf-y93g",
  subscriberCount: "4000000",
  mainColor: "#3D7DCA",
  image_url: "/anime-girl-with-blue-shark-hoodie.jpg",
  blur_data_url: "data:image/jpeg;base64,/9j/4AAQ...",
  createdAt: "2024-01-01T00:00:00Z",
}

const TalentEditModalWrapper = ({ talent }: { talent: typeof mockJPTalent | null }) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div>
      <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded">
        モーダルを開く
      </button>
      <TalentEditModal isOpen={isOpen} onClose={() => setIsOpen(false)} talent={talent} onSave={() => {}} />
    </div>
  )
}

export const CreateJPTalent: Story = {
  render: () => <TalentEditModalWrapper talent={null} />,
  parameters: {
    mockData: [
      {
        url: "/api/admin/generations?branch=JP",
        method: "GET",
        status: 200,
        response: [
          { id: "1", branch: "JP", name: "0期生", display_order: 0 },
          { id: "2", branch: "JP", name: "1期生", display_order: 1 },
          { id: "3", branch: "JP", name: "2期生", display_order: 2 },
        ],
      },
      {
        url: "/api/admin/talents",
        method: "POST",
        status: 200,
        response: { success: true, id: "new-talent-id" },
      },
    ],
  },
}

export const EditJPTalent: Story = {
  render: () => <TalentEditModalWrapper talent={mockJPTalent} />,
  parameters: {
    mockData: [
      {
        url: "/api/admin/generations?branch=JP",
        method: "GET",
        status: 200,
        response: [
          { id: "1", branch: "JP", name: "0期生", display_order: 0 },
          { id: "2", branch: "JP", name: "1期生", display_order: 1 },
        ],
      },
      {
        url: "/api/admin/talents/1",
        method: "PUT",
        status: 200,
        response: { success: true },
      },
    ],
  },
}

export const EditENTalent: Story = {
  render: () => <TalentEditModalWrapper talent={mockENTalent} />,
  parameters: {
    mockData: [
      {
        url: "/api/admin/generations?branch=EN",
        method: "GET",
        status: 200,
        response: [
          { id: "4", branch: "EN", name: "Myth", display_order: 0 },
          { id: "5", branch: "EN", name: "Promise", display_order: 1 },
          { id: "6", branch: "EN", name: "Advent", display_order: 2 },
        ],
      },
      {
        url: "/api/admin/talents/2",
        method: "PUT",
        status: 200,
        response: { success: true },
      },
    ],
  },
}

export const WithImageUpload: Story = {
  render: () => <TalentEditModalWrapper talent={null} />,
  parameters: {
    mockData: [
      {
        url: "/api/admin/generations?branch=JP",
        method: "GET",
        status: 200,
        response: [{ id: "1", branch: "JP", name: "0期生", display_order: 0 }],
      },
      {
        url: "/api/admin/talents/upload-image",
        method: "POST",
        status: 200,
        response: { url: "/uploaded-image.jpg" },
      },
    ],
  },
}

export const ErrorState: Story = {
  render: () => <TalentEditModalWrapper talent={null} />,
  parameters: {
    mockData: [
      {
        url: "/api/admin/generations?branch=JP",
        method: "GET",
        status: 200,
        response: [],
      },
      {
        url: "/api/admin/talents",
        method: "POST",
        status: 500,
        response: { error: "サーバーエラーが発生しました" },
      },
    ],
  },
}
