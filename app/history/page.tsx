import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, Check } from "lucide-react"
import { AuthenticatedLayout } from "@/components/authenticated-layout"

export default async function HistoryPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: history } = await supabase
    .from("watch_progress")
    .select(
      `
      id,
      progress_seconds,
      completed,
      last_watched_at,
      video:videos (
        id,
        youtube_video_id,
        title,
        thumbnail_url,
        duration,
        playlist:playlists (
          id,
          title
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("last_watched_at", { ascending: false })
    .limit(50)

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`
    return d.toLocaleDateString()
  }

  return (
    <AuthenticatedLayout title="Watch History">
      <div className="p-6 space-y-6">
        <p className="text-sm text-muted-foreground">Recently watched videos</p>
        {history && history.length > 0 ? (
          <div className="grid gap-4">
            {history.map((item: any) => {
              const progressPercent = item.video.duration ? (item.progress_seconds / item.video.duration) * 100 : 0

              return (
                <Link key={item.id} href={`/watch/${item.video.id}`}>
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <div className="relative w-40 h-24 shrink-0">
                          <img
                            src={item.video.thumbnail_url || "/placeholder.svg?height=90&width=160"}
                            alt={item.video.title}
                            className="w-full h-full object-cover rounded"
                          />
                          {item.completed && (
                            <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                              <Check className="w-8 h-8 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium line-clamp-2 mb-1">{item.video.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.video.playlist?.title || "Unknown Playlist"}
                          </p>
                          <div className="space-y-2">
                            <Progress value={progressPercent} className="h-1" />
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(item.last_watched_at)}
                                </span>
                                <span>
                                  {formatDuration(item.progress_seconds)} / {formatDuration(item.video.duration)}
                                </span>
                              </div>
                              {item.completed && <span className="text-green-500">Completed</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardHeader>
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>No Watch History</CardTitle>
              <CardDescription>Start watching videos to see your history here</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
