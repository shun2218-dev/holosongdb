import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SongCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col w-full min-w-0">
      <CardContent className="p-0 flex-1 flex flex-col">
        {/* サムネイル部分 */}
        <div className="relative">
          <Skeleton className="w-full aspect-video" />
          <div className="absolute top-2 right-2">
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>

        {/* コンテンツ部分 */}
        <div className="p-6 space-y-4 flex-1 flex flex-col">
          {/* タイトル */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* タレント名 */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>

          {/* 作詞作曲者 */}
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-28" />
          </div>

          {/* 統計情報 */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>

          {/* タグ */}
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>

          {/* 動画ボタン */}
          <div className="pt-2 mt-auto">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
