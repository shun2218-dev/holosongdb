import { test, expect } from "@playwright/test"

test.describe("Accessibility Tests", () => {
  test.use({ storageState: "playwright/.auth/user.json" })

  test("should have proper heading structure", async ({ page }) => {
    await page.goto("/admin")

    // Check for h1 element
    await expect(page.locator("h1")).toBeVisible()

    // Verify heading hierarchy
    const headings = await page.locator("h1, h2, h3, h4, h5, h6").all()
    expect(headings.length).toBeGreaterThan(0)
  })

  test("should have proper form labels", async ({ page }) => {
    await page.goto("/admin/songs")

    // Click add song button
    await page.click("text=楽曲を追加")

    // Check that form inputs have associated labels
    const titleInput = page.locator('input[name="title"]')
    await expect(titleInput).toHaveAttribute("aria-label")

    const artistInput = page.locator('input[name="artist"]')
    await expect(artistInput).toHaveAttribute("aria-label")
  })

  test("should have proper dialog accessibility attributes", async ({ page }) => {
    await page.goto("/admin/notifications")

    // Open notification creation modal
    await page.click("text=新しい通知を作成")

    // Check dialog has proper ARIA attributes
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Check for dialog title (required for accessibility)
    await expect(page.locator('[role="dialog"] h2')).toBeVisible()

    // Check for dialog description (required for accessibility)
    await expect(page.locator('[role="dialog"] p')).toBeVisible()
  })

  test("should support modal keyboard navigation", async ({ page }) => {
    await page.goto("/admin/songs")

    // Open song edit modal
    await page.click("text=楽曲を追加")

    // Check dialog has proper ARIA attributes
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Test Escape key closes modal
    await page.keyboard.press("Escape")
    await expect(dialog).not.toBeVisible()
  })

  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/admin")

    // Test tab navigation
    await page.keyboard.press("Tab")

    // Verify focus is visible
    const focusedElement = await page.locator(":focus")
    await expect(focusedElement).toBeVisible()
  })

  test("should have proper color contrast", async ({ page }) => {
    await page.goto("/admin")

    // Take screenshot for manual contrast checking
    await page.screenshot({ path: "test-results/contrast-check.png" })

    // Verify text is visible (basic contrast check)
    await expect(page.locator("body")).toHaveCSS("color", /rgb$$\d+,\s*\d+,\s*\d+$$/)
  })
})
