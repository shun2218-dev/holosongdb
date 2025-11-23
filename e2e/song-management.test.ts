import { test, expect } from "@playwright/test"

test.describe("Song Management", () => {
  test.use({ storageState: "playwright/.auth/user.json" })

  test("should display song management page", async ({ page }) => {
    await page.goto("/admin/songs")

    await expect(page.locator("h1")).toContainText("楽曲管理")
    await expect(page.locator("text=楽曲を追加")).toBeVisible()
  })

  test("should add a new song", async ({ page }) => {
    await page.goto("/admin/songs")

    // Click add song button
    await page.click("text=楽曲を追加")

    // Fill in song details
    await page.fill('input[name="title"]', "Test Song")
    await page.fill('input[name="artist"]', "Test Artist")
    await page.fill('input[name="youtubeUrl"]', "https://www.youtube.com/watch?v=dQw4w9WgXcQ")

    // Select song type
    await page.click('button[role="combobox"]')
    await page.click("text=オリジナル楽曲")

    // Submit form
    await page.click('button[type="submit"]')

    // Verify success message
    await expect(page.locator("text=楽曲が正常に追加されました")).toBeVisible()

    // Verify song appears in list
    await expect(page.locator("text=Test Song")).toBeVisible()
  })

  test("should edit an existing song", async ({ page }) => {
    await page.goto("/admin/songs")

    // Find first song and click edit
    await page.click('[data-testid="song-item"]:first-child button:has-text("編集")')

    // Update song title
    await page.fill('input[name="title"]', "Updated Song Title")

    // Submit form
    await page.click('button[type="submit"]')

    // Verify success message
    await expect(page.locator("text=楽曲が正常に更新されました")).toBeVisible()
  })

  test("should delete a song", async ({ page }) => {
    await page.goto("/admin/songs")

    // Find first song and click delete
    await page.click('[data-testid="song-item"]:first-child button:has-text("削除")')

    // Confirm deletion
    await page.click('button:has-text("削除")')

    // Verify success message
    await expect(page.locator("text=楽曲が正常に削除されました")).toBeVisible()
  })
})
