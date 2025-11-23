import { neon } from "@neondatabase/serverless"
import type { DatabaseRow } from "@/types/database"

const sql = neon(process.env.DATABASE_URL!)

interface ScheduleConfig {
  songType: "original" | "cover"
  dayOfWeek: number // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
  hour: number
  minute: number
}

interface SubscriberScheduleConfig {
  type: "subscriber_counts"
  dayOfWeek: number // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
  hour: number
  minute: number
}

interface UpdateHistoryItem {
  id: string
  songType: string
  updatedCount: number
  totalCount: number
  success: boolean
  error?: string
  timestamp: string
}

interface ActivityLogRow extends DatabaseRow {
  id: string
  details: string | object
  created_at: string
}

export const SCHEDULE_CONFIG: ScheduleConfig[] = [
  {
    songType: "original",
    dayOfWeek: -1, // Every day
    hour: 0, // 0, 8, 16時
    minute: 0,
  },
  {
    songType: "cover",
    dayOfWeek: -1, // Every day
    hour: 1, // 1, 9, 17時 (1時間ずらし)
    minute: 0,
  },
]

export const SUBSCRIBER_SCHEDULE_CONFIG: SubscriberScheduleConfig = {
  type: "subscriber_counts",
  dayOfWeek: -1, // Every day
  hour: 2, // 2, 10, 18時 (2時間ずらし)
  minute: 0,
}

/**
 * Check if it's time to run statistics update for a given song type (8-hour intervals)
 */
export function shouldRunUpdate(songType: "original" | "cover"): boolean {
  const now = new Date()
  const config = SCHEDULE_CONFIG.find((c) => c.songType === songType)

  if (!config) {
    return false
  }

  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  // オリジナル曲: 0, 8, 16時
  // カバー曲: 1, 9, 17時
  const validHours = songType === "original" ? [0, 8, 16] : [1, 9, 17]

  return (
    validHours.includes(currentHour) && currentMinute >= config.minute && currentMinute < config.minute + 5 // 5-minute window
  )
}

/**
 * Check if it's time to run subscriber count update (8-hour intervals)
 */
export function shouldRunSubscriberUpdate(): boolean {
  const now = new Date()
  const config = SUBSCRIBER_SCHEDULE_CONFIG

  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  // 登録者数: 2, 10, 18時
  const validHours = [2, 10, 18]

  return (
    validHours.includes(currentHour) && currentMinute >= config.minute && currentMinute < config.minute + 5 // 5-minute window
  )
}

/**
 * Get the next scheduled update time for a song type (8-hour intervals)
 */
export function getNextUpdateTime(songType: "original" | "cover"): Date {
  const now = new Date()
  const nextUpdate = new Date()

  // オリジナル曲: 0, 8, 16時
  // カバー曲: 1, 9, 17時
  const validHours = songType === "original" ? [0, 8, 16] : [1, 9, 17]

  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  // Find next valid hour
  let nextHour = validHours.find((h) => h > currentHour || (h === currentHour && currentMinute < 0))

  if (!nextHour) {
    // Next day, first hour
    nextHour = validHours[0]
    nextUpdate.setDate(now.getDate() + 1)
  }

  nextUpdate.setHours(nextHour, 0, 0, 0)

  return nextUpdate
}

/**
 * Get the next scheduled subscriber count update time (8-hour intervals)
 */
export function getNextSubscriberUpdateTime(): Date {
  const now = new Date()
  const nextUpdate = new Date()

  // 登録者数: 2, 10, 18時
  const validHours = [2, 10, 18]

  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  // Find next valid hour
  let nextHour = validHours.find((h) => h > currentHour || (h === currentHour && currentMinute < 0))

  if (!nextHour) {
    // Next day, first hour
    nextHour = validHours[0]
    nextUpdate.setDate(now.getDate() + 1)
  }

  nextUpdate.setHours(nextHour, 0, 0, 0)

  return nextUpdate
}

/**
 * Log statistics update activity
 */
export async function logUpdateActivity(
  songType: string,
  updatedCount: number,
  totalCount: number,
  success: boolean,
  error?: string,
): Promise<void> {
  try {
    await sql`
      INSERT INTO admin_activity_log (
        action,
        target,
        admin_id,
        details,
        created_at
      ) VALUES (
        'statistics_update',
        ${`${songType}_songs`},
        'system',
        ${JSON.stringify({
          songType,
          updatedCount,
          totalCount,
          success,
          error: error || null,
          timestamp: new Date().toISOString(),
        })},
        NOW()
      )
    `
  } catch (logError) {
    console.error("[v0] Failed to log update activity:", logError)
    // Don't throw here to avoid breaking the main update process
  }
}

/**
 * Get statistics update history
 */
export async function getUpdateHistory(limit = 10): Promise<UpdateHistoryItem[]> {
  try {
    const results = await sql`
      SELECT 
        id,
        details,
        created_at
      FROM admin_activity_log 
      WHERE action IN ('statistics_update', 'subscriber_count_update')
      ORDER BY created_at DESC
      LIMIT ${limit}
    `

    return results.map((row: ActivityLogRow): UpdateHistoryItem => {
      const details = typeof row.details === "string" ? JSON.parse(row.details) : row.details
      return {
        id: row.id,
        songType: details.songType || "subscriber_counts",
        updatedCount: details.updatedCount,
        totalCount: details.totalCount,
        success: details.success,
        error: details.error,
        timestamp: row.created_at,
      }
    })
  } catch (error) {
    console.error("[v0] Failed to fetch update history:", error)
    return []
  }
}

/**
 * Format schedule information for display (8-hour intervals)
 */
export function formatScheduleInfo(): string {
  const scheduleInfo = [
    "オリジナル曲: 毎日 0:00, 8:00, 16:00",
    "カバー曲: 毎日 1:00, 9:00, 17:00",
    "登録者数: 毎日 2:00, 10:00, 18:00",
  ]

  return scheduleInfo.join("\n")
}
