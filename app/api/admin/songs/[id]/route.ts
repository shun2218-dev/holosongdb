import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { createYouTubeAPI } from "@/lib/youtube-api"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const admin = await verifyAdminSession(sessionToken)
    if (!admin) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const data = await request.json()
    const {
      title,
      titleJp,
      titleEn,
      type,
      videoId,
      videoUrl,
      releaseDate,
      viewCount,
      likeCount,
      commentCount,
      lyrics,
      composer,
      arranger,
      mixer,
      illustrator,
      description,
      tags,
      language,
      talentIds,
      isGroupSong,
    } = data

    if (!title || !talentIds || talentIds.length === 0) {
      return NextResponse.json({ error: "タイトルと少なくとも1つのタレントは必須です" }, { status: 400 })
    }

    let finalVideoId = videoId
    if (videoUrl && !finalVideoId) {
      try {
        const youtubeAPI = createYouTubeAPI()
        finalVideoId = youtubeAPI.extractVideoId(videoUrl)
      } catch (error) {
        console.error("[v0] Failed to extract video ID:", error)
        const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
        if (videoIdMatch) {
          finalVideoId = videoIdMatch[1]
        }
      }
    }

    // First, update the song
    await sql`
      UPDATE songs SET
        title = ${title},
        title_jp = ${titleJp || null},
        title_en = ${titleEn || null},
        type = ${type},
        video_id = ${finalVideoId || null},
        video_url = ${videoUrl || null},
        release_date = ${releaseDate ? new Date(releaseDate) : null},
        view_count = ${viewCount || null},
        like_count = ${likeCount || null},
        comment_count = ${commentCount || null},
        lyrics = ${lyrics || null},
        composer = ${composer || null},
        arranger = ${arranger || null},
        mixer = ${mixer || null},
        illustrator = ${illustrator || null},
        description = ${description || null},
        tags = ${tags || []},
        language = ${language || null},
        is_group_song = ${isGroupSong || false},
        updated_at = NOW()
      WHERE id = ${params.id}
    `

    // Delete existing talent associations
    await sql`DELETE FROM song_talents WHERE song_id = ${params.id}`

    // Insert new talent associations
    for (const talentId of talentIds) {
      await sql`
        INSERT INTO song_talents (song_id, talent_id, created_at, updated_at)
        VALUES (${params.id}, ${talentId}, NOW(), NOW())
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating song:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("admin-session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    const admin = await verifyAdminSession(sessionToken)
    if (!admin) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 })
    }

    await sql`DELETE FROM songs WHERE id = ${params.id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting song:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
