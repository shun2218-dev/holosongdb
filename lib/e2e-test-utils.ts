// E2E Test utility functions

export interface E2ETestConfig {
  testType: string
  browser?: string
  headless?: boolean
  timeout?: number
  retries?: number
}

export interface E2ETestResult {
  success: boolean
  output: string
  error: string
  timestamp: string
  browser?: string
  passed?: number
  failed?: number
  skipped?: number
  duration?: number
  screenshots?: string[]
  videos?: string[]
}

export const E2E_TEST_TYPES = {
  AUTH: "auth",
  SONG_MANAGEMENT: "song-management",
  TALENT_MANAGEMENT: "talent-management",
  ANALYTICS: "analytics",
  PERFORMANCE: "performance",
  ACCESSIBILITY: "accessibility",
  MOBILE: "mobile",
  CROSS_BROWSER: "cross-browser",
  ALL: "all",
} as const

export const E2E_TEST_NAMES = {
  [E2E_TEST_TYPES.AUTH]: "認証テスト",
  [E2E_TEST_TYPES.SONG_MANAGEMENT]: "楽曲管理テスト",
  [E2E_TEST_TYPES.TALENT_MANAGEMENT]: "タレント管理テスト",
  [E2E_TEST_TYPES.ANALYTICS]: "分析画面テスト",
  [E2E_TEST_TYPES.PERFORMANCE]: "パフォーマンステスト",
  [E2E_TEST_TYPES.ACCESSIBILITY]: "アクセシビリティテスト",
  [E2E_TEST_TYPES.MOBILE]: "モバイル対応テスト",
  [E2E_TEST_TYPES.CROSS_BROWSER]: "クロスブラウザテスト",
  [E2E_TEST_TYPES.ALL]: "全E2Eテスト",
} as const

export const BROWSER_TYPES = {
  CHROMIUM: "chromium",
  FIREFOX: "firefox",
  WEBKIT: "webkit",
} as const

export function getTestTypeIcon(testType: string): string {
  switch (testType) {
    case E2E_TEST_TYPES.AUTH:
      return "shield"
    case E2E_TEST_TYPES.SONG_MANAGEMENT:
    case E2E_TEST_TYPES.TALENT_MANAGEMENT:
      return "database"
    case E2E_TEST_TYPES.ANALYTICS:
      return "bar-chart"
    case E2E_TEST_TYPES.PERFORMANCE:
      return "zap"
    case E2E_TEST_TYPES.ACCESSIBILITY:
      return "eye"
    case E2E_TEST_TYPES.MOBILE:
      return "smartphone"
    case E2E_TEST_TYPES.CROSS_BROWSER:
      return "globe"
    default:
      return "monitor"
  }
}

export function formatTestDuration(duration: number): string {
  if (duration < 1000) {
    return `${duration}ms`
  }
  return `${Math.round(duration / 1000)}秒`
}

export function getTestStatusColor(success: boolean): string {
  return success ? "text-green-600" : "text-red-600"
}

export function generateTestReport(result: E2ETestResult): string {
  let report = `E2Eテスト実行レポート\n`
  report += `実行時刻: ${new Date(result.timestamp).toLocaleString("ja-JP")}\n`
  report += `ブラウザ: ${result.browser || "chromium"}\n`
  report += `結果: ${result.success ? "成功" : "失敗"}\n`

  if (result.passed !== undefined) {
    report += `成功: ${result.passed}件\n`
  }
  if (result.failed !== undefined) {
    report += `失敗: ${result.failed}件\n`
  }
  if (result.skipped !== undefined) {
    report += `スキップ: ${result.skipped}件\n`
  }
  if (result.duration !== undefined) {
    report += `実行時間: ${formatTestDuration(result.duration)}\n`
  }

  report += `\n詳細出力:\n${result.output}`

  if (result.error) {
    report += `\n\nエラー:\n${result.error}`
  }

  return report
}

export function validateE2ETestConfig(config: E2ETestConfig): boolean {
  if (!config.testType) {
    return false
  }

  if (!Object.values(E2E_TEST_TYPES).includes(config.testType as any)) {
    return false
  }

  if (config.browser && !Object.values(BROWSER_TYPES).includes(config.browser as any)) {
    return false
  }

  return true
}

export function getRecommendedTestOrder(): string[] {
  return [
    E2E_TEST_TYPES.AUTH,
    E2E_TEST_TYPES.SONG_MANAGEMENT,
    E2E_TEST_TYPES.TALENT_MANAGEMENT,
    E2E_TEST_TYPES.ANALYTICS,
    E2E_TEST_TYPES.PERFORMANCE,
    E2E_TEST_TYPES.ACCESSIBILITY,
    E2E_TEST_TYPES.MOBILE,
    E2E_TEST_TYPES.CROSS_BROWSER,
  ]
}
