"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Clock, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { ListVideo } from "@/components/icons/list-video"
import { PlaylistCardSkeleton } from "@/components/skeletons"

type Playlist = {
  id: string
  youtube_playlist_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  category: string | null
  created_at: string
}

type PlaylistWithProgress = Playlist & {
  totalVideos: number
  completedVideos: number
  progressPercentage: number
  totalDuration: number
  watchedDuration: number
}

const formatDuration = (seconds: number) => {
  if (seconds === 0) return "0m"
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

export function PlaylistList({ playlists }: { playlists: Playlist[] }) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [playlistsWithProgress, setPlaylistsWithProgress] = useState<PlaylistWithProgress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchProgress = async () => {
      setIsLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const progressData = await Promise.all(
        playlists.map(async (playlist) => {
          // Get all videos with their durations
          const { data: videos } = await supabase
            .from("videos")
            .select("id, duration")
            .eq("playlist_id", playlist.id)

          // Get watch progress for all videos
          const { data: progressList } = await supabase
            .from("watch_progress")
            .select("video_id, progress_seconds, completed")
            .eq("user_id", user.id)
            .eq("playlist_id", playlist.id)

          const totalVideos = videos?.length || 0
          const totalDuration = videos?.reduce((sum, v) => sum + (v.duration || 0), 0) || 0
          
          // Calculate watched duration
          let watchedDuration = 0
          let completedVideos = 0
          
          progressList?.forEach(progress => {
            const video = videos?.find(v => v.id === progress.video_id)
            if (progress.completed && video?.duration) {
              watchedDuration += video.duration
              completedVideos++
            } else {
              watchedDuration += progress.progress_seconds
            }
          })

          const progressPercentage = totalDuration > 0 ? (watchedDuration / totalDuration) * 100 : 0

          return {
            ...playlist,
            totalVideos,
            completedVideos,
            progressPercentage,
            totalDuration,
            watchedDuration,
          }
        }),
      )

      setPlaylistsWithProgress(progressData)
      setIsLoading(false)
    }

    fetchProgress()
  }, [playlists])

  const handleDelete = async (playlistId: string) => {
    setDeleting(playlistId)
    const supabase = createClient()

    const { error } = await supabase.from("playlists").delete().eq("id", playlistId)

    if (error) {
      console.error("Error deleting playlist:", error)
    } else {
      router.refresh()
    }
    setDeleting(null)
  }

  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="max-w-md text-center space-y-6">
          <div className="mx-auto w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-2xl">
            <ListVideo className="h-16 w-16 text-black" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-foreground">No playlists yet</h3>
            <p className="text-muted-foreground">Add your first YouTube playlist to get started!</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {playlists.map((p) => (
          <PlaylistCardSkeleton key={p.id} />
        ))}
      </div>
    )
  }

  const displayPlaylists =
    playlistsWithProgress.length > 0
      ? playlistsWithProgress
      : playlists.map((p) => ({ ...p, totalVideos: 0, completedVideos: 0, progressPercentage: 0, totalDuration: 0, watchedDuration: 0 }))

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {displayPlaylists.map((playlist) => {
        const isCompleted = playlist.totalVideos > 0 && playlist.completedVideos === playlist.totalVideos
        
        return (
          <Card
            key={playlist.id}
            className={`overflow-hidden hover:shadow-2xl hover:shadow-white/5 hover:-translate-y-1 transition-all duration-300 ${isCompleted ? 'ring-2 ring-emerald-500/50' : ''}`}
          >
            <div className="relative">
              {playlist.thumbnail_url && (
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={playlist.thumbnail_url || "/placeholder.svg"}
                    alt={playlist.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              {isCompleted && (
                <div className="absolute top-3 right-3 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-2">{playlist.title}</CardTitle>
              {playlist.category && (
                <span className="inline-block px-2 py-1 text-xs bg-primary/10 text-primary rounded-md w-fit mt-2">
                  {playlist.category}
                </span>
              )}
            </CardHeader>
            <CardContent>
              {playlist.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{playlist.description}</p>
              )}

              {playlist.totalVideos > 0 && (
                <div className="mb-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Videos</span>
                    <span className="font-medium">
                      {playlist.completedVideos}/{playlist.totalVideos} completed
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-white'}`}
                      style={{ width: `${playlist.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Watch Time</span>
                    </div>
                    <span className="font-medium">
                      {formatDuration(playlist.watchedDuration)} / {formatDuration(playlist.totalDuration)}
                    </span>
                  </div>
                </div>
              )}

              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(playlist.id)}
                disabled={deleting === playlist.id}
                className="hover:shadow-lg transition-all"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting === playlist.id ? "Deleting..." : "Delete"}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
