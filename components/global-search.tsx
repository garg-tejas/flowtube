"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"
import { Play, ListVideo, Clock, Search, BookOpen } from "lucide-react"

type SearchResult = {
  type: "video" | "playlist" | "learning_path"
  id: string
  title: string
  subtitle?: string
  thumbnail?: string
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsLoading(false)
        return
      }

      const searchResults: SearchResult[] = []

      // Search videos
      const { data: videos, error: videosError } = await supabase
        .from("videos")
        .select(`
          id,
          title,
          thumbnail_url,
          playlist:playlists!inner(user_id, title)
        `)
        .eq("playlist.user_id", user.id)
        .ilike("title", `%${searchQuery}%`)
        .limit(5)

      videos?.forEach(video => {
        searchResults.push({
          type: "video",
          id: video.id,
          title: video.title,
          subtitle: (video.playlist as any)?.title,
          thumbnail: video.thumbnail_url || undefined,
        })
      })

      // Search playlists
      const { data: playlists, error: playlistsError } = await supabase
        .from("playlists")
        .select("id, title, thumbnail_url, category")
        .eq("user_id", user.id)
        .ilike("title", `%${searchQuery}%`)
        .limit(5)

      playlists?.forEach(playlist => {
        searchResults.push({
          type: "playlist",
          id: playlist.id,
          title: playlist.title,
          subtitle: playlist.category || "Playlist",
          thumbnail: playlist.thumbnail_url || undefined,
        })
      })

      // Search learning paths
      const { data: learningPaths, error: pathsError } = await supabase
        .from("learning_paths")
        .select("id, title, description")
        .eq("user_id", user.id)
        .ilike("title", `%${searchQuery}%`)
        .limit(3)

      learningPaths?.forEach(path => {
        searchResults.push({
          type: "learning_path",
          id: path.id,
          title: path.title,
          subtitle: path.description || "Learning Path",
        })
      })

      setResults(searchResults)
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    const debounce = setTimeout(() => {
      search(query)
    }, 300)

    return () => clearTimeout(debounce)
  }, [query, search])

  const handleSelect = (result: SearchResult) => {
    // Save to recent searches
    const recent = [result, ...recentSearches.filter(r => r.id !== result.id)].slice(0, 5)
    setRecentSearches(recent)

    setOpen(false)
    setQuery("")

    switch (result.type) {
      case "video":
        router.push(`/watch/${result.id}`)
        break
      case "playlist":
        router.push(`/playlists?highlight=${result.id}`)
        break
      case "learning_path":
        router.push(`/learn/${result.id}`)
        break
    }
  }

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4" />
      case "playlist":
        return <ListVideo className="h-4 w-4" />
      case "learning_path":
        return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search videos, playlists, learning paths..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isLoading ? "Searching..." : "No results found."}
        </CommandEmpty>

        {results.length > 0 && (
          <>
            {results.filter(r => r.type === "video").length > 0 && (
              <CommandGroup heading="Videos">
                {results.filter(r => r.type === "video").map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => handleSelect(result)}
                    className="flex items-center gap-3 py-3"
                  >
                    {result.thumbnail ? (
                      <img
                        src={result.thumbnail}
                        alt=""
                        className="w-12 h-8 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                        {getIcon(result.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      {result.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {results.filter(r => r.type === "playlist").length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Playlists">
                  {results.filter(r => r.type === "playlist").map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-3 py-3"
                    >
                      {result.thumbnail ? (
                        <img
                          src={result.thumbnail}
                          alt=""
                          className="w-12 h-8 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                          {getIcon(result.type)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            {results.filter(r => r.type === "learning_path").length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Learning Paths">
                  {results.filter(r => r.type === "learning_path").map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center gap-3 py-3"
                    >
                      <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </>
        )}

        {recentSearches.length > 0 && !query && (
          <CommandGroup heading="Recent">
            {recentSearches.map((result) => (
              <CommandItem
                key={result.id}
                onSelect={() => handleSelect(result)}
                className="flex items-center gap-3 py-3"
              >
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{result.title}</p>
                  {result.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
      <div className="border-t px-3 py-2 text-xs text-muted-foreground">
        Press <kbd className="px-1.5 py-0.5 bg-muted rounded">/</kbd> to search anywhere
      </div>
    </CommandDialog>
  )
}

export function SearchButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <button
      onClick={() => {
        const event = new KeyboardEvent("keydown", { key: "/" })
        document.dispatchEvent(event)
      }}
      className={`flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-lg transition-colors ${className}`}
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Search...</span>
      <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs bg-background rounded border">/</kbd>
    </button>
  )
}
