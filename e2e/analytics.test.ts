import { test, expect } from "@playwright/test"

test.describe("Analytics Dashboard", () => {
  test.use({ storageState: "playwright/.auth/user.json" })

  test("should display analytics dashboard", async ({ page }) => {
    await page.goto("/admin/analytics")

    await expect(page.locator("h1")).toContainText("データ分析")
    await expect(page.locator("text=概要")).toBeVisible()
    await expect(page.locator("text=チャート")).toBeVisible()
  })

  test("should switch between tabs", async ({ page }) => {
    await page.goto("/admin/analytics")

    // Click on Charts tab
    await page.click("text=チャート")
    await expect(page.locator("text=タレント別パフォーマンス")).toBeVisible()

    // Click back to Overview tab
    await page.click("text=概要")
    await expect(page.locator("text=総楽曲数")).toBeVisible()
  })

  test("should display charts correctly", async ({ page }) => {
    await page.goto("/admin/analytics")

    // Go to charts tab
    await page.click("text=チャート")

    // Verify charts are rendered
    await expect(page.locator('[data-testid="talent-performance-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="branch-comparison-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="top-songs-chart"]')).toBeVisible()
  })
})
