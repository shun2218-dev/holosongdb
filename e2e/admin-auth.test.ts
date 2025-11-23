import { test, expect } from "@playwright/test"

test.describe("Admin Authentication", () => {
  test("should login with valid credentials", async ({ page }) => {
    await page.goto("/admin/login")

    await page.fill('input[name="username"]', "admin")
    await page.fill('input[name="password"]', "admin123")
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL("/admin")
    await expect(page.locator("text=管理ダッシュボード")).toBeVisible()
  })

  test("should reject invalid credentials", async ({ page }) => {
    await page.goto("/admin/login")

    await page.fill('input[name="username"]', "admin")
    await page.fill('input[name="password"]', "wrongpassword")
    await page.click('button[type="submit"]')

    await expect(page.locator("text=ユーザー名またはパスワードが間違っています")).toBeVisible()
  })

  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/admin")
    await expect(page).toHaveURL("/admin/login")
  })
})
