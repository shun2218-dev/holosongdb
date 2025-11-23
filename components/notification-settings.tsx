"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { InlineLoading, ButtonLoading } from "@/components/ui/loading"
import { Bell, BellOff, CheckCircle, AlertCircle } from "lucide-react"
import { PushNotificationManager } from "@/lib/push-notification"

export function NotificationSettings() {
  const [notificationStatus, setNotificationStatus] = useState({
    supported: false,
    permission: "default" as NotificationPermission,
    subscribed: false,
  })
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    milestones: true,
    surge: true,
    subscriberMilestones: true,
    reports: false,
  })
  const [settingsLoading, setSettingsLoading] = useState(true)

  useEffect(() => {
    checkStatus()
    loadCurrentSettings()
  }, [])

  const loadCurrentSettings = async () => {
    try {
      const response = await fetch("/api/push/settings")
      if (response.ok) {
        const currentSettings = await response.json()
        setSettings(currentSettings)
      }
    } catch (error) {
      console.error("Failed to load current settings:", error)
    } finally {
      setSettingsLoading(false)
    }
  }

  const checkStatus = async () => {
    const status = await PushNotificationManager.checkNotificationStatus()
    setNotificationStatus(status)
  }

  const enableNotifications = async () => {
    setLoading(true)
    try {
      const permission = await PushNotificationManager.requestPermission()

      if (permission === "granted") {
        const subscription = await PushNotificationManager.createSubscription()
        if (subscription) {
          const saved = await PushNotificationManager.saveSubscription(subscription)
          if (saved) {
            await checkStatus()
            await loadCurrentSettings()
          }
        }
      }
    } catch (error) {
      console.error("Failed to enable notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)

    try {
      await fetch("/api/push/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      })
    } catch (error) {
      console.error("Failed to save notification settings:", error)
      setSettings(settings)
    }
  }

  if (!notificationStatus.supported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            プッシュ通知
          </CardTitle>
          <CardDescription>お使いのブラウザはプッシュ通知をサポートしていません</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          プッシュ通知設定
        </CardTitle>
        <CardDescription>楽曲の統計情報やタレントの節目達成時に通知を受け取れます</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 通知許可状態 */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {notificationStatus.permission === "granted" && notificationStatus.subscribed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <div>
              <p className="font-medium">
                {notificationStatus.permission === "granted" && notificationStatus.subscribed
                  ? "通知が有効です"
                  : "通知を有効にする"}
              </p>
              <p className="text-sm text-muted-foreground">
                {notificationStatus.permission === "denied"
                  ? "ブラウザ設定で通知を許可してください"
                  : notificationStatus.permission === "granted" && notificationStatus.subscribed
                    ? "楽曲やタレントの更新情報を受け取れます"
                    : "ボタンをクリックして通知を許可してください"}
              </p>
            </div>
          </div>
          {notificationStatus.permission !== "granted" || !notificationStatus.subscribed ? (
            <Button
              onClick={enableNotifications}
              disabled={loading || notificationStatus.permission === "denied"}
              size="sm"
            >
              {loading ? (
                <>
                  <ButtonLoading />
                  <span className="ml-2">設定中...</span>
                </>
              ) : (
                "有効にする"
              )}
            </Button>
          ) : null}
        </div>

        {/* 通知設定 */}
        {notificationStatus.permission === "granted" && notificationStatus.subscribed && (
          <div className="space-y-4">
            <h4 className="font-medium">通知の種類</h4>

            {settingsLoading ? (
              <InlineLoading text="設定を読み込み中..." />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="milestones" className="flex-1">
                    <div>
                      <p>楽曲の節目達成</p>
                      <p className="text-sm text-muted-foreground">100万再生、1000万再生などの達成時</p>
                    </div>
                  </Label>
                  <Switch
                    id="milestones"
                    checked={settings.milestones}
                    onCheckedChange={(checked) => updateSettings("milestones", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="surge" className="flex-1">
                    <div>
                      <p>楽曲の急上昇</p>
                      <p className="text-sm text-muted-foreground">24時間で大幅に再生数が増加した時</p>
                    </div>
                  </Label>
                  <Switch
                    id="surge"
                    checked={settings.surge}
                    onCheckedChange={(checked) => updateSettings("surge", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="subscriberMilestones" className="flex-1">
                    <div>
                      <p>登録者数の節目達成</p>
                      <p className="text-sm text-muted-foreground">タレントの登録者数が節目を達成した時</p>
                    </div>
                  </Label>
                  <Switch
                    id="subscriberMilestones"
                    checked={settings.subscriberMilestones}
                    onCheckedChange={(checked) => updateSettings("subscriberMilestones", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="reports" className="flex-1">
                    <div>
                      <p>統計レポート</p>
                      <p className="text-sm text-muted-foreground">週間・月間の人気楽曲レポート</p>
                    </div>
                  </Label>
                  <Switch
                    id="reports"
                    checked={settings.reports}
                    onCheckedChange={(checked) => updateSettings("reports", checked)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
