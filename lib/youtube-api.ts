import type {
  YouTubeVideoStatistics,
  YouTubeVideoResponse,
  YouTubeChannelStatistics,
  YouTubeChannelResponse,
  YouTubeSearchResult,
  YouTubeSearchResponse,
  YouTubeVideoDetails,
  YouTubeVideoDetailsResponse,
} from "@/types/api"

export class YouTubeAPI {
  private apiKey: string
  private baseUrl = "https://www.googleapis.com/youtube/v3"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }
    return null
  }

  /**
   * Extract channel ID from YouTube channel URL
   */
  extractChannelId(url: string): string | null {
    const patterns = [
      /youtube\.com\/channel\/([^/?&\n]+)/,
      /youtube\.com\/c\/([^/?&\n]+)/,
      /youtube\.com\/user\/([^/?&\n]+)/,
      /youtube\.com\/@([^/?&\n]+)/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) {
        return match[1]
      }
    }
    return null
  }

  /**
   * Search YouTube videos by query and optional channel ID
   */
  async searchVideos(query: string, channelId?: string, maxResults = 10): Promise<YouTubeSearchResult[]> {
    const url = new URL(`${this.baseUrl}/search`)
    url.searchParams.set("part", "snippet")
    url.searchParams.set("q", query)
    url.searchParams.set("type", "video")
    url.searchParams.set("maxResults", maxResults.toString())
    url.searchParams.set("order", "relevance")
    url.searchParams.set("key", this.apiKey)

    if (channelId) {
      url.searchParams.set("channelId", channelId)
    }

    try {
      const response = await fetch(url.toString())

      if (!response.ok) {
        let errorMessage = `YouTube Search API error: ${response.status} ${response.statusText}`
        try {
          const errorBody = await response.text()
          console.error(`[v0] YouTube Search API error response:`, errorBody)

          try {
            const errorJson = JSON.parse(errorBody)
            if (errorJson.error?.message) {
              errorMessage += ` - ${errorJson.error.message}`
            }
            if (errorJson.error?.errors?.[0]?.reason) {
              errorMessage += ` (${errorJson.error.errors[0].reason})`
            }
          } catch {
            errorMessage += ` - ${errorBody.substring(0, 200)}`
          }
        } catch {
          // If we can't read the response body, just use the status
        }

        throw new Error(errorMessage)
      }

      const data: YouTubeSearchResponse = await response.json()

      return data.items || []
    } catch (error) {
      console.error("[v0] Failed to search YouTube:", error)
      throw error
    }
  }

  /**
   * Get detailed video information including statistics
   */
  async getVideoDetails(videoId: string): Promise<YouTubeVideoDetails | null> {
    const url = new URL(`${this.baseUrl}/videos`)
    url.searchParams.set("part", "snippet,statistics")
    url.searchParams.set("id", videoId)
    url.searchParams.set("key", this.apiKey)

    try {
      const response = await fetch(url.toString())

      if (!response.ok) {
        let errorMessage = `YouTube Video Details API error: ${response.status} ${response.statusText}`
        try {
          const errorBody = await response.text()
          console.error(`[v0] YouTube Video Details API error response:`, errorBody)

          try {
            const errorJson = JSON.parse(errorBody)
            if (errorJson.error?.message) {
              errorMessage += ` - ${errorJson.error.message}`
            }
            if (errorJson.error?.errors?.[0]?.reason) {
              errorMessage += ` (${errorJson.error.errors[0].reason})`
            }
          } catch {
            errorMessage += ` - ${errorBody.substring(0, 200)}`
          }
        } catch {
          // If we can't read the response body, just use the status
        }

        throw new Error(errorMessage)
      }

      const data: YouTubeVideoDetailsResponse = await response.json()

      if (data.items && data.items.length > 0) {
        const item = data.items[0]
        return {
          id: item.id,
          snippet: item.snippet,
          statistics: item.statistics,
        }
      }

      return null
    } catch (error) {
      console.error("[v0] Failed to get video details:", error)
      throw error
    }
  }

  /**
   * Get statistics for multiple videos in a single API call
   */
  async getVideoStatistics(videoIds: string[]): Promise<Map<string, YouTubeVideoStatistics>> {
    if (videoIds.length === 0) {
      return new Map()
    }

    const url = new URL(`${this.baseUrl}/videos`)
    url.searchParams.set("part", "statistics")
    url.searchParams.set("id", videoIds.join(","))
    url.searchParams.set("key", this.apiKey)

    try {
      const response = await fetch(url.toString())

      if (!response.ok) {
        let errorMessage = `YouTube API error: ${response.status} ${response.statusText}`
        try {
          const errorBody = await response.text()
          console.error(`[v0] YouTube API error response:`, errorBody)

          // Try to parse JSON error response
          try {
            const errorJson = JSON.parse(errorBody)
            if (errorJson.error?.message) {
              errorMessage += ` - ${errorJson.error.message}`
            }
            if (errorJson.error?.errors?.[0]?.reason) {
              errorMessage += ` (${errorJson.error.errors[0].reason})`
            }
          } catch {
            // If not JSON, include first 200 chars of response
            errorMessage += ` - ${errorBody.substring(0, 200)}`
          }
        } catch {
          // If we can't read the response body, just use the status
        }

        throw new Error(errorMessage)
      }

      const data: YouTubeVideoResponse = await response.json()
      const statisticsMap = new Map<string, YouTubeVideoStatistics>()

      for (const item of data.items || []) {
        statisticsMap.set(item.id, item.statistics)
      }

      return statisticsMap
    } catch (error) {
      console.error("[v0] Failed to fetch YouTube statistics:", error)
      throw error
    }
  }

  /**
   * Get statistics for multiple channels in a single API call
   */
  async getChannelStatistics(channelIds: string[]): Promise<Map<string, YouTubeChannelStatistics>> {
    if (channelIds.length === 0) {
      return new Map()
    }

    const url = new URL(`${this.baseUrl}/channels`)
    url.searchParams.set("part", "statistics")
    url.searchParams.set("id", channelIds.join(","))
    url.searchParams.set("key", this.apiKey)

    try {
      const response = await fetch(url.toString())

      if (!response.ok) {
        let errorMessage = `YouTube API error: ${response.status} ${response.statusText}`
        try {
          const errorBody = await response.text()
          console.error(`[v0] YouTube API error response:`, errorBody)

          // Try to parse JSON error response
          try {
            const errorJson = JSON.parse(errorBody)
            if (errorJson.error?.message) {
              errorMessage += ` - ${errorJson.error.message}`
            }
            if (errorJson.error?.errors?.[0]?.reason) {
              errorMessage += ` (${errorJson.error.errors[0].reason})`
            }
          } catch {
            // If not JSON, include first 200 chars of response
            errorMessage += ` - ${errorBody.substring(0, 200)}`
          }
        } catch {
          // If we can't read the response body, just use the status
        }

        throw new Error(errorMessage)
      }

      const data: YouTubeChannelResponse = await response.json()
      const statisticsMap = new Map<string, YouTubeChannelStatistics>()

      for (const item of data.items || []) {
        statisticsMap.set(item.id, item.statistics)
      }

      return statisticsMap
    } catch (error) {
      console.error("[v0] Failed to fetch YouTube channel statistics:", error)
      throw error
    }
  }

  /**
   * Process videos in chunks to respect API limits
   */
  async getVideoStatisticsInChunks(videoIds: string[], chunkSize = 50): Promise<Map<string, YouTubeVideoStatistics>> {
    const allStatistics = new Map<string, YouTubeVideoStatistics>()

    for (let i = 0; i < videoIds.length; i += chunkSize) {
      const chunk = videoIds.slice(i, i + chunkSize)
      const chunkStatistics = await this.getVideoStatistics(chunk)

      // Merge chunk results into the main map
      for (const [videoId, stats] of chunkStatistics) {
        allStatistics.set(videoId, stats)
      }

      // Add delay between chunks to be respectful to the API
      if (i + chunkSize < videoIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return allStatistics
  }

  /**
   * Process channels in chunks to respect API limits
   */
  async getChannelStatisticsInChunks(
    channelIds: string[],
    chunkSize = 50,
  ): Promise<Map<string, YouTubeChannelStatistics>> {
    const allStatistics = new Map<string, YouTubeChannelStatistics>()

    for (let i = 0; i < channelIds.length; i += chunkSize) {
      const chunk = channelIds.slice(i, i + chunkSize)
      const chunkStatistics = await this.getChannelStatistics(chunk)

      // Merge chunk results into the main map
      for (const [channelId, stats] of chunkStatistics) {
        allStatistics.set(channelId, stats)
      }

      // Add delay between chunks to be respectful to the API
      if (i + chunkSize < channelIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    return allStatistics
  }
}

export function createYouTubeAPI(): YouTubeAPI {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY environment variable is required")
  }
  return new YouTubeAPI(apiKey)
}
