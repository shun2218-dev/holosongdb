import { test, expect } from "@playwright/test"

test.describe("Talent Management", () => {
  test.use({ storageState: "playwright/.auth/user.json" })

  test("should display talent management page", async ({ page }) => {
    await page.goto("/admin/talents")

    await expect(page.locator("h1")).toContainText("タレント管理")
    await expect(page.locator("text=タレントを追加")).toBeVisible()
  })

  test("should add a new talent", async ({ page }) => {
    await page.goto("/admin/talents")

    // Click add talent button
    await page.click("text=タレントを追加")

    // Fill in talent details
    await page.fill('input[name="name"]', "Test Talent")
    await page.fill('input[name="nameJp"]', "テストタレント")
    await page.fill('input[name="channelId"]', "UC1234567890")

    // Select branch
    await page.click('button[role="combobox"]')
    await page.click("text=JP")

    // Set debut date
    await page.fill('input[name="debutDate"]', "2024-01-01")

    // Set main color
    await page.fill('input[name="mainColor"]', "#FF6B6B")

    // Submit form
    await page.click('button[type="submit"]')

    // Verify success message
    await expect(page.locator("text=タレントが正常に追加されました")).toBeVisible()

    // Verify talent appears in list
    await expect(page.locator("text=Test Talent")).toBeVisible()
  })

  test("should edit an existing talent", async ({ page }) => {
    await page.goto("/admin/talents")

    // Find first talent and click edit
    await page.click('[data-testid="talent-item"]:first-child button:has-text("編集")')

    // Update talent name
    await page.fill('input[name="name"]', "Updated Talent Name")

    // Submit form
    await page.click('button[type="submit"]')

    // Verify success message
    await expect(page.locator("text=タレントが正常に更新されました")).toBeVisible()
  })
})
