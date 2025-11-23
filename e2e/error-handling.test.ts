import { test, expect } from "@playwright/test"

test.describe("Error Handling", () => {
  test.use({ storageState: "playwright/.auth/user.json" })

  test("should handle network errors gracefully", async ({ page }) => {
    // Intercept API calls and simulate network error
    await page.route("/api/admin/songs", (route) => {
      route.abort("failed")
    })

    await page.goto("/admin/songs")

    // Verify error message is displayed
    await expect(page.locator("text=エラーが発生しました")).toBeVisible()
  })

  test("should handle invalid form submissions", async ({ page }) => {
    await page.goto("/admin/songs")

    // Click add song button
    await page.click("text=楽曲を追加")

    // Submit form without required fields
    await page.click('button[type="submit"]')

    // Verify validation errors are shown
    await expect(page.locator("text=必須項目です")).toBeVisible()
  })

  test("should handle 404 errors", async ({ page }) => {
    await page.goto("/admin/nonexistent-page")

    // Verify 404 page or redirect
    await expect(page).toHaveURL(/\/admin/)
  })

  test("should handle API timeout errors", async ({ page }) => {
    // Intercept API calls and delay response
    await page.route("/api/admin/analytics", (route) => {
      setTimeout(() => route.continue(), 10000)
    })

    await page.goto("/admin/analytics")

    // Verify loading state is shown
    await expect(page.locator("text=読み込み中")).toBeVisible()
  })
})
