"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, GripVertical, BookOpen } from "lucide-react"

type Playlist = {
  id: string
  title: string
  thumbnail_url: string | null
}

type CreateLearningPathDialogProps = {
  playlists: Playlist[]
}

export function CreateLearningPathDialog({ playlists }: CreateLearningPathDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleTogglePlaylist = (playlistId: string) => {
    setSelectedPlaylists(prev => 
      prev.includes(playlistId)
        ? prev.filter(id => id !== playlistId)
        : [...prev, playlistId]
    )
  }

  const handleCreate = async () => {
    if (!title.trim() || selectedPlaylists.length === 0) return

    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setIsLoading(false)
      return
    }

    // Create learning path
    const { data: learningPath, error: pathError } = await supabase
      .from("learning_paths")
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
      })
      .select()
      .single()

    if (pathError || !learningPath) {
      console.error("Error creating learning path:", pathError)
      setIsLoading(false)
      return
    }

    // Add playlists to the learning path
    const playlistEntries = selectedPlaylists.map((playlistId, index) => ({
      learning_path_id: learningPath.id,
      playlist_id: playlistId,
      position: index,
    }))

    const { error: playlistsError } = await supabase
      .from("learning_path_playlists")
      .insert(playlistEntries)

    if (playlistsError) {
      console.error("Error adding playlists:", playlistsError)
    }

    setIsLoading(false)
    setOpen(false)
    setTitle("")
    setDescription("")
    setSelectedPlaylists([])
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-black hover:bg-white/90">
          <Plus className="h-4 w-4 mr-2" />
          Create Learning Path
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Create Learning Path
          </DialogTitle>
          <DialogDescription>
            Combine multiple playlists into a structured learning curriculum
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Full Stack Web Development"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this learning path covers..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Select Playlists ({selectedPlaylists.length} selected)</Label>
            <ScrollArea className="h-[200px] border rounded-md p-2">
              {playlists.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No playlists available. Add some playlists first.
                </p>
              ) : (
                <div className="space-y-2">
                  {playlists.map((playlist) => {
                    const isSelected = selectedPlaylists.includes(playlist.id)
                    const order = selectedPlaylists.indexOf(playlist.id) + 1

                    return (
                      <div
                        key={playlist.id}
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${
                          isSelected ? "bg-white/10" : "hover:bg-muted/50"
                        }`}
                        onClick={() => handleTogglePlaylist(playlist.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleTogglePlaylist(playlist.id)}
                        />
                        {isSelected && (
                          <span className="w-6 h-6 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center">
                            {order}
                          </span>
                        )}
                        {playlist.thumbnail_url ? (
                          <img
                            src={playlist.thumbnail_url}
                            alt=""
                            className="w-12 h-8 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="text-sm font-medium flex-1 truncate">
                          {playlist.title}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
            <p className="text-xs text-muted-foreground">
              Click playlists in the order you want to learn them
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || selectedPlaylists.length === 0 || isLoading}
          >
            {isLoading ? "Creating..." : "Create Path"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
