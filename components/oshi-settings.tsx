"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Loader2, Heart, AlertCircle, CheckCircle2 } from "lucide-react"

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
  generation_display_order?: number | null
}

interface OshiPreference {
  id: string
  talentId: string
  name: string
  nameJp: string | null
  nameEn: string | null
  branch: string
  mainColor: string | null
  createdAt: string
}

export function OshiSettings() {
  const [talents, setTalents] = useState<Talent[]>([])
  const [selectedTalentIds, setSelectedTalentIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [generationOrders, setGenerationOrders] = useState<Record<string, Record<string, number>>>({})

  const getUserId = () => {
    if (typeof window === "undefined") return null
    let userId = localStorage.getItem("hololive-user-id")
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("hololive-user-id", userId)
    }
    return userId
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const userId = getUserId()
        if (!userId) {
          throw new Error("ユーザーIDを取得できませんでした")
        }

        const talentsResponse = await fetch("/api/talents")
        if (!talentsResponse.ok) {
          throw new Error("タレント情報の取得に失敗しました")
        }
        const talentsData = await talentsResponse.json()
        const fetchedTalents = talentsData.talents || []
        setTalents(fetchedTalents)

        const orders: Record<string, Record<string, number>> = {}
        for (const talent of fetchedTalents) {
          if (!talent.generation) continue
          const generations = talent.generation.split(",").map((g: string) => g.trim())
          for (const gen of generations) {
            if (!orders[talent.branch]) {
              orders[talent.branch] = {}
            }
            if (orders[talent.branch][gen] === undefined) {
              orders[talent.branch][gen] = talent.generation_display_order ?? 999
            }
          }
        }
        setGenerationOrders(orders)

        const preferencesResponse = await fetch("/api/user/oshi-preferences", {
          headers: {
            "x-user-id": userId,
          },
        })
        if (!preferencesResponse.ok) {
          throw new Error("推し設定の取得に失敗しました")
        }
        const preferencesData = await preferencesResponse.json()
        const preferences: OshiPreference[] = preferencesData.preferences || []

        const selectedIds = new Set(preferences.map((p) => p.talentId))
        setSelectedTalentIds(selectedIds)
      } catch (err) {
        console.error("[v0] Error fetching data:", err)
        setError(err instanceof Error ? err.message : "データの取得に失敗しました")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleToggleTalent = (talentId: string) => {
    setSelectedTalentIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(talentId)) {
        newSet.delete(talentId)
      } else {
        newSet.add(talentId)
      }
      return newSet
    })
    setSuccess(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const userId = getUserId()
      if (!userId) {
        throw new Error("ユーザーIDを取得できませんでした")
      }

      const response = await fetch("/api/user/oshi-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          talentIds: Array.from(selectedTalentIds),
        }),
      })

      if (!response.ok) {
        throw new Error("推し設定の保存に失敗しました")
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error("[v0] Error saving preferences:", err)
      setError(err instanceof Error ? err.message : "保存に失敗しました")
    } finally {
      setSaving(false)
    }
  }

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

  const talentsByBranchAndGeneration = talents.reduce(
    (acc, talent) => {
      if (!acc[talent.branch]) {
        acc[talent.branch] = {}
      }

      const generations = talent.generation ? talent.generation.split(",").map((g) => g.trim()) : ["その他"]

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

  const branchOrder = ["JP", "EN", "ID", "DEV_IS"]
  const sortedBranches = Object.keys(talentsByBranchAndGeneration).sort((a, b) => {
    const aIndex = branchOrder.indexOf(a)
    const bIndex = branchOrder.indexOf(b)
    if (aIndex === -1) return 1
    if (bIndex === -1) return -1
    return aIndex - bIndex
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">推し設定を保存しました</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            推しを選択
          </CardTitle>
          <CardDescription>
            選択したタレントに関連する通知のみを受け取ります。選択しない場合は全ての通知を受け取ります。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="multiple" className="w-full">
            {sortedBranches.map((branch) => {
              const branchTalents = Object.values(talentsByBranchAndGeneration[branch]).flat()
              const selectedInBranch = branchTalents.filter((t) => selectedTalentIds.has(t.id)).length

              return (
                <AccordionItem key={branch} value={branch}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getBranchColor(branch)}>
                        {branch}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {selectedInBranch} / {branchTalents.length} 選択中
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Accordion type="multiple" className="w-full pl-4">
                      {Object.keys(talentsByBranchAndGeneration[branch])
                        .sort((a, b) => {
                          const orderA = generationOrders[branch]?.[a] ?? 999
                          const orderB = generationOrders[branch]?.[b] ?? 999
                          if (orderA !== orderB) {
                            return orderA - orderB
                          }
                          return a.localeCompare(b)
                        })
                        .map((generation) => {
                          const generationTalents = talentsByBranchAndGeneration[branch][generation]
                          const selectedInGeneration = generationTalents.filter((t) =>
                            selectedTalentIds.has(t.id),
                          ).length

                          return (
                            <AccordionItem key={`${branch}-${generation}`} value={`${branch}-${generation}`}>
                              <AccordionTrigger className="text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{generation}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {selectedInGeneration} / {generationTalents.length} 選択中
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                                  {generationTalents.map((talent) => {
                                    const isSelected = selectedTalentIds.has(talent.id)
                                    const displayName = talent.nameJp || talent.nameEn || talent.name
                                    const subscriberCount = formatSubscriberCount(talent.subscriberCount)

                                    return (
                                      <div
                                        key={talent.id}
                                        className={`
                                          relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer
                                          ${
                                            isSelected
                                              ? "border-primary bg-primary/5"
                                              : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
                                          }
                                        `}
                                        onClick={() => handleToggleTalent(talent.id)}
                                      >
                                        <Checkbox
                                          id={`talent-${talent.id}`}
                                          checked={isSelected}
                                          onCheckedChange={() => handleToggleTalent(talent.id)}
                                          className="mt-0.5"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <Label
                                            htmlFor={`talent-${talent.id}`}
                                            className="font-medium cursor-pointer leading-tight block"
                                          >
                                            {displayName}
                                          </Label>
                                          {subscriberCount && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                              {subscriberCount} 登録者
                                            </p>
                                          )}
                                        </div>
                                        {talent.mainColor && (
                                          <div
                                            className="w-3 h-3 rounded-full border border-border flex-shrink-0 mt-1"
                                            style={{ backgroundColor: talent.mainColor }}
                                          />
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          )
                        })}
                    </Accordion>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>

          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedTalentIds.size === 0
                ? "全ての通知を受け取ります"
                : `${selectedTalentIds.size}人のタレントを選択中`}
            </p>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
