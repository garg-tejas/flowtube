"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tag, Plus, X } from "lucide-react"

type VideoTagsProps = {
  videoId: string
}

export function VideoTags({ videoId }: VideoTagsProps) {
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const supabase = createClient()

  const fetchTags = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("tags")
      .select("tag")
      .eq("video_id", videoId)
      .order("created_at", { ascending: true })

    if (data) setTags(data.map((t: any) => t.tag))
  }

  useEffect(() => {
    fetchTags()
  }, [videoId])

  const addTag = async () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("tags").insert({
      user_id: user.id,
      video_id: videoId,
      tag: newTag.trim(),
    })

    setNewTag("")
    fetchTags()
  }

  const removeTag = async (tag: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("tags").delete().eq("video_id", videoId).eq("tag", tag)

    fetchTags()
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Tags</CardTitle>
            <CardDescription className="text-xs mt-1">Organize with custom tags</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addTag()
              }
            }}
            placeholder="Add a tag..."
            className="border-border/50 bg-muted/50 focus:bg-muted/80 focus:border-primary/50 transition-all"
          />
          <Button
            onClick={addTag}
            size="icon"
            className="p-2 rounded-lg bg-primary/10 hover:bg-primary/15 text-primary transition-all"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                className="gap-1 bg-gradient-to-r from-primary/15 to-primary/10 text-foreground border-primary/20 hover:border-primary/40 transition-all"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
