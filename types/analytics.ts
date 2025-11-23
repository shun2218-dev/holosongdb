import type { SongType } from "@prisma/client"

export interface MonthlyTrend {
  month: string
  originalSongs: number
  coverSongs: number
  collaborations: number
  totalViews: number
  totalLikes: number
}

export interface BranchStat {
  branch: string
  totalSongs: number
  totalViews: number
  totalLikes: number
  averageViews: number
  color: string
}

export interface TopSong {
  id: string
  title: string
  artist: string
  views: number
  likes: number
  type: SongType
}

export interface TalentStat {
  id: string
  name: string
  name_jp: string | null
  branch: string
  totalSongs: number
  totalViews: number
  totalLikes: number
  averageViews: number
  subscriber_count: number | null
  main_color: string | null
}

export interface AnalyticsData {
  totalSongs: number
  totalTalents: number
  totalViews: number
  totalLikes: number
  monthlyTrends: MonthlyTrend[]
  branchStats: BranchStat[]
  topSongs: TopSong[]
  talentStats: TalentStat[]
}
