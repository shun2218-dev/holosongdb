const CACHE_NAME = "holosong-db-v1"
const STATIC_CACHE_URLS = ["/", "/offline", "/manifest.json", "/icons/icon-192x192.jpg", "/icons/icon-512x512.jpg"]

self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data)

  if (event.data.type === "GET_USER_ID") {
    // ユーザーIDの取得要求に対する応答
    event.ports[0]?.postMessage({
      type: "USER_ID_RESPONSE",
      userId: "anonymous", // 実際の実装では適切なユーザーIDを返す
    })
  } else if (event.data.type === "GET_SUBSCRIPTION_ID") {
    // サブスクリプションIDの取得要求に対する応答
    event.ports[0]?.postMessage({
      type: "SUBSCRIPTION_ID_RESPONSE",
      subscriptionId: null, // 実際の実装では適切なサブスクリプションIDを返す
    })
  }
})

self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching static resources")
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log("[SW] Skip waiting")
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: "SW_INSTALLED" })
          })
        })
        return self.skipWaiting()
      }),
  )
})

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[SW] Claiming clients")
        return self.clients.claim()
      }),
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return
  }

  // API requests - Network First with better offline handling
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses for 5 minutes
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log("[SW] Serving cached API response for:", url.pathname)
              return cachedResponse
            }
            // Return a proper offline response for API calls
            return new Response(
              JSON.stringify({
                error: "オフライン中のため、データを取得できません。",
                offline: true,
                songs: [],
                totalCount: 0,
              }),
              {
                status: 503,
                statusText: "Service Unavailable - Offline",
                headers: {
                  "Content-Type": "application/json",
                },
              },
            )
          })
        }),
    )
    return
  }

  // Navigation requests - Network First with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful page responses
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Fallback to cached page or offline page
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match("/offline")
          })
        }),
    )
    return
  }

  // Static assets - Cache First strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // For failed static asset requests, try to serve offline page
          if (request.destination === "document") {
            return caches.match("/offline")
          }
          // For other assets, just fail silently
          return new Response("", { status: 404 })
        })
    }),
  )
})

self.addEventListener("push", (event) => {
  console.log("[SW] Push event received:", event)

  if (!event.data) {
    console.log("[SW] Push event has no data")
    return
  }

  try {
    const data = event.data.json()
    console.log("[SW] Push notification data:", data)

    const options = {
      body: data.message || "Hololive楽曲データベースからの通知",
      icon: "/icons/icon-192x192.jpg",
      badge: "/icons/icon-192x192.jpg",
      tag: data.type || "general",
      data: data.data || {},
      actions: [
        {
          action: "view",
          title: "詳細を見る",
        },
        {
          action: "dismiss",
          title: "閉じる",
        },
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200],
      silent: false,
      renotify: true,
      timestamp: Date.now(),
    }

    event.waitUntil(
      self.registration
        .showNotification(data.title || "Hololive楽曲DB", options)
        .then(() => {
          console.log("[SW] Notification displayed successfully")
        })
        .catch((error) => {
          console.error("[SW] Failed to display notification:", error)
        }),
    )
  } catch (error) {
    console.error("[SW] Error processing push notification:", error)
  }
})

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event)

  const notificationData = event.notification.data || {}
  const action = event.action || "view"

  // 通知クリックを追跡
  trackNotificationClick({
    notificationId: notificationData.notificationId || "unknown",
    action: action,
    notificationData: notificationData,
    timestamp: Date.now(),
  })

  event.notification.close()

  if (event.action === "dismiss") {
    return
  }

  // 通知をクリックした時にアプリを開く
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // 既にアプリが開いている場合はそのタブにフォーカス
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          if (notificationData.notificationId && notificationData.notificationId !== "unknown") {
            client.navigate(`/admin/notifications/${notificationData.notificationId}`)
          } else if (notificationData.songId) {
            client.navigate(`/?song=${notificationData.songId}`)
          }
          return client.focus()
        }
      }

      // アプリが開いていない場合は新しいタブで開く
      if (clients.openWindow) {
        let targetUrl = "/"

        if (notificationData.notificationId && notificationData.notificationId !== "unknown") {
          targetUrl = `/admin/notifications/${notificationData.notificationId}`
        } else if (notificationData.songId) {
          targetUrl = `/?song=${notificationData.songId}`
        }

        return clients.openWindow(targetUrl)
      }
    }),
  )
})

self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event)

  const notificationData = event.notification.data || {}

  trackNotificationClick({
    notificationId: notificationData.notificationId || "unknown",
    action: "close",
    notificationData: notificationData,
    timestamp: Date.now(),
  })
})

async function trackNotificationClick(data) {
  try {
    const { userId, subscriptionId } = await getUserIdAndSubscriptionId()

    // Only track if we have a valid subscription ID
    if (!subscriptionId) {
      console.log("[SW] Skipping click tracking - no valid subscription ID")
      return
    }

    await fetch("/api/notifications/track-click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notificationId: data.notificationId,
        userId: userId,
        subscriptionId: subscriptionId,
        action: data.action,
        notificationData: data.notificationData,
        userAgent: navigator.userAgent,
      }),
    })

    console.log("[SW] Notification click tracked successfully")
  } catch (error) {
    console.error("[SW] Failed to track notification click:", error)
  }
}

async function getUserIdAndSubscriptionId() {
  try {
    // Try to get subscription from registration
    const subscription = await self.registration.pushManager.getSubscription()

    if (!subscription) {
      console.log("[SW] No push subscription found")
      return { userId: "anonymous", subscriptionId: null }
    }

    // Get subscription ID from database by matching endpoint
    const response = await fetch("/api/notifications/get-subscription-id", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        userId: data.userId || "anonymous",
        subscriptionId: data.subscriptionId,
      }
    }
  } catch (error) {
    console.error("[SW] Error getting user/subscription ID:", error)
  }

  return { userId: "anonymous", subscriptionId: null }
}

// 必要に応じて後で再実装
