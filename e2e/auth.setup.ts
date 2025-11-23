import { test as setup, expect } from "@playwright/test"

const authFile = "playwright/.auth/user.json"

setup("authenticate", async ({ page }) => {
  // Navigate to login page
  await page.goto("/admin/login")

  // Fill in login form
  await page.fill('input[name="username"]', "admin")
  await page.fill('input[name="password"]', "admin123")

  // Click login button
  await page.click('button[type="submit"]')

  // Wait for redirect to admin dashboard
  await page.waitForURL("/admin")

  // Verify we're logged in
  await expect(page.locator("text=管理ダッシュボード")).toBeVisible()

  // Save authentication state
  await page.context().storageState({ path: authFile })
})
