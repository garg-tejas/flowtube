"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function AddPlaylistDialog() {
  const [open, setOpen] = useState(false)
  const [playlistUrl, setPlaylistUrl] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const extractPlaylistId = (url: string) => {
    // Extract playlist ID from various YouTube URL formats
    const patterns = [/[?&]list=([^&]+)/, /youtube\.com\/playlist\?list=([^&]+)/, /^([a-zA-Z0-9_-]+)$/]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const playlistId = extractPlaylistId(playlistUrl)
    if (!playlistId) {
      setError("Invalid YouTube playlist URL or ID")
      setLoading(false)
      return
    }

    try {
      // Fetch playlist data from YouTube API
      const response = await fetch(`/api/youtube/playlist?playlistId=${playlistId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch playlist")
      }

      // Save playlist to database
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Not authenticated")
      }

      const { data: playlistData, error: dbError } = await supabase
        .from("playlists")
        .insert({
          user_id: user.id,
          youtube_playlist_id: playlistId,
          title: data.title,
          description: data.description,
          thumbnail_url: data.thumbnail,
          category: category || null,
        })
        .select()
        .single()

      if (dbError) throw dbError

      const videosResponse = await fetch(`/api/youtube/videos?playlistId=${playlistId}`)
      const videosData = await videosResponse.json()

      if (!videosResponse.ok) {
        throw new Error(videosData.error || "Failed to fetch videos")
      }

      const videosToInsert = videosData.videos.map((video: any) => ({
        ...video,
        playlist_id: playlistData.id,
      }))

      const { error: videosError } = await supabase.from("videos").insert(videosToInsert)

      if (videosError) throw videosError

      setOpen(false)
      setPlaylistUrl("")
      setCategory("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-button text-white font-semibold shadow-lg hover:shadow-xl transition-all">
          <Plus className="h-4 w-4 mr-2" />
          Add Playlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <DialogTitle className="text-xl">Add YouTube Playlist</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground/80">Enter a playlist URL or ID to add it to your collection</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2.5">
            <Label htmlFor="playlist-url" className="font-semibold text-foreground">
              Playlist URL or ID
            </Label>
            <Input
              id="playlist-url"
              placeholder="https://youtube.com/playlist?list=..."
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              required
              className="border-border/50 bg-muted/50 focus:bg-muted/80 focus:border-primary/50 transition-all"
            />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="category" className="font-semibold text-foreground">
              Category <span className="text-xs text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="category"
              placeholder="e.g., Tutorial, Music, Course"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border-border/50 bg-muted/50 focus:bg-muted/80 focus:border-primary/50 transition-all"
            />
          </div>
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}
          <Button
            type="submit"
            className="w-full gradient-button text-white font-semibold shadow-md hover:shadow-lg transition-all"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Playlist"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
