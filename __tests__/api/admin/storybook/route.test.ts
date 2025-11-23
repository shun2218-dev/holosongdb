import { GET } from "@/app/api/admin/storybook/route"
import { NextRequest } from "next/server"

// Mock environment variables
const originalEnv = process.env.NODE_ENV

describe("/api/admin/storybook", () => {
  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  it("should return development storybook URL in development", async () => {
    process.env.NODE_ENV = "development"

    const request = new NextRequest("http://localhost:3000/api/admin/storybook")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      isDevelopment: true,
      storybookUrl: "http://localhost:6006",
      message: "開発環境でStorybookにアクセスできます",
    })
  })

  it("should return production response in production", async () => {
    process.env.NODE_ENV = "production"

    const request = new NextRequest("http://localhost:3000/api/admin/storybook")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      isDevelopment: false,
      message: "本番環境ではコンポーネントカタログを表示します",
    })
  })

  it("should handle test environment", async () => {
    process.env.NODE_ENV = "test"

    const request = new NextRequest("http://localhost:3000/api/admin/storybook")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({
      isDevelopment: false,
      message: "本番環境ではコンポーネントカタログを表示します",
    })
  })
})
