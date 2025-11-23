"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Talent {
  id: string
  name: string
  nameJp: string | null
  nameEn: string | null
  branch: string
  generation: string | null
  active: boolean
  mainColor: string | null
  subscriberCount: string | null
  image_url?: string | null
  blur_data_url?: string | null
  generation_display_order?: number | null
}

export function TalentList() {
  const [talents, setTalents] = useState<Talent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTalents = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/talents")
        if (!response.ok) {
          throw new Error("タレント情報の取得に失敗しました")
        }
        const data = await response.json()
        setTalents(data.talents || [])
      } catch (err) {
        console.error("[v0] Error fetching talents:", err)
        setError(err instanceof Error ? err.message : "データの取得に失敗しました")
      } finally {
        setLoading(false)
      }
    }

    fetchTalents()
  }, [])

  const getBranchColor = (branch: string) => {
    switch (branch) {
      case "JP":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "EN":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      case "ID":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "DEV_IS":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getBranchName = (branch: string) => {
    switch (branch) {
      case "JP":
        return "ホロライブJP"
      case "EN":
        return "ホロライブEN"
      case "ID":
        return "ホロライブID"
      case "DEV_IS":
        return "DEV_IS"
      default:
        return branch
    }
  }

  const formatSubscriberCount = (count: string | null) => {
    if (!count) return null
    const num = Number.parseInt(count)
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const talentsByBranch = talents.reduce(
    (acc, talent) => {
      if (!acc[talent.branch]) {
        acc[talent.branch] = {}
      }

      // Split generation by comma to handle multiple generations
      const generations = talent.generation ? talent.generation.split(",").map((g) => g.trim()) : ["その他"]

      // Add talent to each generation they belong to
      for (const generation of generations) {
        if (!acc[talent.branch][generation]) {
          acc[talent.branch][generation] = []
        }
        acc[talent.branch][generation].push(talent)
      }

      return acc
    },
    {} as Record<string, Record<string, Talent[]>>,
  )

  const getUniqueTalentCount = (generationGroups: Record<string, Talent[]>) => {
    const uniqueIds = new Set<string>()
    Object.values(generationGroups).forEach((talents) => {
      talents.forEach((talent) => uniqueIds.add(talent.id))
    })
    return uniqueIds.size
  }

  const branchOrder = ["JP", "EN", "ID", "DEV_IS"]
  const sortedBranches = Object.keys(talentsByBranch).sort((a, b) => {
    const aIndex = branchOrder.indexOf(a)
    const bIndex = branchOrder.indexOf(b)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-12">
      {sortedBranches.map((branch) => {
        const generationGroups = talentsByBranch[branch]
        const sortedGenerations = Object.keys(generationGroups).sort((a, b) => {
          const talentsA = generationGroups[a]
          const talentsB = generationGroups[b]
          const orderA = talentsA[0]?.generation_display_order ?? 999
          const orderB = talentsB[0]?.generation_display_order ?? 999
          return orderA - orderB
        })

        const totalTalents = getUniqueTalentCount(generationGroups)

        return (
          <div key={branch} className="space-y-8">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`${getBranchColor(branch)} text-lg px-4 py-1`}>
                {getBranchName(branch)}
              </Badge>
              <span className="text-sm text-muted-foreground">{totalTalents}人</span>
            </div>

            {sortedGenerations.map((generation) => {
              const generationTalents = generationGroups[generation]

              return (
                <div key={generation} className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground pl-1">{generation}</h3>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {generationTalents.map((talent) => {
                      const displayName = talent.nameJp || talent.nameEn || talent.name
                      const subscriberCount = formatSubscriberCount(talent.subscriberCount)

                      return (
                        <Link key={talent.id} href={`/talents/${talent.id}`}>
                          <Card className="h-full hover:border-primary transition-colors cursor-pointer group">
                            <CardContent className="p-4 sm:p-6">
                              <div className="flex items-start gap-3 min-w-0">
                                {talent.image_url ? (
                                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-border flex-shrink-0 group-hover:border-primary transition-colors">
                                    <Image
                                      src={talent.image_url || "/placeholder.svg"}
                                      alt={displayName}
                                      fill
                                      sizes="(max-width: 640px) 48px, 64px"
                                      className="object-cover"
                                      placeholder={talent.blur_data_url ? "blur" : "empty"}
                                      blurDataURL={talent.blur_data_url || undefined}
                                    />
                                  </div>
                                ) : (
                                  <div
                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-border flex-shrink-0 group-hover:border-primary transition-colors"
                                    style={{
                                      backgroundColor: talent.mainColor || "#4ECDC4",
                                    }}
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 min-w-0">
                                    {talent.mainColor && (
                                      <div
                                        className="w-3 h-3 rounded-full border border-border flex-shrink-0"
                                        style={{ backgroundColor: talent.mainColor }}
                                      />
                                    )}
                                    <h3 className="font-semibold text-sm sm:text-base text-foreground truncate group-hover:text-primary transition-colors min-w-0 max-w-full">
                                      {displayName}
                                    </h3>
                                  </div>
                                  {talent.generation && (
                                    <p className="text-xs text-muted-foreground mb-2 truncate">{talent.generation}</p>
                                  )}
                                  {subscriberCount && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Users className="h-3 w-3 flex-shrink-0" />
                                      <span className="truncate">{subscriberCount} 登録者</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
