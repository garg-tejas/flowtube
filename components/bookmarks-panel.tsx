"use client"

import { useState, useEffect, memo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookmarkIcon, Plus, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type BookmarksPanelProps = {
  videoId: string
  currentTime: number
  onSeekTo: (time: number) => void
}

type Bookmark = {
  id: string
  timestamp_seconds: number
  title: string
  description: string | null
}

function BookmarksPanelComponent({ videoId, currentTime, onSeekTo }: BookmarksPanelProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const supabase = createClient()

  const fetchBookmarks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("video_id", videoId)
      .order("timestamp_seconds", { ascending: true })

    if (data) setBookmarks(data)
  }

  useEffect(() => {
    fetchBookmarks()
  }, [videoId])

  const addBookmark = async () => {
    if (!title.trim()) return

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("bookmarks").insert({
      user_id: user.id,
      video_id: videoId,
      timestamp_seconds: Math.floor(currentTime),
      title: title.trim(),
      description: description.trim() || null,
    })

    setTitle("")
    setDescription("")
    setIsOpen(false)
    fetchBookmarks()
  }

  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id)
    fetchBookmarks()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookmarkIcon className="w-5 h-5" />
              Bookmarks
            </CardTitle>
            <CardDescription>Mark important timestamps</CardDescription>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Bookmark</DialogTitle>
                <DialogDescription>Mark this moment at {formatTime(Math.floor(currentTime))}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Key concept explained"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
                <Button onClick={addBookmark} className="w-full">
                  Save Bookmark
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {bookmarks.length > 0 ? (
          <div className="space-y-2">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => onSeekTo(bookmark.timestamp_seconds)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">
                      {formatTime(bookmark.timestamp_seconds)}
                    </span>
                    <span className="text-sm font-medium">{bookmark.title}</span>
                  </div>
                  {bookmark.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{bookmark.description}</p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteBookmark(bookmark.id)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No bookmarks yet. Add one to mark important moments!
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export const BookmarksPanel = memo(BookmarksPanelComponent)
