import { test, expect } from "@playwright/test"

test.describe("Performance Tests", () => {
  test.use({ storageState: "playwright/.auth/user.json" })

  test("should load admin dashboard quickly", async ({ page }) => {
    const startTime = Date.now()

    await page.goto("/admin")

    // Wait for main content to be visible
    await expect(page.locator("text=管理ダッシュボード")).toBeVisible()

    const loadTime = Date.now() - startTime

    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test("should load analytics page within acceptable time", async ({ page }) => {
    const startTime = Date.now()

    await page.goto("/admin/analytics")

    // Wait for charts to be rendered
    await expect(page.locator('[data-testid="talent-performance-chart"]')).toBeVisible()

    const loadTime = Date.now() - startTime

    // Should load within 5 seconds (charts take more time)
    expect(loadTime).toBeLessThan(5000)
  })

  test("should handle large song lists efficiently", async ({ page }) => {
    await page.goto("/admin/songs")

    // Measure time to load song list
    const startTime = Date.now()

    // Wait for song list to be visible
    await expect(page.locator('[data-testid="song-list"]')).toBeVisible()

    const loadTime = Date.now() - startTime

    // Should load within 2 seconds
    expect(loadTime).toBeLessThan(2000)
  })
})
