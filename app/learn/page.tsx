import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Plus, BookOpen, Clock, CheckCircle2, ArrowRight } from "lucide-react"
import { GlobalSearch, SearchButton } from "@/components/global-search"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { CreateLearningPathDialog } from "@/components/create-learning-path-dialog"
import { EmptyState } from "@/components/empty-state"
import { AuthenticatedLayout } from "@/components/authenticated-layout"

export default async function LearnPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch learning paths with their playlists
  const { data: learningPaths } = await supabase
    .from("learning_paths")
    .select(`
      id,
      title,
      description,
      created_at,
      learning_path_playlists (
        position,
        playlist:playlists (
          id,
          title,
          thumbnail_url
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch user's playlists for the create dialog
  const { data: playlists } = await supabase
    .from("playlists")
    .select("id, title, thumbnail_url")
    .eq("user_id", user.id)
    .order("title")

  // Calculate progress for each learning path
  const pathsWithProgress = await Promise.all(
    (learningPaths || []).map(async (path) => {
      const playlistIds = path.learning_path_playlists?.map((lpp: any) => lpp.playlist?.id).filter(Boolean) || []

      if (playlistIds.length === 0) {
        return { ...path, totalVideos: 0, completedVideos: 0, totalDuration: 0, watchedDuration: 0 }
      }

      // Get all videos in these playlists
      const { data: videos } = await supabase
        .from("videos")
        .select("id, duration, playlist_id")
        .in("playlist_id", playlistIds)

      // Get watch progress
      const { data: progress } = await supabase
        .from("watch_progress")
        .select("video_id, progress_seconds, completed")
        .eq("user_id", user.id)
        .in("playlist_id", playlistIds)

      const totalVideos = videos?.length || 0
      const totalDuration = videos?.reduce((sum, v) => sum + (v.duration || 0), 0) || 0

      let watchedDuration = 0
      let completedVideos = 0

      progress?.forEach(p => {
        const video = videos?.find(v => v.id === p.video_id)
        if (p.completed && video?.duration) {
          watchedDuration += video.duration
          completedVideos++
        } else {
          watchedDuration += p.progress_seconds
        }
      })

      return {
        ...path,
        totalVideos,
        completedVideos,
        totalDuration,
        watchedDuration,
      }
    })
  )

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "0m"
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hrs > 0) return `${hrs}h ${mins}m`
    return `${mins}m`
  }

  return (
    <AuthenticatedLayout title="Learning Paths">
      <GlobalSearch />
      <KeyboardShortcuts />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Combine playlists into structured curricula</p>
          </div>
          <CreateLearningPathDialog playlists={playlists || []} />
        </div>

        {pathsWithProgress.length === 0 ? (
          <EmptyState type="learning-paths" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {pathsWithProgress.map((path) => {
              const progressPercent = path.totalDuration > 0
                ? (path.watchedDuration / path.totalDuration) * 100
                : 0
              const isCompleted = path.totalVideos > 0 && path.completedVideos === path.totalVideos

              return (
                <Link key={path.id} href={`/learn/${path.id}`}>
                  <Card className={`overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${isCompleted ? "ring-2 ring-emerald-500/50" : ""}`}>
                    {/* Playlist thumbnails strip */}
                    <div className="flex h-24 bg-muted/50">
                      {path.learning_path_playlists?.slice(0, 4).map((lpp: any, i: number) => (
                        <div
                          key={lpp.playlist?.id || i}
                          className="flex-1 relative"
                          style={{ maxWidth: "25%" }}
                        >
                          {lpp.playlist?.thumbnail_url ? (
                            <img
                              src={lpp.playlist.thumbnail_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          {i === 3 && path.learning_path_playlists.length > 4 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white font-bold">+{path.learning_path_playlists.length - 4}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {isCompleted && (
                        <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    <CardHeader>
                      <CardTitle className="line-clamp-1">{path.title}</CardTitle>
                      {path.description && (
                        <CardDescription className="line-clamp-2">{path.description}</CardDescription>
                      )}
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {path.learning_path_playlists?.length || 0} playlists
                          </span>
                          <span className="font-medium">
                            {path.completedVideos}/{path.totalVideos} videos
                          </span>
                        </div>

                        <Progress value={progressPercent} className="h-2" />

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatDuration(path.watchedDuration)} / {formatDuration(path.totalDuration)}</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}