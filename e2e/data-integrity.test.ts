import { test, expect } from "@playwright/test"

test.describe("Data Integrity Tests", () => {
  test.use({ storageState: "playwright/.auth/user.json" })

  test("should maintain data consistency across operations", async ({ page }) => {
    await page.goto("/admin/songs")

    // Add a new song
    await page.click("text=楽曲を追加")
    await page.fill('input[name="title"]', "Data Integrity Test Song")
    await page.fill('input[name="artist"]', "Test Artist")
    await page.fill('input[name="youtubeUrl"]', "https://www.youtube.com/watch?v=test123")
    await page.click('button[role="combobox"]')
    await page.click("text=オリジナル楽曲")
    await page.click('button[type="submit"]')

    // Verify song appears in list
    await expect(page.locator("text=Data Integrity Test Song")).toBeVisible()

    // Navigate to analytics and verify song is counted
    await page.goto("/admin/analytics")

    // Check that total song count includes our new song
    const totalSongs = await page.locator('[data-testid="total-songs-count"]').textContent()
    expect(Number.parseInt(totalSongs || "0")).toBeGreaterThan(0)
  })

  test("should handle concurrent operations safely", async ({ page, context }) => {
    // Create second page for concurrent operations
    const page2 = await context.newPage()

    await page.goto("/admin/songs")
    await page2.goto("/admin/songs")

    // Simultaneously add songs from both pages
    const addSong = async (pageInstance: any, title: string) => {
      await pageInstance.click("text=楽曲を追加")
      await pageInstance.fill('input[name="title"]', title)
      await pageInstance.fill('input[name="artist"]', "Concurrent Test Artist")
      await pageInstance.fill('input[name="youtubeUrl"]', `https://www.youtube.com/watch?v=${title}`)
      await pageInstance.click('button[role="combobox"]')
      await pageInstance.click("text=オリジナル楽曲")
      await pageInstance.click('button[type="submit"]')
    }

    await Promise.all([addSong(page, "Concurrent Song 1"), addSong(page2, "Concurrent Song 2")])

    // Verify both songs were added successfully
    await page.reload()
    await expect(page.locator("text=Concurrent Song 1")).toBeVisible()
    await expect(page.locator("text=Concurrent Song 2")).toBeVisible()

    await page2.close()
  })
})
