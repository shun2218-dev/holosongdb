import { sql } from "@/lib/db"

export interface NotificationData {
  type: "milestone" | "surge" | "subscriber_milestone"
  title: string
  message: string
  data?: any
}

export class NotificationService {
  // Save song statistics history
  static async saveSongStatistics(songId: string, viewCount: bigint, likeCount: bigint, commentCount: bigint) {
    try {
      await sql`
        INSERT INTO song_statistics_history (song_id, view_count, like_count, comment_count, recorded_at)
        VALUES (${songId}, ${viewCount}, ${likeCount}, ${commentCount}, NOW())
      `
    } catch (error) {
      console.error(`[v0] Failed to save song statistics history for ${songId}:`, error)
    }
  }

  // Save talent statistics history
  static async saveTalentStatistics(talentId: string, subscriberCount: bigint) {
    try {
      await sql`
        INSERT INTO talent_statistics_history (talent_id, subscriber_count, recorded_at)
        VALUES (${talentId}, ${subscriberCount}, NOW())
      `
    } catch (error) {
      console.error(`[v0] Failed to save talent statistics history for ${talentId}:`, error)
    }
  }

  // Check for milestone achievements
  static async checkSongMilestones(songId: string, currentViews: bigint): Promise<NotificationData[]> {
    const notifications: NotificationData[] = []

    try {
      const songResult = await sql`
        SELECT title, view_count FROM songs WHERE id = ${songId}
      `

      if (songResult.length === 0) return notifications

      const song = songResult[0]
      const previousViews = BigInt(song.view_count || 0)

      // Check for milestone achievements (1M, 5M, 10M, etc.)
      const milestones = [1000000n, 5000000n, 10000000n, 50000000n, 100000000n]

      for (const milestone of milestones) {
        if (previousViews < milestone && currentViews >= milestone) {
          // Check if we already sent this notification
          const existingNotification = await sql`
            SELECT id FROM notification_history 
            WHERE type = 'milestone' 
            AND target_id = ${songId} 
            AND milestone_value = ${milestone.toString()}
          `

          if (existingNotification.length === 0) {
            notifications.push({
              type: "milestone",
              title: "再生数の節目達成！",
              message: `「${song.title}」が${this.formatNumber(milestone)}再生を突破しました！`,
              data: { songId, milestone: milestone.toString(), views: currentViews.toString() },
            })

            // Record notification
            await sql`
              INSERT INTO notification_history (type, target_id, milestone_value, sent_at)
              VALUES ('milestone', ${songId}, ${milestone.toString()}, NOW())
            `
          }
        }
      }
    } catch (error) {
      console.error(`[v0] Failed to check song milestones for ${songId}:`, error)
    }

    return notifications
  }

  // Check for view count surge (24h increase)
  static async checkSongSurge(songId: string, currentViews: bigint): Promise<NotificationData[]> {
    const notifications: NotificationData[] = []

    try {
      // Get views from 24 hours ago
      const yesterdayStats = await sql`
        SELECT view_count FROM song_statistics_history 
        WHERE song_id = ${songId} 
        AND recorded_at >= NOW() - INTERVAL '24 hours'
        ORDER BY recorded_at ASC
        LIMIT 1
      `

      if (yesterdayStats.length === 0) return notifications

      const yesterdayViews = BigInt(yesterdayStats[0].view_count)
      const increase = currentViews - yesterdayViews
      const increasePercent = Number((increase * 100n) / yesterdayViews)

      // Trigger if 50% increase and at least 100k new views
      if (increasePercent >= 50 && increase >= 100000n) {
        const songResult = await sql`SELECT title FROM songs WHERE id = ${songId}`
        if (songResult.length > 0) {
          notifications.push({
            type: "surge",
            title: "楽曲が急上昇中！",
            message: `「${songResult[0].title}」が24時間で${this.formatNumber(increase)}再生増加しました！`,
            data: { songId, increase: increase.toString(), percent: increasePercent },
          })
        }
      }
    } catch (error) {
      console.error(`[v0] Failed to check song surge for ${songId}:`, error)
    }

    return notifications
  }

