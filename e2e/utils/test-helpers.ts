import { type Page, expect } from "@playwright/test"

export class AdminTestHelpers {
  constructor(private page: Page) {}

  async loginAsAdmin(username = "admin", password = "admin123") {
    await this.page.goto("/admin/login")
    await this.page.fill('input[name="username"]', username)
    await this.page.fill('input[name="password"]', password)
    await this.page.click('button[type="submit"]')
    await expect(this.page).toHaveURL("/admin")
  }

  async navigateToSongManagement() {
    await this.page.goto("/admin/songs")
    await expect(this.page.locator("h1")).toContainText("楽曲管理")
  }

  async navigateToTalentManagement() {
    await this.page.goto("/admin/talents")
    await expect(this.page.locator("h1")).toContainText("タレント管理")
  }

  async navigateToAnalytics() {
    await this.page.goto("/admin/analytics")
    await expect(this.page.locator("h1")).toContainText("データ分析")
  }

  async addSong(songData: {
    title: string
    artist: string
    youtubeUrl: string
    songType?: string
  }) {
    await this.navigateToSongManagement()
    await this.page.click("text=楽曲を追加")

    await this.page.fill('input[name="title"]', songData.title)
    await this.page.fill('input[name="artist"]', songData.artist)
    await this.page.fill('input[name="youtubeUrl"]', songData.youtubeUrl)

    if (songData.songType) {
      await this.page.click('button[role="combobox"]')
      await this.page.click(`text=${songData.songType}`)
    }

    await this.page.click('button[type="submit"]')
    await expect(this.page.locator("text=楽曲が正常に追加されました")).toBeVisible()
  }

  async addTalent(talentData: {
    name: string
    nameJp: string
    channelId: string
    branch?: string
    debutDate?: string
    mainColor?: string
  }) {
    await this.navigateToTalentManagement()
    await this.page.click("text=タレントを追加")

    await this.page.fill('input[name="name"]', talentData.name)
    await this.page.fill('input[name="nameJp"]', talentData.nameJp)
    await this.page.fill('input[name="channelId"]', talentData.channelId)

    if (talentData.branch) {
      await this.page.click('button[role="combobox"]')
      await this.page.click(`text=${talentData.branch}`)
    }

    if (talentData.debutDate) {
      await this.page.fill('input[name="debutDate"]', talentData.debutDate)
    }

    if (talentData.mainColor) {
      await this.page.fill('input[name="mainColor"]', talentData.mainColor)
    }

    await this.page.click('button[type="submit"]')
    await expect(this.page.locator("text=タレントが正常に追加されました")).toBeVisible()
  }

  async waitForLoadingToComplete() {
    await this.page.waitForLoadState("networkidle")
    await this.page.waitForTimeout(1000) // Additional wait for animations
  }

  async takeScreenshotOnFailure(testName: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const filename = `failure-${testName}-${timestamp}.png`
    await this.page.screenshot({ path: `test-results/${filename}`, fullPage: true })
    return filename
  }

  async checkAccessibility() {
    // Basic accessibility checks
    const headings = await this.page.locator("h1, h2, h3, h4, h5, h6").count()
    expect(headings).toBeGreaterThan(0)

    // Check for proper form labels
    const inputs = await this.page.locator("input").all()
    for (const input of inputs) {
      const hasLabel =
        (await input.getAttribute("aria-label")) ||
        (await input.getAttribute("aria-labelledby")) ||
        (await this.page.locator(`label[for="${await input.getAttribute("id")}"]`).count()) > 0
      expect(hasLabel).toBeTruthy()
    }
  }

  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now()
    await this.page.waitForLoadState("domcontentloaded")
    return Date.now() - startTime
  }

  async testKeyboardNavigation() {
    await this.page.keyboard.press("Tab")
    const focusedElement = await this.page.locator(":focus")
    await expect(focusedElement).toBeVisible()
  }

  async testMobileResponsiveness() {
    await this.page.setViewportSize({ width: 375, height: 667 })
    await this.waitForLoadingToComplete()

    // Check if mobile menu is visible
    const mobileMenu = this.page.locator('[data-testid="mobile-menu-button"]')
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click()
      await expect(this.page.locator('[data-testid="mobile-menu"]')).toBeVisible()
    }
  }
}

export class PerformanceTestHelpers {
  constructor(private page: Page) {}

  async measureMetrics() {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName("first-paint")[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName("first-contentful-paint")[0]?.startTime || 0,
      }
    })

    return metrics
  }

  async checkPageSize() {
    const response = await this.page.goto(this.page.url())
    const contentLength = response?.headers()["content-length"]
    return contentLength ? Number.parseInt(contentLength) : 0
  }

  async countNetworkRequests() {
    let requestCount = 0
    this.page.on("request", () => requestCount++)
    await this.page.reload()
    await this.page.waitForLoadState("networkidle")
    return requestCount
  }
}
