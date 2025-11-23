export function generateSmartTags(
  formData: {
    type: "ORIGINAL" | "COVER"
    lyrics: string
    composer: string
    talentIds: string[]
    releaseDate: string
  },
  talents: Array<{ id: string; nameJp: string | null; name: string }>,
) {
  const tags: string[] = []

  // 楽曲タイプ
  if (formData.type) {
    tags.push(formData.type === "ORIGINAL" ? "オリジナル曲" : "歌ってみた")
  }

  // 作詞者・作曲者の処理
  const lyricists = formData.lyrics
    ? formData.lyrics
        .split("、")
        .map((name) => name.trim())
        .filter(Boolean)
    : []
  const composers = formData.composer
    ? formData.composer
        .split("、")
        .map((name) => name.trim())
        .filter(Boolean)
    : []

  // 作詞者と作曲者が同じ場合は1つのタグにまとめる
  const allCreators = [...new Set([...lyricists, ...composers])]
  const sameCreators =
    lyricists.length > 0 &&
    composers.length > 0 &&
    lyricists.length === composers.length &&
    lyricists.every((lyricist) => composers.includes(lyricist))

  if (sameCreators) {
    // 同じ人が作詞・作曲の場合
    allCreators.forEach((creator) => tags.push(creator))
  } else {
    // 別々の場合
    lyricists.forEach((lyricist) => tags.push(lyricist))
    composers.forEach((composer) => tags.push(composer))
  }

  // タレント名（日本語名）
  formData.talentIds.forEach((talentId) => {
    const talent = talents.find((t) => t.id === talentId)
    if (talent && talent.nameJp) {
      tags.push(talent.nameJp)
    }
  })

  // リリース年
  if (formData.releaseDate) {
    const year = new Date(formData.releaseDate).getFullYear()
    tags.push(year.toString())
  }

  return tags
}

export function removeDuplicateTags(tags: string[]): string[] {
  const uniqueTags = [...new Set(tags.map((tag) => tag.toLowerCase()))]
    .map((lowerTag) => tags.find((tag) => tag.toLowerCase() === lowerTag))
    .filter(Boolean) as string[]

  return uniqueTags
}

export function getMissingTags(currentTags: string, smartTags: string[]): string[] {
  const current = currentTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
  return smartTags.filter((smartTag) => !current.includes(smartTag))
}

describe("Tag Management Utils", () => {
  const mockTalents = [
    { id: "1", name: "Tokino Sora", nameJp: "ときのそら" },
    { id: "2", name: "AZKi", nameJp: "AZKi" },
    { id: "3", name: "Roboco", nameJp: "ロボ子" },
  ]

  describe("generateSmartTags", () => {
    it("should generate tags for original song", () => {
      const formData = {
        type: "ORIGINAL" as const,
        lyrics: "アオワイファイ",
        composer: "アオワイファイ",
        talentIds: ["1"],
        releaseDate: "2025-01-01",
      }

      const result = generateSmartTags(formData, mockTalents)

      expect(result).toContain("オリジナル曲")
      expect(result).toContain("アオワイファイ")
      expect(result).toContain("ときのそら")
      expect(result).toContain("2025")
      // Should not duplicate when lyricist and composer are the same
      expect(result.filter((tag) => tag === "アオワイファイ")).toHaveLength(1)
    })

    it("should generate tags for cover song", () => {
      const formData = {
        type: "COVER" as const,
        lyrics: "原作者",
        composer: "原作者",
        talentIds: ["2"],
        releaseDate: "2024-12-25",
      }

      const result = generateSmartTags(formData, mockTalents)

      expect(result).toContain("歌ってみた")
      expect(result).toContain("AZKi")
      expect(result).toContain("2024")
    })

    it("should handle multiple lyricists and composers", () => {
      const formData = {
        type: "ORIGINAL" as const,
        lyrics: "作詞者A、作詞者B",
        composer: "作曲者A、作曲者B",
        talentIds: ["1", "2"],
        releaseDate: "2025-01-01",
      }

      const result = generateSmartTags(formData, mockTalents)

      expect(result).toContain("作詞者A")
      expect(result).toContain("作詞者B")
      expect(result).toContain("作曲者A")
      expect(result).toContain("作曲者B")
      expect(result).toContain("ときのそら")
      expect(result).toContain("AZKi")
    })

    it("should handle empty fields gracefully", () => {
      const formData = {
        type: "ORIGINAL" as const,
        lyrics: "",
        composer: "",
        talentIds: [],
        releaseDate: "",
      }

      const result = generateSmartTags(formData, mockTalents)

      expect(result).toContain("オリジナル曲")
      expect(result).toHaveLength(1) // Only song type
    })
  })

  describe("removeDuplicateTags", () => {
    it("should remove case-insensitive duplicates", () => {
      const tags = ["オリジナル曲", "ときのそら", "TOKINO SORA", "オリジナル曲"]
      const result = removeDuplicateTags(tags)

      expect(result).toHaveLength(2)
      expect(result).toContain("オリジナル曲")
      expect(result).toContain("ときのそら")
    })

    it("should preserve original casing", () => {
      const tags = ["Test", "test", "TEST"]
      const result = removeDuplicateTags(tags)

      expect(result).toHaveLength(1)
      expect(result[0]).toBe("Test") // First occurrence preserved
    })

    it("should handle empty array", () => {
      const result = removeDuplicateTags([])
      expect(result).toEqual([])
    })
  })

  describe("getMissingTags", () => {
    it("should identify missing tags", () => {
      const currentTags = "オリジナル曲, ときのそら"
      const smartTags = ["オリジナル曲", "アオワイファイ", "ときのそら", "2025"]

      const result = getMissingTags(currentTags, smartTags)

      expect(result).toEqual(["アオワイファイ", "2025"])
    })

    it("should return empty array when no tags missing", () => {
      const currentTags = "オリジナル曲, アオワイファイ, ときのそら, 2025"
      const smartTags = ["オリジナル曲", "アオワイファイ", "ときのそら", "2025"]

      const result = getMissingTags(currentTags, smartTags)

      expect(result).toEqual([])
    })

    it("should handle empty current tags", () => {
      const currentTags = ""
      const smartTags = ["オリジナル曲", "ときのそら"]

      const result = getMissingTags(currentTags, smartTags)

      expect(result).toEqual(["オリジナル曲", "ときのそら"])
    })
  })
})
