export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export class PushNotificationManager {
  private static readonly VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

  static initializeServiceWorkerMessaging() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.type === "GET_USER_ID") {
          const userId = this.getOrCreateUserId()
          event.ports[0]?.postMessage({ type: "USER_ID_RESPONSE", userId })
        } else if (event.data.type === "GET_SUBSCRIPTION_ID") {
          const subscriptionId = localStorage.getItem("hololive-subscription-id")
          event.ports[0]?.postMessage({ type: "SUBSCRIPTION_ID_RESPONSE", subscriptionId })
        }
      })
    }
  }

  static async ensureServiceWorkerReady(): Promise<ServiceWorkerRegistration> {
    if (!("serviceWorker" in navigator)) {
      throw new Error("このブラウザはService Workerをサポートしていません")
    }

    try {
      // Service Workerが既に登録されているかチェック
      let registration = await navigator.serviceWorker.getRegistration()

      if (!registration) {
        // 登録されていない場合は登録
        registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        })
        console.log("[Push] Service Worker registered:", registration)
      }

      // Service Workerがアクティブになるまで待機
      await navigator.serviceWorker.ready

      this.initializeServiceWorkerMessaging()

      return registration
    } catch (error) {
      console.error("[Push] Service Worker registration failed:", error)
      throw error
    }
  }

  static async requestPermissionWithUserGesture(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      throw new Error("このブラウザはプッシュ通知をサポートしていません")
    }

    // Service Workerの準備を確認
    await this.ensureServiceWorkerReady()

    // ユーザージェスチャー内で通知許可を求める
    const permission = await Notification.requestPermission()
    console.log("[Push] Notification permission requested:", permission)

    return permission
  }

  // プッシュ通知の許可を求める（従来の関数は内部使用のみ）
  static async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      throw new Error("このブラウザはプッシュ通知をサポートしていません")
    }

    // 既に許可されている場合はそのまま返す
    if (Notification.permission !== "default") {
      return Notification.permission
    }

    // モバイルの場合は明示的なユーザー操作が必要
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    if (isMobile) {
      throw new Error("モバイルでは明示的なユーザー操作が必要です")
    }

    await this.ensureServiceWorkerReady()
    const permission = await Notification.requestPermission()
    console.log("[Push] Notification permission:", permission)
    return permission
  }

  // プッシュ通知のサブスクリプションを作成
  static async createSubscription(): Promise<PushSubscriptionData | null> {
    try {
      const registration = await this.ensureServiceWorkerReady()

      if (!this.VAPID_PUBLIC_KEY) {
        throw new Error("VAPID public key is not configured")
      }

      const existingSubscription = await registration.pushManager.getSubscription()
      if (existingSubscription) {
        console.log("[Push] Using existing subscription")
        const subscriptionData: PushSubscriptionData = {
          endpoint: existingSubscription.endpoint,
          keys: {
            p256dh: this.arrayBufferToBase64(existingSubscription.getKey("p256dh")!),
            auth: this.arrayBufferToBase64(existingSubscription.getKey("auth")!),
          },
        }
        return subscriptionData
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.VAPID_PUBLIC_KEY),
      })

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
        },
      }

      console.log("[Push] Subscription created:", subscriptionData)
      return subscriptionData
    } catch (error) {
      console.error("[Push] Failed to create subscription:", error)
      return null
    }
  }

  // サブスクリプションをサーバーに保存
  static async saveSubscription(subscription: PushSubscriptionData): Promise<boolean> {
    try {
      const userId = this.getOrCreateUserId()

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...subscription,
          userId,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to save subscription: ${response.statusText}`)
      }

      const result = await response.json()
      if (result.subscriptionId) {
        localStorage.setItem("hololive-subscription-id", result.subscriptionId.toString())
      }

      console.log("[Push] Subscription saved successfully")
      return true
    } catch (error) {
      console.error("[Push] Failed to save subscription:", error)
      return false
    }
  }

  // プッシュ通知の設定を確認
  static async checkNotificationStatus(): Promise<{
    supported: boolean
    permission: NotificationPermission
    subscribed: boolean
  }> {
    const supported = "Notification" in window && "serviceWorker" in navigator

    if (!supported) {
      return { supported: false, permission: "default", subscribed: false }
    }

    const permission = Notification.permission
    let subscribed = false

    try {
      const registration = await this.ensureServiceWorkerReady()
      const subscription = await registration.pushManager.getSubscription()
      subscribed = !!subscription
    } catch (error) {
      console.error("[Push] Failed to check subscription status:", error)
    }

    return { supported, permission, subscribed }
  }

  // VAPID公開鍵をUint8Arrayに変換
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // ArrayBufferをBase64に変換
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  private static getOrCreateUserId(): string {
    let userId = localStorage.getItem("hololive-user-id")
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("hololive-user-id", userId)
    }
    return userId
  }
}
