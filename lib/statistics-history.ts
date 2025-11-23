import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// 楽曲統計の履歴を記録
export async function recordSongStatistics(): Promise<void> {
  console.log("[v0] Recording song statistics history...")

  const songs = await sql`
    SELECT id, view_count, like_count, comment_count
    FROM songs
    WHERE view_count > 0
  `

  for (const song of songs) {
    await sql`
      INSERT INTO song_statistics_history (song_id, view_count, like_count, comment_count)
      VALUES (${song.id}, ${song.view_count}, ${song.like_count}, ${song.comment_count})
      ON CONFLICT (song_id, recorded_at) DO NOTHING
    `
  }

  console.log(`[v0] Recorded statistics for ${songs.length} songs`)
}

// タレント統計の履歴を記録
export async function recordTalentStatistics(): Promise<void> {
  console.log("[v0] Recording talent statistics history...")

  const talents = await sql`
    SELECT id, subscriber_count
    FROM talents
    WHERE subscriber_count > 0 AND active = true
  `

  for (const talent of talents) {
    await sql`
      INSERT INTO talent_statistics_history (talent_id, subscriber_count)
      VALUES (${talent.id}, ${talent.subscriber_count})
      ON CONFLICT (talent_id, recorded_at) DO NOTHING
    `
  }

  console.log(`[v0] Recorded statistics for ${talents.length} talents`)
}

// 古い履歴データのクリーンアップ（90日以上前のデータを削除）
export async function cleanupOldHistory(): Promise<void> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 90)

  await sql`
    DELETE FROM song_statistics_history
    WHERE recorded_at < ${cutoffDate.toISOString()}
  `

  await sql`
    DELETE FROM talent_statistics_history
    WHERE recorded_at < ${cutoffDate.toISOString()}
  `

  console.log("[v0] Cleaned up old history data")
}
