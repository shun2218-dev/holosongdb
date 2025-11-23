export interface ApiError {
  message: string
  isNetworkError: boolean
  isOffline: boolean
  status?: number
}

export function createApiError(error: unknown, isOffline = false): ApiError {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return {
      message: isOffline
        ? "オフライン中のため、データを取得できません。キャッシュされたデータがある場合は表示されます。"
        : "ネットワークエラーが発生しました。インターネット接続を確認してください。",
      isNetworkError: true,
      isOffline,
    }
  }

  if (error instanceof Error) {
    const status = (error as any).status
    if (status >= 500) {
      return {
        message: "サーバーエラーが発生しました。しばらく時間をおいて再度お試しください。",
        isNetworkError: false,
        isOffline: false,
        status,
      }
    }

    return {
      message: error.message,
      isNetworkError: false,
      isOffline: false,
      status,
    }
  }

  return {
    message: "予期しないエラーが発生しました。",
    isNetworkError: false,
    isOffline: false,
  }
}

export async function fetchWithOfflineHandling(url: string, options?: RequestInit): Promise<Response> {
  const isOffline = !navigator.onLine

  try {
    const response = await fetch(url, options)
    return response
  } catch (error) {
    throw createApiError(error, isOffline)
  }
}
