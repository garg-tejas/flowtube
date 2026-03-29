"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { Play, Clock } from "lucide-react"

type Video = {
  id: string
  title: string
  thumbnail_url: string | null
  duration: number | null
}

type ContinueWatchingVideo = {
  video: Video
  playlist_title: string
  progress_seconds: number
  last_watched_at: string
}

type ContinueWatchingSectionProps = {
  videos: ContinueWatchingVideo[]
}

const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

const formatTimeAgo = (date: string) => {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function ContinueWatchingSection({ videos }: ContinueWatchingSectionProps) {
  if (videos.length === 0) return null

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gradient-blue">Continue Watching</h2>
          <p className="text-sm text-muted-foreground">Pick up where you left off</p>
        </div>
        <Link href="/history">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {videos.slice(0, 4).map((item) => {
          const progressPercent = item.video.duration
            ? (item.progress_seconds / item.video.duration) * 100
            : 0

          return (
            <Link key={item.video.id} href={`/watch/${item.video.id}`}>
              <Card className="overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-video">
                  <img
                    src={item.video.thumbnail_url || "/placeholder.svg?height=180&width=320"}
                    alt={item.video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    decode="async"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white rounded-full p-3 shadow-lg">
                      <Play className="h-6 w-6 text-black" fill="black" />
                    </div>
                  </div>
                  {/* Progress bar at bottom of thumbnail */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div
                      className="h-full bg-white"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  {/* Time badge */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                    {formatDuration(item.progress_seconds)} / {formatDuration(item.video.duration || 0)}
                  </div>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">{item.video.title}</h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">{item.playlist_title}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(item.last_watched_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
