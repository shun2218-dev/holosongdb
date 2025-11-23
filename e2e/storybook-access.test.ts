import { test, expect } from "@playwright/test"

test.describe("Storybook Access", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await page.goto("/admin/login")
    await page.fill('input[name="username"]', "admin")
    await page.fill('input[name="password"]', "admin123")
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL("/admin")
  })

  test("should navigate to storybook page", async ({ page }) => {
    await page.goto("/admin/storybook")

    await expect(page.locator("text=Storybook コンポーネントカタログ")).toBeVisible()
    await expect(page.locator("text=UIコンポーネントのドキュメントとテストを確認できます")).toBeVisible()
  })

  test("should show production environment message", async ({ page }) => {
    await page.goto("/admin/storybook")

    await expect(page.locator("text=本番環境では、このページでコンポーネントカタログを確認できます")).toBeVisible()
    await expect(page.locator("button:has-text('コンポーネントカタログを表示')")).toBeVisible()
  })

  test("should display component catalog when clicked", async ({ page }) => {
    await page.goto("/admin/storybook")

    // Click the component catalog button
    await page.click("button:has-text('コンポーネントカタログを表示')")

    // Wait for component catalog to appear
    await expect(page.locator("text=コンポーネントカタログ")).toBeVisible()
    await expect(page.locator("text=基本UIコンポーネント")).toBeVisible()
    await expect(page.locator("text=業務固有コンポーネント")).toBeVisible()
    await expect(page.locator("text=レイアウト・ナビゲーション")).toBeVisible()
  })

  test("should show component details and variants", async ({ page }) => {
    await page.goto("/admin/storybook")

    await page.click("button:has-text('コンポーネントカタログを表示')")

    // Check for specific components
    await expect(page.locator("text=Button")).toBeVisible()
    await expect(page.locator("text=クリック可能なボタン要素")).toBeVisible()
    await expect(page.locator("text=SongCard")).toBeVisible()
    await expect(page.locator("text=楽曲情報を表示するカード")).toBeVisible()

    // Check for variants (badges)
    await expect(page.locator(".bg-secondary:has-text('default')")).toBeVisible()
    await expect(page.locator(".bg-secondary:has-text('outline')")).toBeVisible()
  })

  test("should show loading state during API call", async ({ page }) => {
    await page.goto("/admin/storybook")

    // Intercept the API call to add delay
    await page.route("/api/admin/storybook", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          isDevelopment: false,
          message: "本番環境ではコンポーネントカタログを表示します",
        }),
      })
    })

    const button = page.locator("button:has-text('コンポーネントカタログを表示')")
    await button.click()

    // Check loading state
    await expect(page.locator("text=アクセス中...")).toBeVisible()
    await expect(button).toBeDisabled()

    // Wait for loading to complete
    await expect(page.locator("text=アクセス中...")).not.toBeVisible()
  })

  test("should handle API errors gracefully", async ({ page }) => {
    await page.goto("/admin/storybook")

    // Mock API error
    await page.route("/api/admin/storybook", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          error: "サーバーエラーが発生しました",
        }),
      })
    })

    await page.click("button:has-text('コンポーネントカタログを表示')")

    await expect(page.locator("text=サーバーエラーが発生しました")).toBeVisible()
  })

  test("should be accessible", async ({ page }) => {
    await page.goto("/admin/storybook")

    // Check for proper heading structure
    await expect(page.locator("h1, h2, h3").first()).toBeVisible()

    // Check for proper button labeling
    const button = page.locator("button:has-text('コンポーネントカタログを表示')")
    await expect(button).toBeVisible()
    await expect(button).toBeEnabled()

    // Check for alert descriptions
    await expect(page.locator("[role='alert']")).toBeVisible()
  })

  test("should show development instructions", async ({ page }) => {
    await page.goto("/admin/storybook")

    await expect(page.locator("text=開発時の使用方法:")).toBeVisible()
    await expect(page.locator("text=npm run storybook")).toBeVisible()
    await expect(page.locator("text=本番環境: このページでコンポーネント一覧を確認できます")).toBeVisible()
  })
})
