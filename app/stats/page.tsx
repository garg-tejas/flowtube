import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, CheckCircle, Clock, TrendingUp } from "lucide-react"
import { AuthenticatedLayout } from "@/components/authenticated-layout"

export default async function StatsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get total watch time
  const { data: progress } = await supabase.from("watch_progress").select("progress_seconds").eq("user_id", user.id)

  const totalWatchTime = progress?.reduce((sum, item) => sum + item.progress_seconds, 0) || 0

  // Get completed videos count
  const { count: completedCount } = await supabase
    .from("watch_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("completed", true)

  // Get total videos
  const { count: totalVideos } = await supabase
    .from("watch_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Get playlists count
  const { count: playlistsCount } = await supabase
    .from("playlists")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Calculate streak (days with activity in last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentActivity } = await supabase
    .from("watch_progress")
    .select("last_watched_at")
    .eq("user_id", user.id)
    .gte("last_watched_at", thirtyDaysAgo.toISOString())
    .order("last_watched_at", { ascending: false })

  const uniqueDays = new Set(recentActivity?.map((item) => new Date(item.last_watched_at).toDateString())).size

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const completionRate = totalVideos ? Math.round(((completedCount || 0) / totalVideos) * 100) : 0

  return (
    <AuthenticatedLayout title="Statistics">
      <div className="p-6 space-y-6">
        <p className="text-sm text-muted-foreground">Your learning insights</p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Watch Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(totalWatchTime)}</div>
              <p className="text-xs text-muted-foreground">Across all videos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount || 0}</div>
              <p className="text-xs text-muted-foreground">{completionRate}% completion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Days</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueDays}</div>
              <p className="text-xs text-muted-foreground">In the last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Playlists</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playlistsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Total playlists</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Learning Insights</CardTitle>
            <CardDescription>Your progress at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Videos Started</span>
                <span className="font-medium">{totalVideos || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Videos Completed</span>
                <span className="font-medium">{completedCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Average Watch Time per Day</span>
                <span className="font-medium">
                  {uniqueDays > 0 ? formatTime(Math.floor(totalWatchTime / uniqueDays)) : "0m"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  )
}