  // Check subscriber milestones
  static async checkSubscriberMilestones(talentId: string, currentCount: bigint): Promise<NotificationData[]> {
    const notifications: NotificationData[] = []

    try {
      const talentResult = await sql`
        SELECT name, subscriber_count FROM talents WHERE id = ${talentId}
      `

      if (talentResult.length === 0) return notifications

      const talent = talentResult[0]
      const previousCount = BigInt(talent.subscriber_count || 0)

      // Check for subscriber milestones
      const milestones = [100000n, 500000n, 1000000n, 2000000n, 3000000n, 5000000n]

      for (const milestone of milestones) {
        if (previousCount < milestone && currentCount >= milestone) {
          const existingNotification = await sql`
            SELECT id FROM notification_history 
            WHERE type = 'subscriber_milestone' 
            AND target_id = ${talentId} 
            AND milestone_value = ${milestone.toString()}
          `

          if (existingNotification.length === 0) {
            notifications.push({
              type: "subscriber_milestone",
              title: "登録者数の節目達成！",
              message: `${talent.name}が${this.formatNumber(milestone)}登録者を達成しました！`,
              data: { talentId, milestone: milestone.toString(), count: currentCount.toString() },
            })

            await sql`
              INSERT INTO notification_history (type, target_id, milestone_value, sent_at)
              VALUES ('subscriber_milestone', ${talentId}, ${milestone.toString()}, NOW())
            `
          }
        }
      }
    } catch (error) {
      console.error(`[v0] Failed to check subscriber milestones for ${talentId}:`, error)
    }

    return notifications
  }

  // Send push notification using Web Push API
  static async sendPushNotification(notification: NotificationData) {
    try {
      // Get talent_id based on notification type
      let talentId: string | null = null

      if (notification.type === "subscriber_milestone") {
        // For subscriber milestones, talent_id is in the data
        talentId = notification.data?.talentId
      } else if (notification.type === "milestone" || notification.type === "surge") {
        // For song milestones/surge, get talent_id from the song
        const songId = notification.data?.songId
        if (songId) {
          const songResult = await sql`
            SELECT talent_id FROM songs WHERE id = ${songId}
          `
          if (songResult.length > 0) {
            talentId = songResult[0].talent_id
          }
        }
      }

      // Get active subscriptions with oshi filtering
      let subscriptions

      if (talentId) {
        // Get subscriptions where user has this talent as oshi OR has no oshi preferences (receive all)
        subscriptions = await sql`
          SELECT DISTINCT ps.endpoint, ps.p256dh_key, ps.auth_key 
          FROM push_subscriptions ps
          WHERE ps.active = true
          AND (
            -- User has this talent as oshi
            EXISTS (
              SELECT 1 FROM user_oshi_preferences uop
              WHERE uop.user_id = ps.user_id
              AND uop.talent_id = ${talentId}
            )
            -- OR user has no oshi preferences (receive all notifications)
            OR NOT EXISTS (
              SELECT 1 FROM user_oshi_preferences uop
              WHERE uop.user_id = ps.user_id
            )
          )
        `
      } else {
        // If no talent_id, send to all active subscriptions
        subscriptions = await sql`
          SELECT endpoint, p256dh_key, auth_key 
          FROM push_subscriptions 
          WHERE active = true
        `
      }

      if (subscriptions.length === 0) {
        return
      }

      // Send notification to each subscription
      const sendPromises = subscriptions.map(async (sub) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/push/send`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subscription: {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh_key,
                  auth: sub.auth_key,
                },
              },
              notification,
            }),
          })

          if (!response.ok) {
            throw new Error(`Push send failed: ${response.statusText}`)
          }
        } catch (error) {
          console.error(`[v0] Failed to send push to ${sub.endpoint}:`, error)
        }
      })

      await Promise.allSettled(sendPromises)
    } catch (error) {
      console.error("[v0] Failed to send push notifications:", error)
    }
  }

  // Format large numbers
  private static formatNumber(num: bigint): string {
    const n = Number(num)
    if (n >= 100000000) return `${Math.floor(n / 10000000)}千万`
    if (n >= 10000000) return `${Math.floor(n / 1000000)}千万`
    if (n >= 1000000) return `${Math.floor(n / 10000)}万`
    if (n >= 10000) return `${Math.floor(n / 1000)}千`
    return n.toString()
  }
}
