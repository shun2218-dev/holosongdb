"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Bell } from "lucide-react"
import { NotificationSettings } from "@/components/notification-settings"

export function NotificationSettingsModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Bell className="h-4 w-4" />
          通知設定
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>通知設定</DialogTitle>
          <DialogDescription>
            プッシュ通知の設定を管理できます。楽曲の節目達成やタレントの更新情報を受け取れます。
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <NotificationSettings />
        </div>
      </DialogContent>
    </Dialog>
  )
}
