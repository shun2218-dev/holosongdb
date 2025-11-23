export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  totalCount: number
  hasMore: boolean
  offset: number
  limit: number
}

export interface YouTubeVideoStatistics {
  view_count: string
  like_count: string
  comment_count: string
}

export interface YouTubeVideoResponse {
  items: Array<{
    id: string
    statistics: YouTubeVideoStatistics
  }>
}

export interface YouTubeChannelStatistics {
  subscriber_count: string
  video_count: string
  view_count: string
}

export interface YouTubeChannelResponse {
  items: Array<{
    id: string
    statistics: YouTubeChannelStatistics
  }>
}

export interface YouTubeSearchItem {
  id: {
    kind: string
    video_id?: string
    channel_id?: string
    playlist_id?: string
  }
  snippet: {
    published_at: string
    channel_id: string
    title: string
    description: string
    thumbnails: {
      default: { url: string; width: number; height: number }
      medium: { url: string; width: number; height: number }
      high: { url: string; width: number; height: number }
    }
    channel_title: string
    live_broadcast_content: string
  }
}

export interface YouTubeSearchResponse {
  items: YouTubeSearchItem[]
}

export interface YouTubeVideoDetails {
  id: string
  snippet: {
    published_at: string
    channel_id: string
    title: string
    description: string
    thumbnails: {
      default: { url: string; width: number; height: number }
      medium: { url: string; width: number; height: number }
      high: { url: string; width: number; height: number }
      standard?: { url: string; width: number; height: number }
      maxres?: { url: string; width: number; height: number }
    }
    channel_title: string
    tags?: string[]
    category_id: string
    live_broadcast_content: string
    default_language?: string
    default_audio_language?: string
  }
  statistics: YouTubeVideoStatistics
}

export interface YouTubeVideoDetailsResponse {
  items: YouTubeVideoDetails[]
}
