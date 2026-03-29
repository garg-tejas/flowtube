"use client"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

type YouTubePlayerProps = {
  videoId: string
  playlistId: string
  videoDbId: string
  startSeconds?: number
  onVideoEnd?: () => void
  onProgressUpdate?: () => void
  onTimeUpdate?: (time: number) => void
}

let isYouTubeAPILoaded = false
let isYouTubeAPILoading = false
const apiLoadCallbacks: (() => void)[] = []

export const YouTubePlayer = forwardRef<any, YouTubePlayerProps>(function YouTubePlayer(
  { videoId, playlistId, videoDbId, startSeconds = 0, onVideoEnd, onProgressUpdate, onTimeUpdate },
  ref,
) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()
  const lastSavedTimeRef = useRef(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const videoEndCalledRef = useRef(false)
  const playerInitializedRef = useRef(false)

  useImperativeHandle(ref, () => ({
    seekTo: (time: number) => {
      if (playerRef.current && playerRef.current.seekTo) {
        playerRef.current.seekTo(time, true)
      }
    },
  }))

  useEffect(() => {
    videoEndCalledRef.current = false
    playerInitializedRef.current = false

    const loadYouTubeAPI = () => {
      return new Promise<void>((resolve) => {
        if (isYouTubeAPILoaded) {
          resolve()
          return
        }

        if (isYouTubeAPILoading) {
          apiLoadCallbacks.push(resolve)
          return
        }

        isYouTubeAPILoading = true
        const tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"
        tag.onload = () => {
          // Wait for YT object to be available
          const checkYT = setInterval(() => {
            if ((window as any).YT && (window as any).YT.Player) {
              clearInterval(checkYT)
              isYouTubeAPILoaded = true
              isYouTubeAPILoading = false
              resolve()
              apiLoadCallbacks.forEach((cb) => cb())
              apiLoadCallbacks.length = 0
            }
          }, 100)
        }
        const firstScriptTag = document.getElementsByTagName("script")[0]
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
      })
    }

    const initPlayer = async () => {
      if (!containerRef.current || playerInitializedRef.current) return

      await loadYouTubeAPI()

      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }

      playerInitializedRef.current = true

      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          start: startSeconds,
          enablejsapi: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event: any) => {
            progressIntervalRef.current = setInterval(() => {
              if (playerRef.current && playerRef.current.getCurrentTime) {
                const currentTime = playerRef.current.getCurrentTime()
                const duration = playerRef.current.getDuration()

                if (onTimeUpdate) {
                  onTimeUpdate(currentTime)
                }

                if (currentTime > 0 && Math.abs(currentTime - lastSavedTimeRef.current) >= 5) {
                  saveProgress(currentTime, duration, false)
                  lastSavedTimeRef.current = currentTime
                }

                if (duration && currentTime >= duration - 3 && !videoEndCalledRef.current) {
                  videoEndCalledRef.current = true
                  saveProgress(currentTime, duration, true)
                  if (progressIntervalRef.current) {
                    clearInterval(progressIntervalRef.current)
                  }
                  if (onVideoEnd) {
                    setTimeout(() => onVideoEnd(), 1000)
                  }
                }
              }
            }, 5000)
          },
          onStateChange: (event: any) => {
            if (event.data === 0 && !videoEndCalledRef.current) {
              // Video ended
              videoEndCalledRef.current = true
              if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
                const currentTime = playerRef.current.getCurrentTime()
                const duration = playerRef.current.getDuration()
                saveProgress(currentTime, duration, true)
              }
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
              }
              if (onVideoEnd) {
                setTimeout(() => onVideoEnd(), 1000)
              }
            } else if (event.data === 2) {
              // Video paused - save progress
              if (playerRef.current && playerRef.current.getCurrentTime && playerRef.current.getDuration) {
                const currentTime = playerRef.current.getCurrentTime()
                const duration = playerRef.current.getDuration()
                saveProgress(currentTime, duration, false)
              }
            }
          },
        },
      })
    }

    initPlayer()

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy()
        playerRef.current = null
      }
      playerInitializedRef.current = false
    }
  }, [videoId])

  const saveProgress = async (currentTime: number, duration: number, completed: boolean) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    if (!duration || currentTime <= 0) return

    const { data: existing } = await supabase
      .from("watch_progress")
      .select("id")
      .eq("user_id", user.id)
      .eq("video_id", videoDbId)
      .maybeSingle()

    if (existing) {
      await supabase
        .from("watch_progress")
        .update({
          progress_seconds: Math.floor(currentTime),
          completed,
          last_watched_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
    } else {
      await supabase.from("watch_progress").insert({
        user_id: user.id,
        video_id: videoDbId,
        playlist_id: playlistId,
        progress_seconds: Math.floor(currentTime),
        completed,
        last_watched_at: new Date().toISOString(),
      })
    }

    setIsCompleted(completed)

    if (onProgressUpdate) {
      onProgressUpdate()
    }
  }

  const markAsComplete = async () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime()
      const duration = playerRef.current.getDuration()
      await saveProgress(currentTime, duration, true)
    }
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!playerRef.current) return

      // Ignore if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      switch (e.key.toLowerCase()) {
        case " ": // Space to pause/play
          e.preventDefault()
          const state = playerRef.current.getPlayerState()
          if (state === 1) {
            // Playing
            playerRef.current.pauseVideo()
          } else {
            playerRef.current.playVideo()
          }
          break
        case "arrowleft": // Left arrow to rewind 5 seconds
          e.preventDefault()
          const currentTime = playerRef.current.getCurrentTime()
          playerRef.current.seekTo(Math.max(0, currentTime - 5), true)
          break
        case "arrowright": // Right arrow to forward 5 seconds
          e.preventDefault()
          const time = playerRef.current.getCurrentTime()
          playerRef.current.seekTo(time + 5, true)
          break
        case "n": // N for next video
          e.preventDefault()
          if (onVideoEnd) {
            onVideoEnd()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [onVideoEnd])

  return (
    <div className="space-y-4">
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <div ref={containerRef} className="absolute top-0 left-0 w-full h-full" />
      </div>
      {!isCompleted && (
        <Button onClick={markAsComplete} variant="outline" size="sm" className="w-full bg-transparent">
          <Check className="mr-2 h-4 w-4" />
          Mark as Complete
        </Button>
      )}
      <div className="text-xs text-muted-foreground text-center">
        Keyboard: Space=Play/Pause • ←/→=Skip 5s • N=Next Video
      </div>
    </div>
  )
})
