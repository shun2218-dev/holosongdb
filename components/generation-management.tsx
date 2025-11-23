"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InlineLoading } from "@/components/ui/loading"
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Generation {
  id: string
  branch: string
  name: string
  display_order: number
  created_at: string
  updated_at: string
}

const BRANCHES = ["JP", "EN", "ID", "DEV_IS"]

export function GenerationManagement() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBranch, setSelectedBranch] = useState<string>("JP")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingGeneration, setEditingGeneration] = useState<Generation | null>(null)
  const [formData, setFormData] = useState({
    branch: "JP",
    name: "",
    display_order: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchGenerations()
  }, [selectedBranch])

  const fetchGenerations = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/generations?branch=${selectedBranch}`)
      if (response.ok) {
        const data = await response.json()
        setGenerations(data)
      }
    } catch (error) {
      console.error("Failed to fetch generations:", error)
      toast({
        title: "エラー",
        description: "期生情報の取得に失敗しました",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      const response = await fetch("/api/admin/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "期生を追加しました",
        })
        setIsAddDialogOpen(false)
        setFormData({ branch: "JP", name: "", display_order: 0 })
        fetchGenerations()
      } else {
        const error = await response.json()
        toast({
          title: "エラー",
          description: error.error || "期生の追加に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to add generation:", error)
      toast({
        title: "エラー",
        description: "期生の追加に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async () => {
    if (!editingGeneration) return

    try {
      const response = await fetch("/api/admin/generations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingGeneration.id,
          name: formData.name,
          display_order: formData.display_order,
        }),
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "期生を更新しました",
        })
        setIsEditDialogOpen(false)
        setEditingGeneration(null)
        fetchGenerations()
      } else {
        toast({
          title: "エラー",
          description: "期生の更新に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update generation:", error)
      toast({
        title: "エラー",
        description: "期生の更新に失敗しました",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("この期生を削除してもよろしいですか？")) return

    try {
      const response = await fetch(`/api/admin/generations?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "成功",
          description: "期生を削除しました",
        })
        fetchGenerations()
      } else {
        toast({
          title: "エラー",
          description: "期生の削除に失敗しました",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete generation:", error)
      toast({
        title: "エラー",
        description: "期生の削除に失敗しました",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (generation: Generation) => {
    setEditingGeneration(generation)
    setFormData({
      branch: generation.branch,
      name: generation.name,
      display_order: generation.display_order,
    })
    setIsEditDialogOpen(true)
  }

  const filteredGenerations = generations.filter((gen) => gen.branch === selectedBranch)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <Label htmlFor="branch-select">ブランチ:</Label>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger id="branch-select" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BRANCHES.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              期生を追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>期生を追加</DialogTitle>
              <DialogDescription>新しい期生情報を入力してください</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="add-branch">ブランチ</Label>
                <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                  <SelectTrigger id="add-branch">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="add-name">期生名</Label>
                <Input
                  id="add-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: 1期生"
                />
              </div>
              <div>
                <Label htmlFor="add-order">表示順序</Label>
                <Input
                  id="add-order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: Number.parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleAdd}>追加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{selectedBranch} の期生一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <InlineLoading text="読み込み中..." />
          ) : filteredGenerations.length > 0 ? (
            <div className="space-y-2">
              {filteredGenerations.map((generation) => (
                <div
                  key={generation.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{generation.name}</p>
                      <p className="text-sm text-muted-foreground">表示順序: {generation.display_order}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(generation)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(generation.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">期生が登録されていません</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>期生を編集</DialogTitle>
            <DialogDescription>期生情報を編集してください</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">期生名</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-order">表示順序</Label>
              <Input
                id="edit-order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: Number.parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleEdit}>更新</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
