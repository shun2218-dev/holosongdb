import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48 mt-1" />
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Search section skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="flex gap-2 flex-wrap">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-18" />
            </div>
          </div>

          {/* Song list skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-7 w-32" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-3">
                  <Skeleton className="w-full aspect-video" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
