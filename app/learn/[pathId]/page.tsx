import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Play, ArrowLeft, Clock, CheckCircle2, BookOpen, Trophy, ChevronRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { GlobalSearch, SearchButton } from "@/components/global-search"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"

export default async function LearningPathDetailPage({ params }: { params: Promise<{ pathId: string }> }) {
  const { pathId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch learning path with playlists
  const { data: learningPath, error } = await supabase
    .from("learning_paths")
    .select(`
      id,
      title,
      description,
      created_at,
      user_id,
      learning_path_playlists (
        position,
        playlist:playlists (
          id,
          title,
          description,
          thumbnail_url
        )
      )
    `)
    .eq("id", pathId)
    .single()

  if (error || !learningPath || learningPath.user_id !== user.id) {
    notFound()
  }

  // Sort playlists by position
  const sortedPlaylists = (learningPath.learning_path_playlists || [])
    .sort((a: any, b: any) => a.position - b.position)

  // Calculate progress for each playlist
  const playlistsWithProgress = await Promise.all(
    sortedPlaylists.map(async (lpp: any) => {
      const playlist = lpp.playlist
      if (!playlist) return null

      const { data: videos } = await supabase
        .from("videos")
        .select("id, title, thumbnail_url, duration, position")
        .eq("playlist_id", playlist.id)
        .order("position")

      const { data: progress } = await supabase
        .from("watch_progress")
        .select("video_id, progress_seconds, completed")
        .eq("user_id", user.id)
        .eq("playlist_id", playlist.id)

      const totalVideos = videos?.length || 0
      const totalDuration = videos?.reduce((sum, v) => sum + (v.duration || 0), 0) || 0
      
      let watchedDuration = 0
      let completedVideos = 0
      let nextVideo = videos?.[0]
      
      progress?.forEach(p => {
        const video = videos?.find(v => v.id === p.video_id)
        if (p.completed && video?.duration) {
          watchedDuration += video.duration
          completedVideos++
        } else {
          watchedDuration += p.progress_seconds
        }
      })

      // Find next unwatched video
      for (const video of videos || []) {
        const videoProgress = progress?.find(p => p.video_id === video.id)
        if (!videoProgress || !videoProgress.completed) {
          nextVideo = video
          break
        }
      }

      return {
        ...playlist,
        position: lpp.position,
        videos: videos || [],
        totalVideos,
        completedVideos,
        totalDuration,
        watchedDuration,
        progressPercent: totalDuration > 0 ? (watchedDuration / totalDuration) * 100 : 0,
        isCompleted: totalVideos > 0 && completedVideos === totalVideos,
        nextVideo,
      }
    })
  )

  const validPlaylists = playlistsWithProgress.filter(Boolean)

  // Calculate overall progress
  const totalVideos = validPlaylists.reduce((sum, p) => sum + (p?.totalVideos || 0), 0)
  const completedVideos = validPlaylists.reduce((sum, p) => sum + (p?.completedVideos || 0), 0)
  const totalDuration = validPlaylists.reduce((sum, p) => sum + (p?.totalDuration || 0), 0)
  const watchedDuration = validPlaylists.reduce((sum, p) => sum + (p?.watchedDuration || 0), 0)
  const overallProgress = totalDuration > 0 ? (watchedDuration / totalDuration) * 100 : 0
  const isPathCompleted = totalVideos > 0 && completedVideos === totalVideos

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "0m"
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hrs > 0) return `${hrs}h ${mins}m`
    return `${mins}m`
  }

  // Find the next playlist to watch
  const nextPlaylistIndex = validPlaylists.findIndex(p => !p?.isCompleted)

  return (
    <div className="min-h-screen">
      <GlobalSearch />
      <KeyboardShortcuts />

      <header className="border-b border-white/10 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/feed" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center transition-transform group-hover:scale-110">
              <Play className="h-5 w-5 text-black" fill="currentColor" />
            </div>
            <span className="text-2xl font-bold text-foreground">FlowTube</span>
          </Link>
          <div className="flex items-center gap-3">
            <SearchButton />
            <Link href="/feed">
              <Button variant="ghost" className="hover:bg-white/5">Feed</Button>
            </Link>
            <Link href="/playlists">
              <Button variant="ghost" className="hover:bg-white/5">Playlists</Button>
            </Link>
            <Link href="/learn">
              <Button variant="ghost" className="hover:bg-white/5">
                <BookOpen className="h-4 w-4 mr-2" />
                Learn
              </Button>
            </Link>
            <Link href="/achievements">
              <Button variant="ghost" className="hover:bg-white/5">
                <Trophy className="h-4 w-4 mr-2" />
                Badges
              </Button>
            </Link>
            <ThemeToggle />
            <form action="/auth/signout" method="post">
              <Button variant="ghost" type="submit" className="hover:bg-white/5">Sign Out</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Link href="/learn">
          <Button variant="ghost" className="mb-6 hover:bg-white/5">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Learning Paths
          </Button>
        </Link>

        {/* Header Card */}
        <Card className={`mb-8 ${isPathCompleted ? "ring-2 ring-emerald-500/50" : ""}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  {learningPath.title}
                  {isPathCompleted && (
                    <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Completed
                    </span>
                  )}
                </CardTitle>
                {learningPath.description && (
                  <CardDescription className="mt-2 text-base">{learningPath.description}</CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {validPlaylists.length} playlists · {totalVideos} videos
                </span>
                <span className="font-medium">
                  {completedVideos}/{totalVideos} completed
                </span>
              </div>
              <Progress value={overallProgress} className="h-3" />
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(watchedDuration)} / {formatDuration(totalDuration)}</span>
                </div>
                <span className="font-medium">{Math.round(overallProgress)}% complete</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Playlists List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Course Content</h2>
          
          {validPlaylists.map((playlist, index) => {
            if (!playlist) return null
            const isActive = index === nextPlaylistIndex
            
            return (
              <Card 
                key={playlist.id}
                className={`overflow-hidden transition-all ${
                  playlist.isCompleted 
                    ? "opacity-75" 
                    : isActive 
                      ? "ring-2 ring-white/20" 
                      : ""
                }`}
              >
                <div className="flex">
                  {/* Thumbnail */}
                  <div className="relative w-48 shrink-0">
                    {playlist.thumbnail_url ? (
                      <img
                        src={playlist.thumbnail_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center min-h-[120px]">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    {playlist.isCompleted && (
                      <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      Part {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{playlist.title}</h3>
                        {playlist.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {playlist.description}
                          </p>
                        )}
                      </div>
                      {playlist.nextVideo && !playlist.isCompleted && (
                        <Link href={`/watch/${playlist.nextVideo.id}`}>
                          <Button size="sm" className={isActive ? "bg-white text-black hover:bg-white/90" : ""}>
                            {playlist.completedVideos > 0 ? "Continue" : "Start"}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {playlist.completedVideos}/{playlist.totalVideos} videos
                        </span>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDuration(playlist.watchedDuration)} / {formatDuration(playlist.totalDuration)}</span>
                        </div>
                      </div>
                      <Progress value={playlist.progressPercent} className="h-1.5" />
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}
