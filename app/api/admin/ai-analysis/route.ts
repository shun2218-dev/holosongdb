import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyAdminSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { generateText } from "ai"
import crypto from "crypto"

export const dynamic = "force-dynamic"

function generateDataHash(analyticsData: any): string {
  const dataString = JSON.stringify({
    totalSongs: analyticsData.totalSongs,
    totalTalents: analyticsData.totalTalents,
    totalViews: analyticsData.totalViews,
    totalLikes: analyticsData.totalLikes,
    branchStats: analyticsData.branchStats,
    talentStatsCount: analyticsData.talentStats?.length || 0,
    monthlyTrendsCount: analyticsData.monthlyTrends?.length || 0,
  })
  return crypto.createHash("sha256").update(dataString).digest("hex")
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

    const { analyticsData, forceRegenerate } = await request.json()

    if (!analyticsData) {
      return NextResponse.json({ error: "分析データが必要です" }, { status: 400 })
    }

    const dataHash = generateDataHash(analyticsData)

    // Check if analysis already exists for this data (unless force regenerate)
    if (!forceRegenerate) {
      const existingAnalysis = await sql`
        SELECT id, analysis_text, generated_at, analytics_data
        FROM ai_analysis_history 
        WHERE data_hash = ${dataHash}
        ORDER BY generated_at DESC 
        LIMIT 1
      `

      if (existingAnalysis.length > 0) {
        return NextResponse.json({
          analysis: existingAnalysis[0].analysis_text,
          generatedAt: existingAnalysis[0].generated_at,
          isFromCache: true,
          analysisId: existingAnalysis[0].id,
        })
      }
    }

    const modelName = process.env.GEMINI_MODEL || "google/gemini-2.0-flash"
    const fallbackModels = ["google/gemini-2.0-flash", "google/gemini-2.5-flash", "google/gemini-2.5-pro"]

    const prompt = `
あなたはHololiveの楽曲データベースの分析専門家です。以下のデータを基に、日本語で詳細な分析サマリーを作成してください。

## データ概要
- 総楽曲数: ${analyticsData.totalSongs}
- 総タレント数: ${analyticsData.totalTalents}
- 総再生数: ${analyticsData.totalViews?.toLocaleString()}
- 総いいね数: ${analyticsData.totalLikes?.toLocaleString()}

## タレント別パフォーマンス（上位5名）
${analyticsData.talentStats
  ?.slice(0, 5)
  .map(
    (talent: any, index: number) => `
${index + 1}. ${talent.nameJp || talent.name} (${talent.branch})
   - 総楽曲数: ${talent.totalSongs} (オリジナル: ${talent.originalSongs}, カバー: ${talent.coverSongs})
   - 総再生数: ${talent.totalViews?.toLocaleString()}
   - 平均再生数: ${talent.avgViews?.toLocaleString()}
   - オリジナル楽曲平均再生数: ${talent.avgOriginalViews?.toLocaleString()}
`,
  )
  .join("")}

## 支部別統計
${analyticsData.branchStats
  ?.map(
    (branch: any) => `
- ${branch.branch}: タレント${branch.talentCount}名, 楽曲${branch.totalSongs}曲, 総再生数${branch.totalViews?.toLocaleString()}
`,
  )
  .join("")}

## 人気楽曲（オリジナル上位3曲）
${analyticsData.topOriginalSongs
  ?.slice(0, 3)
  .map(
    (song: any, index: number) => `
${index + 1}. "${song.title}" by ${song.talentName} - ${song.viewCount?.toLocaleString()}回再生
`,
  )
  .join("")}

## 月別アップロード傾向（直近3ヶ月）
${analyticsData.monthlyTrends
  ?.slice(0, 3)
  .map(
    (trend: any) => `
- ${new Date(trend.month).toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}: ${trend.totalUploads}曲 (オリジナル: ${trend.originalUploads}, カバー: ${trend.coverUploads})
`,
  )
  .join("")}

以下の観点から分析してください：
1. **全体的なトレンド**: 楽曲投稿数や再生数の傾向
2. **タレントパフォーマンス**: 上位タレントの特徴や強み
3. **支部別特徴**: 各支部の特色や傾向
4. **楽曲タイプ分析**: オリジナルとカバーの比較
5. **成長機会**: 改善点や注目すべき点
6. **今後の予測**: データから読み取れる将来の傾向

分析は具体的な数値を交えて、マーケティングや戦略立案に役立つ洞察を提供してください。
回答は日本語で、見出しを使って構造化してください。
`

    let lastError = null
    let analysis = null

    for (const model of [modelName, ...fallbackModels.filter((m) => m !== modelName)]) {
      try {
        const result = await generateText({
          model,
          prompt,
          temperature: 0.7,
          maxTokens: 2048,
        })

        if (result.text) {
          analysis = result.text
          break
        }
      } catch (error) {
        lastError = error
        continue
      }
    }

    if (!analysis) {
      console.error("All AI Gateway models failed. Last error:", lastError)
      return NextResponse.json(
        {
          error: "AI分析の生成に失敗しました。利用可能なモデルがありません。",
        },
        { status: 500 },
      )
    }

    if (admin.id === "demo-admin-id") {
      await sql`
        INSERT INTO admins (id, username, email, password, role, active, created_at, updated_at)
        VALUES (
          'demo-admin-id',
          'admin',
          'admin@example.com',
          'demo-password-hash',
          'SUPER_ADMIN',
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO NOTHING
      `
    }

    const savedAnalysis = await sql`
      INSERT INTO ai_analysis_history (
        analysis_text, 
        analytics_data, 
        data_hash, 
        generated_by, 
        generated_at
      )
      VALUES (
        ${analysis}, 
        ${JSON.stringify(analyticsData)}, 
        ${dataHash}, 
        ${admin.id}, 
        NOW()
      )
      RETURNING id, generated_at
    `

    try {
      await sql`
        INSERT INTO admin_activity_log (action, target, admin_id, details, created_at, updated_at)
        VALUES ('AI_ANALYSIS_GENERATED', 'analytics', ${admin.id}, ${JSON.stringify({
          message: "AI分析サマリーを生成しました",
          analysisId: savedAnalysis[0].id,
          timestamp: new Date().toISOString(),
        })}, NOW(), NOW())
      `
    } catch (logError) {
      console.error("Failed to log AI analysis:", logError)
    }

    return NextResponse.json({
      analysis,
      generatedAt: savedAnalysis[0].generated_at,
      analysisId: savedAnalysis[0].id,
      isFromCache: false,
    })
  } catch (error) {
    console.error("Error generating AI analysis:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}

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

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const analyses = await sql`
      SELECT 
        h.id,
        h.analysis_text,
        h.generated_at,
        h.data_hash,
        h.generated_by,
        a.username as generated_by_username
      FROM ai_analysis_history h
      LEFT JOIN admins a ON h.generated_by = a.id
      ORDER BY h.generated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const totalCount = await sql`
      SELECT COUNT(*) as count FROM ai_analysis_history
    `

    return NextResponse.json({
      analyses,
      total: Number.parseInt(totalCount[0].count),
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching AI analysis history:", error)
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

    const { searchParams } = new URL(request.url)
    const analysisId = searchParams.get("id")

    if (!analysisId) {
      return NextResponse.json({ error: "分析IDが必要です" }, { status: 400 })
    }

    // Get the analysis to check permissions
    const analysis = await sql`
      SELECT generated_by FROM ai_analysis_history WHERE id = ${analysisId}
    `

    if (analysis.length === 0) {
      return NextResponse.json({ error: "分析が見つかりません" }, { status: 404 })
    }

    // Permission check: SUPER_ADMIN can delete all, ADMIN can only delete their own
    if (admin.role !== "SUPER_ADMIN" && analysis[0].generated_by !== admin.id) {
      return NextResponse.json({ error: "この分析を削除する権限がありません" }, { status: 403 })
    }

    // Delete the analysis
    await sql`
      DELETE FROM ai_analysis_history WHERE id = ${analysisId}
    `

    // Log the deletion
    try {
      await sql`
        INSERT INTO admin_activity_log (action, target, admin_id, details, created_at, updated_at)
        VALUES ('AI_ANALYSIS_DELETED', 'analytics', ${admin.id}, ${JSON.stringify({
          message: "AI分析履歴を削除しました",
          analysisId: analysisId,
          timestamp: new Date().toISOString(),
        })}, NOW(), NOW())
      `
    } catch (logError) {
      console.error("Failed to log AI analysis deletion:", logError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting AI analysis:", error)
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 })
  }
}
