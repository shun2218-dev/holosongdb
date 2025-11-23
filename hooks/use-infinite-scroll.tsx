"use client"

import { useEffect, useRef, useCallback } from "react"

interface UseInfiniteScrollOptions {
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  rootMargin?: string
  threshold?: number
}

export function useInfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  rootMargin = "100px",
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadingRef = useRef<HTMLDivElement | null>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries
      if (target.isIntersecting && hasMore && !loading) {
        onLoadMore()
      }
    },
    [hasMore, loading, onLoadMore],
  )

  useEffect(() => {
    const element = loadingRef.current
    if (!element) return

    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin,
      threshold,
    })

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver, rootMargin, threshold])

  return { loadingRef }
}
