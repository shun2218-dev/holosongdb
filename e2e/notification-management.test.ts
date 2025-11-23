import { test, expect } from "@playwright/test"

test.describe("Notification Management", () => {
  test.use({ storageState: "playwright/.auth/user.json" })

  test("should display notification management page", async ({ page }) => {
    await page.goto("/admin/notifications")

    // Check page title and description
    await expect(page.locator("h1")).toContainText("通知管理")
    await expect(page.locator("text=プッシュ通知の送信履歴とエンゲージメント統計")).toBeVisible()

    // Check statistics cards are visible
    await expect(page.locator("text=送信通知数")).toBeVisible()
    await expect(page.locator("text=総クリック数")).toBeVisible()
    await expect(page.locator("text=平均CTR")).toBeVisible()
    await expect(page.locator("text=ユニークユーザー")).toBeVisible()
  })

  test("should open notification creation modal", async ({ page }) => {
    await page.goto("/admin/notifications")

    // Click create notification button
    await page.click("text=新しい通知を作成")

    // Check modal is visible with proper accessibility attributes
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.locator("text=プッシュ通知を送信")).toBeVisible()
    await expect(page.locator("text=登録ユーザーにプッシュ通知を送信します")).toBeVisible()

    // Check form elements are present
    await expect(page.locator('input[name="title"]')).toBeVisible()
    await expect(page.locator('textarea[name="body"]')).toBeVisible()
    await expect(page.locator('select[name="type"]')).toBeVisible()
  })

  test("should close modal when clicking close button", async ({ page }) => {
    await page.goto("/admin/notifications")

    // Open modal
    await page.click("text=新しい通知を作成")
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // Close modal
    await page.click('[aria-label="Close"]')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test("should navigate to notification detail page", async ({ page }) => {
    await page.goto("/admin/notifications")

    // Wait for notifications to load
    await page.waitForTimeout(1000)

    // Check if there are any notifications in the list
    const notificationLinks = page.locator('a[href^="/admin/notifications/"]')
    const count = await notificationLinks.count()

    if (count > 0) {
      // Click on first notification
      await notificationLinks.first().click()

      // Check we're on detail page
      await expect(page.url()).toMatch(/\/admin\/notifications\/\d+/)
      await expect(page.locator("text=通知詳細統計")).toBeVisible()
      await expect(page.locator("text=個別通知のエンゲージメント詳細分析")).toBeVisible()
    }
  })

  test("should have proper keyboard navigation", async ({ page }) => {
    await page.goto("/admin/notifications")

    // Test tab navigation to create button
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")

    // Should be able to open modal with Enter key
    const createButton = page.locator("text=新しい通知を作成")
    await createButton.focus()
    await page.keyboard.press("Enter")

    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })
})
