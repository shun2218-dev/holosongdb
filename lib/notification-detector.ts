import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface NotificationEvent {
  type: "song_milestone" | "talent_milestone" | "trending" | "weekly_report"
  targetId: string
  title: string
  message: string
  data?: any
}

export async function detectSongMilestones(): Promise<NotificationEvent[]> {
  const events: NotificationEvent[] = []

  // 最新の楽曲統計を取得
  const songs = await sql`
    SELECT s.id, s.title, s.view_count, s.like_count
    FROM songs s
    WHERE s.view_count >= 10000
  `

  for (const song of songs) {
    // 過去の最高記録を取得
    const lastRecord = await sql`
      SELECT view_count, like_count
      FROM song_statistics_history
      WHERE song_id = ${song.id}
      ORDER BY recorded_at DESC
      LIMIT 1
    `

    if (lastRecord.length > 0) {
      const previousViews = Number(lastRecord[0].view_count)
      const currentViews = Number(song.view_count)

      // 1万単位で節目を計算
      const previousMilestone = Math.floor(previousViews / 10000) * 10000
      const currentMilestone = Math.floor(currentViews / 10000) * 10000

      // 節目を超えた場合、最大の節目のみ通知
      if (currentMilestone > previousMilestone && currentMilestone >= 10000) {
        // 既に通知済みかチェック
        const alreadyNotified = await sql`
          SELECT id FROM notification_history
          WHERE type = 'song_milestone' 
          AND target_id = ${song.id}
          AND data->>'milestone' = ${currentMilestone.toString()}
        `

        if (alreadyNotified.length === 0) {
          events.push({
            type: "song_milestone",
            targetId: song.id,
            title: "楽曲が節目を達成！",
            message: `「${song.title}」が${(currentMilestone / 10000).toFixed(0)}万再生を突破しました！`,
            data: { milestone: currentMilestone, previousViews, currentViews },
          })
        }
      }
    }
  }

  return events
}

export async function detectTalentMilestones(): Promise<NotificationEvent[]> {
  const events: NotificationEvent[] = []

  const talents = await sql`
    SELECT t.id, t.name, t.subscriber_count
    FROM talents t
    WHERE t.subscriber_count >= 50000 AND t.active = true
  `

  for (const talent of talents) {
    const lastRecord = await sql`
      SELECT subscriber_count
      FROM talent_statistics_history
      WHERE talent_id = ${talent.id}
      ORDER BY recorded_at DESC
      LIMIT 1
    `

    if (lastRecord.length > 0) {
      const previousSubs = Number(lastRecord[0].subscriber_count)
      const currentSubs = Number(talent.subscriber_count)

      // 5万単位で節目を計算
      const previousMilestone = Math.floor(previousSubs / 50000) * 50000
      const currentMilestone = Math.floor(currentSubs / 50000) * 50000

      // 節目を超えた場合、最大の節目のみ通知
      if (currentMilestone > previousMilestone && currentMilestone >= 50000) {
        const alreadyNotified = await sql`
          SELECT id FROM notification_history
          WHERE type = 'talent_milestone' 
          AND target_id = ${talent.id}
          AND data->>'milestone' = ${currentMilestone.toString()}
        `

        if (alreadyNotified.length === 0) {
          events.push({
            type: "talent_milestone",
            targetId: talent.id,
            title: "タレントが節目を達成！",
            message: `${talent.name}が${(currentMilestone / 10000).toFixed(0)}万登録者を達成しました！`,
            data: { milestone: currentMilestone, previousSubs, currentSubs },
          })
        }
      }
    }
  }

  return events
}

// 急上昇楽曲検知
export async function detectTrendingSongs(): Promise<NotificationEvent[]> {
  const events: NotificationEvent[] = []
  const threshold = 0.5 // 50%以上の増加で急上昇とみなす
  const minIncrease = 100000 // 最低10万再生の増加が必要

  const songs = await sql`
    SELECT s.id, s.title, s.view_count
    FROM songs s
    WHERE s.view_count >= 100000
  `

  for (const song of songs) {
    // 24時間前のデータを取得
    const dayAgoRecord = await sql`
      SELECT view_count
      FROM song_statistics_history
      WHERE song_id = ${song.id}
      AND recorded_at >= NOW() - INTERVAL '25 hours'
      AND recorded_at <= NOW() - INTERVAL '23 hours'
      ORDER BY recorded_at DESC
      LIMIT 1
    `

    if (dayAgoRecord.length > 0) {
      const previousViews = Number(dayAgoRecord[0].view_count)
      const currentViews = Number(song.view_count)
      const increase = currentViews - previousViews
      const growthRate = increase / previousViews

      if (growthRate >= threshold && increase >= minIncrease) {
        // 今日既に通知済みかチェック
        const alreadyNotified = await sql`
          SELECT id FROM notification_history
          WHERE type = 'trending' 
          AND target_id = ${song.id}
          AND sent_at >= CURRENT_DATE
        `

        if (alreadyNotified.length === 0) {
          events.push({
            type: "trending",
            targetId: song.id,
            title: "楽曲が急上昇中！",
            message: `「${song.title}」が24時間で+${increase.toLocaleString()}再生の急上昇！`,
            data: { growthRate, increase, previousViews, currentViews },
          })
        }
      }
    }
  }

  return events
}

// 通知イベントを記録
export async function recordNotification(event: NotificationEvent): Promise<void> {
  await sql`
    INSERT INTO notification_history (type, target_id, title, message, data)
    VALUES (${event.type}, ${event.targetId}, ${event.title}, ${event.message}, ${JSON.stringify(event.data)})
  `
}
