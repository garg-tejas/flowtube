"use client"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { YouTubePlayer } from "@/components/youtube-player"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, ArrowRight, BookOpen, FileText, Bookmark, Tag } from "lucide-react"
import { LinkifyText } from "@/components/linkify-text"
import { NotesEditor } from "@/components/notes-editor"
import { VideoCompletionDialog } from "@/components/video-completion-dialog"
import { BookmarksPanel } from "@/components/bookmarks-panel"
import { VideoTags } from "@/components/video-tags"
import { PlaybackSpeed } from "@/components/playback-speed"
import { FocusMode, FocusModeOverlay } from "@/components/focus-mode"
import { VideoChapters } from "@/components/video-chapters"
import { AuthenticatedLayout } from "@/components/authenticated-layout"
import useSWR from "swr"
import { useState, useRef } from "react"

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const videoId = params.videoId as string
  const supabase = createClient()
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [focusModeEnabled, setFocusModeEnabled] = useState(false)
  const playerRef = useRef<any>(null)

  const { data: userData, error: userError } = useSWR(
    "user",
    async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()
        if (error) {
          console.error("Auth error:", error)
          throw error
        }
        if (!user) {
          router.push("/auth/login")
          return null
        }
        return user
      } catch (err) {
        console.error("Failed to get user:", err)
        router.push("/auth/login")
        return null
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  )

  const { data: video } = useSWR(
    userData ? `video-${videoId}` : null,
    async () => {
      try {
        const { data, error } = await supabase
          .from("videos")
          .select(
            `
          *,
          playlists (
            id,
            title,
            user_id
          )
        `,
          )
          .eq("id", videoId)
          .single()

        if (error) throw error

        if (!data || data.playlists?.user_id !== userData?.id) {
          router.push("/")
          return null
        }

        return data
      } catch (err) {
        console.error("Failed to fetch video:", err)
        router.push("/")
        return null
      }
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false },
  )

  const { data: progress, mutate: mutateProgress } = useSWR(
    userData && video ? `progress-${videoId}` : null,
    async () => {
      try {
        const { data } = await supabase
          .from("watch_progress")
          .select("*")
          .eq("user_id", userData!.id)
          .eq("video_id", videoId)
          .maybeSingle()

        return data
      } catch (err) {
        console.error("Failed to fetch progress:", err)
        return null
      }
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false },
  )

  const { data: previousVideo } = useSWR(
    userData && video ? `previous-video-${videoId}` : null,
    async () => {
      try {
        const { data } = await supabase
          .from("videos")
          .select("*")
          .eq("playlist_id", video!.playlist_id)
          .lt("position", video!.position)
          .order("position", { ascending: false })
          .limit(1)
          .maybeSingle()

        return data
      } catch (err) {
        console.error("Failed to fetch previous video:", err)
        return null
      }
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false },
  )

  const { data: nextVideo } = useSWR(
    userData && video ? `next-video-${videoId}` : null,
    async () => {
      try {
        const { data } = await supabase
          .from("videos")
          .select("*")
          .eq("playlist_id", video!.playlist_id)
          .gt("position", video!.position)
          .order("position", { ascending: true })
          .limit(1)
          .maybeSingle()

        return data
      } catch (err) {
        console.error("Failed to fetch next video:", err)
        return null
      }
    },
    { revalidateOnFocus: false, revalidateOnReconnect: false },
  )

  const handleVideoEnd = () => {
    setShowCompletionDialog(true)
  }

  const handleSeekTo = (time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time)
    }
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Unable to authenticate. Please try logging in again.</p>
            <Link href="/auth/login">
              <Button>Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!userData || !video) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed)
    if (playerRef.current?.setPlaybackRate) {
      playerRef.current.setPlaybackRate(speed)
    }
  }

  return (
    <div className={`min-h-screen bg-background ${focusModeEnabled ? "focus-mode" : ""}`}>
      {focusModeEnabled && <FocusModeOverlay onExit={() => setFocusModeEnabled(false)} />}

      {!focusModeEnabled ? (
        <AuthenticatedLayout title={video?.title || "Loading..."}>
          <div className="p-6 space-y-6">

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {previousVideo ? (
                  <Link href={`/watch/${previousVideo.id}`}>
                    <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 bg-transparent">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
                {nextVideo && (
                  <Link href={`/watch/${nextVideo.id}`}>
                    <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5 bg-transparent">
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2">
                <PlaybackSpeed onSpeedChange={handleSpeedChange} />
                <FocusMode onToggle={setFocusModeEnabled} isEnabled={focusModeEnabled} />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-4">
                <YouTubePlayer
                  key={video.youtube_video_id}
                  videoId={video.youtube_video_id}
                  playlistId={video.playlist_id}
                  videoDbId={video.id}
                  onProgressUpdate={() => mutateProgress()}
                  onVideoEnd={handleVideoEnd}
                  ref={playerRef}
                  onTimeUpdate={setCurrentTime}
                />

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-gradient-blue">{video.title}</CardTitle>
                      {nextVideo && (
                        <Link href={`/watch/${nextVideo.id}`}>
                          <Button size="sm" className="gradient-button text-white font-semibold">
                            Next Video
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {video.description && (
                      <LinkifyText text={video.description} className="text-muted-foreground whitespace-pre-wrap" />
                    )}
                    {progress && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                        <p className="text-sm text-muted-foreground">
                          {progress.completed ? (
                            <span className="text-emerald-500 font-medium">✓ Completed</span>
                          ) : (
                            <span>Progress: {Math.floor(progress.progress_seconds / 60)} minutes watched</span>
                          )}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <CardTitle className="text-base font-semibold">Playlist</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm font-medium text-foreground">{video.playlists?.title}</p>
                    <p className="text-xs text-muted-foreground">Video {video.position + 1} in playlist</p>
                    {previousVideo && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Previous: {previousVideo.title.substring(0, 50)}...
                      </p>
                    )}
                    {nextVideo && (
                      <p className="text-xs text-muted-foreground">Next: {nextVideo.title.substring(0, 50)}...</p>
                    )}
                  </CardContent>
                </Card>

                <VideoChapters
                  description={video.description}
                  currentTime={currentTime}
                  onSeek={handleSeekTo}
                />

                {/* Sidebar with Tabs */}
                <div className="lg:col-span-1">
                  <Tabs defaultValue="chapters" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4">
                      <TabsTrigger value="chapters" className="flex items-center gap-2 text-xs sm:text-sm">
                        <BookOpen className="h-4 w-4" />
                        <span className="hidden sm:inline">Chapters</span>
                      </TabsTrigger>
                      <TabsTrigger value="bookmarks" className="flex items-center gap-2 text-xs sm:text-sm">
                        <Bookmark className="h-4 w-4" />
                        <span className="hidden sm:inline">Marks</span>
                      </TabsTrigger>
                      <TabsTrigger value="notes" className="flex items-center gap-2 text-xs sm:text-sm">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Notes</span>
                      </TabsTrigger>
                      <TabsTrigger value="tags" className="flex items-center gap-2 text-xs sm:text-sm">
                        <Tag className="h-4 w-4" />
                        <span className="hidden sm:inline">Tags</span>
                      </TabsTrigger>
                    </TabsList>

                    <div className="mt-4 space-y-4">
                      <TabsContent value="chapters" className="space-y-4">
                        <VideoChapters
                          description={video.description}
                          currentTime={currentTime}
                          onSeek={handleSeekTo}
                        />
                      </TabsContent>

                      <TabsContent value="bookmarks" className="space-y-4">
                        <BookmarksPanel videoId={video.id} currentTime={currentTime} onSeekTo={handleSeekTo} />
                      </TabsContent>

                      <TabsContent value="notes" className="space-y-4">
                        <NotesEditor videoId={video.id} userId={userData.id} />
                      </TabsContent>

                      <TabsContent value="tags" className="space-y-4">
                        <VideoTags videoId={video.id} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </AuthenticatedLayout>
      ) : (
        // Focus mode layout
        <div className="min-h-screen bg-background p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <Button onClick={() => setFocusModeEnabled(false)} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Exit Focus Mode
              </Button>
              <PlaybackSpeed onSpeedChange={handleSpeedChange} />
            </div>

            <YouTubePlayer
              key={video.youtube_video_id}
              videoId={video.youtube_video_id}
              playlistId={video.playlist_id}
              videoDbId={video.id}
              onProgressUpdate={() => mutateProgress()}
              onVideoEnd={handleVideoEnd}
              ref={playerRef}
              onTimeUpdate={setCurrentTime}
            />

            <VideoCompletionDialog
              open={showCompletionDialog}
              onOpenChange={setShowCompletionDialog}
              nextVideoId={nextVideo?.id}
              nextVideoTitle={nextVideo?.title}
            />
          </div>
        </div>
      )}
    </div>
  )
}