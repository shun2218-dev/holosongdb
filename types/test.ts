export interface TestResult {
  id: string
  testName: string
  status: "passed" | "failed" | "running"
  duration: number
  error?: string
  details?: string
  timestamp: string
}

export interface StoredTestResult extends TestResult {
  adminId: string
  adminUsername: string
}

export interface E2ETestResult {
  id: string
  testType: string
  testName: string
  status: "passed" | "failed" | "running" | "skipped"
  duration: number
  error?: string
  details?: string
  timestamp: string
  screenshots?: string[]
  logs?: string[]
  metrics?: {
    pageLoadTime?: number
    networkRequests?: number
    jsErrors?: number
  }
}

export interface StoredE2ETestResult extends E2ETestResult {
  adminId: string
  adminUsername: string
}
