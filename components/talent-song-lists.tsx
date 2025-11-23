"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TalentSongList } from "@/components/talent-song-list"
import { Music, Mic } from "lucide-react"

interface TalentSongListsProps {
  talentId: string
  talentName: string
}

export function TalentSongLists({ talentId, talentName }: TalentSongListsProps) {
  const [activeTab, setActiveTab] = useState<"original" | "cover">("original")

  return (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "original" | "cover")} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="original" className="flex items-center gap-2">
          <Music className="h-4 w-4" />
          オリジナル曲
        </TabsTrigger>
        <TabsTrigger value="cover" className="flex items-center gap-2">
          <Mic className="h-4 w-4" />
          歌ってみた
        </TabsTrigger>
      </TabsList>

      <TabsContent value="original" className="mt-6">
        <TalentSongList talentName={talentName} songType="ORIGINAL" />
      </TabsContent>

      <TabsContent value="cover" className="mt-6">
        <TalentSongList talentName={talentName} songType="COVER" />
      </TabsContent>
    </Tabs>
  )
}
