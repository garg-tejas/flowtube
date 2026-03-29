import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { memo } from "react"
import { cn } from "@/lib/utils"

type Video = {
  id: string
  youtube_video_id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  position: number
  duration: number | null
}

type Playlist = {
  id: string
  title: string
  youtube_playlist_id: string
}

type WatchProgress = {
  progress_seconds: number
  completed: boolean
} | null

type VideoFeedCardProps = {
  video: Video
  playlist: Playlist
  progress: WatchProgress
}

function VideoFeedCardComponent({ video, playlist, progress }: VideoFeedCardProps) {
  const progressPercentage = progress && video.duration ? (progress.progress_seconds / video.duration) * 100 : 0
  const isCompleted = progress?.completed
  const isInProgress = progress && !isCompleted && progressPercentage > 0

  return (
    <Card className={cn(
      "overflow-hidden border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group flex flex-col h-full card-gradient-overlay",
      isCompleted
        ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5"
        : "border-border/60 hover:border-primary/40"
    )}>
      {/* Thumbnail */}
      <Link href={`/watch/${video.id}`} className="block flex-shrink-0">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <img
            src={video.thumbnail_url || "/placeholder.svg?height=360&width=640"}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            draggable={false}
          />

          {/* Progress Bar */}
          {isInProgress && (
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/10 backdrop-blur-sm">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 shadow-lg"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <Button
              size="lg"
              className="rounded-full h-16 w-16 p-0 shadow-2xl bg-white/90 hover:bg-white text-background hover:scale-110 transition-transform"
              variant="secondary"
            >
              <Play className="h-7 w-7 ml-1" fill="currentColor" />
            </Button>
          </div>

          {/* Status Badge */}
          {isCompleted && (
            <div className="absolute top-3 right-3 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-full p-2.5 shadow-xl">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <CardContent className="flex-1 flex flex-col p-4 gap-3">
        {/* Title */}
        <Link href={`/watch/${video.id}`} className="flex-1">
          <h3 className="font-semibold line-clamp-2 text-sm leading-snug text-foreground hover:text-primary transition-colors duration-200">
            {video.title}
          </h3>
        </Link>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground gap-2">
          <Link href={`/playlists`} className="hover:text-foreground transition-colors truncate font-medium">
            {playlist.title}
          </Link>
          {isInProgress && (
            <span className="text-primary font-bold flex-shrink-0 bg-primary/10 px-2 py-1 rounded-full">
              {Math.round(progressPercentage)}%
            </span>
          )}
        </div>

        {/* Progress Bar */}
        {isInProgress && (
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        {/* CTA Button */}
        <Link href={`/watch/${video.id}`} className="block mt-auto">
          <Button
            className="w-full transition-all duration-200 hover:shadow-md"
            variant={isCompleted ? "outline" : "default"}
            size="sm"
          >
            {isCompleted ? "Watch Again" : isInProgress ? "Continue" : "Watch Now"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export const VideoFeedCard = memo(VideoFeedCardComponent)
