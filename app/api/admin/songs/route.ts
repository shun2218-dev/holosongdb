import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { nanoid } from "nanoid"
import { createYouTubeAPI } from "@/lib/youtube-api"
import { invalidateSongsCache } from "@/lib/cache-utils"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
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

    const result = await sql`
      SELECT 
        s.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', t.id,
              'name', t.name,
              'name_jp', t.name_jp,
              'name_en', t.name_en,
              'branch', t.branch
            ) ORDER BY t.name
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as talents
      FROM songs s
      LEFT JOIN song_talents st ON s.id = st.song_id
      LEFT JOIN talents t ON st.talent_id = t.id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `

    let songs = []
    if (Array.isArray(result)) {
      songs = result
    } else if (result && typeof result === "object") {
      songs = [result]
    }

    const formattedSongs = songs.map((song: any) => ({
      id: song.id,
      title: song.title,
      titleJp: song.title_jp,
      titleEn: song.title_en,
      type: song.type,
      videoId: song.video_id,
      videoUrl: song.video_url,
      releaseDate: song.release_date,
      viewCount: song.view_count?.toString() || "0",
      likeCount: song.like_count?.toString() || "0",
      commentCount: song.comment_count?.toString() || "0",
      lyrics: song.lyrics,
      composer: song.composer,
      arranger: song.arranger,
      mixer: song.mixer,
      illustrator: song.illustrator,
      description: song.description,
      tags: song.tags || [],
      language: song.language,
      talents: Array.isArray(song.talents) ? song.talents : [],
      isGroupSong: song.is_group_song || false,
    }))

    return NextResponse.json({ songs: formattedSongs })
  } catch (error) {
    console.error("[v0] Error fetching songs:", error)
    return NextResponse.json(
      {
        error: "サーバーエラーが発生しました",
        songs: [],
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
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

    const songId = nanoid()

    await sql`
      WITH inserted_song AS (
        INSERT INTO songs (
          id, title, title_jp, title_en, type, video_id, video_url, 
          release_date, view_count, like_count, comment_count,
          lyrics, composer, arranger, mixer, illustrator, description,
          tags, language, talent_id, is_group_song, created_at, updated_at
        ) VALUES (
          ${songId}, ${title}, ${titleJp || null}, ${titleEn || null}, ${type},
          ${finalVideoId || null}, ${videoUrl || null}, 
          ${releaseDate ? new Date(releaseDate) : null},
          ${viewCount || null}, ${likeCount || null}, ${commentCount || null},
          ${lyrics || null}, ${composer || null}, ${arranger || null}, 
          ${mixer || null}, ${illustrator || null}, ${description || null},
          ${tags || []}, ${language || null}, ${talentIds[0]},
          ${isGroupSong || false}, NOW(), NOW()
        )
        RETURNING id
      ),
      inserted_talents AS (
        INSERT INTO song_talents (song_id, talent_id, created_at, updated_at)
        SELECT ${songId}, unnest(${talentIds}::text[]), NOW(), NOW()
        ON CONFLICT (song_id, talent_id) DO NOTHING
        RETURNING song_id
      )
      SELECT 1 as success
    `

    await invalidateSongsCache()

    return NextResponse.json({ success: true, id: songId })
  } catch (error) {
    console.error("[v0] Error creating song:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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

    const url = new URL(request.url)
    const songId = url.pathname.split("/").pop()

    if (!songId) {
      return NextResponse.json({ error: "楽曲IDが必要です" }, { status: 400 })
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
        talent_id = ${talentIds[0]},
        is_group_song = ${isGroupSong || false},
        updated_at = NOW()
      WHERE id = ${songId}
    `

    await sql`DELETE FROM song_talents WHERE song_id = ${songId}`

    if (talentIds.length > 0) {
      await sql`
        INSERT INTO song_talents (song_id, talent_id, created_at, updated_at)
        SELECT ${songId}, unnest(${talentIds}::text[]), NOW(), NOW()
      `
    }

    await invalidateSongsCache()

    return NextResponse.json({ success: true, message: "楽曲を更新しました" })
  } catch (error) {
    console.error("[v0] Error updating song:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    const url = new URL(request.url)
    const songId = url.pathname.split("/").pop()

    if (!songId) {
      return NextResponse.json({ error: "楽曲IDが必要です" }, { status: 400 })
    }

    await sql`DELETE FROM song_talents WHERE song_id = ${songId}`

    const result = await sql`DELETE FROM songs WHERE id = ${songId}`

    if (Array.isArray(result) && result.length === 0) {
      return NextResponse.json({ error: "楽曲が見つかりません" }, { status: 404 })
    }

    await invalidateSongsCache()

    return NextResponse.json({ success: true, message: "楽曲を削除しました" })
  } catch (error) {
    console.error("[v0] Error deleting song:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
