import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PlaylistList } from "@/components/playlist-list"
import { AddPlaylistDialog } from "@/components/add-playlist-dialog"
import { AuthenticatedLayout } from "@/components/authenticated-layout"

export default async function PlaylistsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch user's playlists
  const { data: playlists } = await supabase
    .from("playlists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <AuthenticatedLayout title="Your Playlists">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Manage your content</p>
          </div>
          <AddPlaylistDialog />
        </div>

        <PlaylistList playlists={playlists || []} />
      </div>
    </AuthenticatedLayout>
  )
}
