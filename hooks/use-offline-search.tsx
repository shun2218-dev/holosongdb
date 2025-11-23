"use client"

import { useState, useMemo, useCallback } from "react"
import type { Song } from "@/types/song"

interface SearchParams {
  query: string
  sortBy: string
  sortOrder: "asc" | "desc"
  songType: string
}

export function useOfflineSearch(allSongs: Song[]) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: "",
    sortBy: "releaseDate",
    sortOrder: "desc",
    songType: "all",
  })

  const filteredAndSortedSongs = useMemo(() => {
    if (!allSongs || allSongs.length === 0) {
      return []
    }

    let filtered = [...allSongs]

    if (searchParams.songType !== "all") {
      filtered = filtered.filter((song) => song.type === searchParams.songType)
    }

    if (searchParams.query) {
      const query = searchParams.query.toLowerCase()
      filtered = filtered.filter((song) => {
        return (
          song.title?.toLowerCase().includes(query) ||
          song.titleJp?.toLowerCase().includes(query) ||
          song.titleEn?.toLowerCase().includes(query) ||
          song.composer?.toLowerCase().includes(query) ||
          song.lyrics?.toLowerCase().includes(query) ||
          song.talents?.some((talent) => talent.name?.toLowerCase().includes(query))
        )
      })
    }

    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (searchParams.sortBy) {
        case "title":
          aValue = a.title || ""
          bValue = b.title || ""
          break
        case "viewCount":
          aValue = Number(a.viewCount || 0)
          bValue = Number(b.viewCount || 0)
          break
        case "likeCount":
          aValue = Number(a.likeCount || 0)
          bValue = Number(b.likeCount || 0)
          break
        case "commentCount":
          aValue = Number(a.commentCount || 0)
          bValue = Number(b.commentCount || 0)
          break
        case "releaseDate":
        default:
          aValue = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
          bValue = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
          break
      }

      if (searchParams.sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

    return filtered
  }, [allSongs, searchParams])

  const updateSearch = useCallback((newParams: SearchParams) => {
    setSearchParams(newParams)
  }, [])

  return {
    filteredSongs: filteredAndSortedSongs,
    searchParams,
    updateSearch,
  }
}
