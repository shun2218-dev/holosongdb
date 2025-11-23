import { test, expect } from "@playwright/test"

test.describe("Mobile Responsive Tests", () => {
  test.use({ storageState: "playwright/.auth/user.json" })

  test("should display properly on mobile devices", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto("/admin")

    // Verify mobile navigation
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()

    // Test mobile menu functionality
    await page.click('[data-testid="mobile-menu-button"]')
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
  })

  test("should handle touch interactions", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto("/admin/songs")

    // Test touch scrolling
    await page.touchscreen.tap(200, 300)

    // Verify content is accessible via touch
    await expect(page.locator("text=楽曲管理")).toBeVisible()
  })

  test("should adapt charts for mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto("/admin/analytics")

    // Go to charts tab
    await page.click("text=チャート")

    // Verify charts are responsive
    const chart = page.locator('[data-testid="talent-performance-chart"]')
    await expect(chart).toBeVisible()

    // Check chart container width adapts to mobile
    const chartBox = await chart.boundingBox()
    expect(chartBox?.width).toBeLessThanOrEqual(375)
  })
})
