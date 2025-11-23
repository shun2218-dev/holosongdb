import jest from "jest"
import "@testing-library/jest-dom"

// Mock environment variables
process.env.YOUTUBE_API_KEY = "test-api-key"
process.env.DATABASE_URL = "test-database-url"
process.env.JWT_SECRET = "test-jwt-secret"

// Mock fetch globally
global.fetch = jest.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}
