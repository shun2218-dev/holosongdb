import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
  showText?: boolean
}

export function Loading({ size = "md", text = "読み込み中...", className, showText = true }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-8", className)}>
      <Loader2 className={cn("animate-spin mb-4", sizeClasses[size])} />
      {showText && <p className="text-muted-foreground text-sm">{text}</p>}
    </div>
  )
}

// ページ全体のローディング用
export function PageLoading({ text = "ページを読み込み中..." }: { text?: string }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loading size="lg" text={text} />
    </div>
  )
}

// インライン要素のローディング用
export function InlineLoading({ text = "読み込み中..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-4">
      <Loading size="sm" text={text} />
    </div>
  )
}

// ボタン内のローディング用
export function ButtonLoading({ size = "sm" }: { size?: "sm" | "md" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
  }

  return <Loader2 className={cn("animate-spin", sizeClasses[size])} />
}
