import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VideoFeedCard } from "@/components/video-feed-card"
import { Button } from "@/components/ui/button"
import { CategoryFilter } from "@/components/category-filter"
import Link from "next/link"
import { Plus, Sparkles } from "lucide-react"
import { GlobalSearch, SearchButton } from "@/components/global-search"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { ContinueWatchingSection } from "@/components/continue-watching"
import { EmptyState } from "@/components/empty-state"
import { AuthenticatedLayout } from "@/components/authenticated-layout"

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const selectedCategory = params.category

  let playlistsQuery = supabase
    .from("playlists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (selectedCategory && selectedCategory !== "all") {
    playlistsQuery = playlistsQuery.eq("category", selectedCategory)
  }

  const { data: playlists } = await playlistsQuery

  const { data: allPlaylists } = await supabase
    .from("playlists")
    .select("category")
    .eq("user_id", user.id)
    .not("category", "is", null)

  const categories = Array.from(new Set(allPlaylists?.map((p) => p.category).filter(Boolean) || []))

  // Fetch continue watching videos (in-progress, not completed)
  const { data: continueWatchingData } = await supabase
    .from("watch_progress")
    .select(`
      progress_seconds,
      last_watched_at,
      video:videos (
        id,
        title,
        thumbnail_url,
        duration,
        playlist:playlists (
          title
        )
      )
    `)
    .eq("user_id", user.id)
    .eq("completed", false)
    .gt("progress_seconds", 0)
    .order("last_watched_at", { ascending: false })
    .limit(8)

  const continueWatchingVideos = (continueWatchingData || [])
    .filter((item: any) => item.video)
    .map((item: any) => ({
      video: item.video,
      playlist_title: item.video.playlist?.title || "Unknown",
      progress_seconds: item.progress_seconds,
      last_watched_at: item.last_watched_at,
    }))

  const nextVideos = await Promise.all(
    (playlists || []).map(async (playlist) => {
      const { data: videos } = await supabase
        .from("videos")
        .select("*")
        .eq("playlist_id", playlist.id)
        .order("position", { ascending: true })

      if (!videos || videos.length === 0) return null

      const { data: progressList } = await supabase
        .from("watch_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("playlist_id", playlist.id)

      let nextVideo = videos[0]

      for (const video of videos) {
        const progress = progressList?.find((p) => p.video_id === video.id)
        if (!progress || !progress.completed) {
          nextVideo = video
          break
        }
      }

      const videoProgress = progressList?.find((p) => p.video_id === nextVideo.id)

      return {
        video: nextVideo,
        playlist,
        progress: videoProgress,
      }
    }),
  )

  const validVideos = nextVideos.filter((v) => v !== null)

  return (
    <AuthenticatedLayout title="Your Feed">
      <GlobalSearch />
      <KeyboardShortcuts />

      <div className="p-6 space-y-10">
        {/* Continue Watching Section */}
        <ContinueWatchingSection videos={continueWatchingVideos} />

        {/* Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Curated Feed</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-gradient-blue">Up Next</h2>
              <p className="text-muted-foreground text-sm mt-1">Next unwatched video from each playlist</p>
            </div>
            <Link href="/playlists">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Playlist
              </Button>
            </Link>
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && <CategoryFilter categories={categories} selectedCategory={selectedCategory} />}

        {/* Video Grid */}
        {validVideos.length === 0 ? (
          <EmptyState type="feed" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {validVideos.map((item, i) => (
              <div
                key={item.video.id}
                className="animate-fade-in-up opacity-0"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "forwards" }}
              >
                <VideoFeedCard video={item.video} playlist={item.playlist} progress={item.progress} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}
