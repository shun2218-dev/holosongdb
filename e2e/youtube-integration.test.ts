import { test, expect } from "@playwright/test"

test.describe("YouTube Integration", () => {
  test.use({ storageState: "playwright/.auth/user.json" })

  test("should search YouTube videos", async ({ page }) => {
    await page.goto("/admin/songs")

    // Click add song button
    await page.click("text=楽曲を追加")

    // Fill in search term
    await page.fill('input[placeholder="YouTube動画を検索..."]', "test song")

    // Click search button
    await page.click('button:has-text("検索")')

    // Wait for search results
    await expect(page.locator('[data-testid="youtube-search-results"]')).toBeVisible()

    // Verify search results contain video items
    await expect(page.locator('[data-testid="youtube-video-item"]')).toHaveCount({ min: 1 })
  })

  test("should auto-fill song data from YouTube", async ({ page }) => {
    await page.goto("/admin/songs")

    // Click add song button
    await page.click("text=楽曲を追加")

    // Enter YouTube URL
    await page.fill('input[name="youtubeUrl"]', "https://www.youtube.com/watch?v=dQw4w9WgXcQ")

    // Click auto-fill button
    await page.click('button:has-text("自動入力")')

    // Wait for auto-fill to complete
    await page.waitForTimeout(2000)

    // Verify fields are filled
    await expect(page.locator('input[name="title"]')).not.toHaveValue("")
    await expect(page.locator('input[name="artist"]')).not.toHaveValue("")
  })
})
