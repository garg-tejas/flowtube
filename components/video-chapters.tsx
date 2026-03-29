"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { List, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

type Chapter = {
  title: string
  startTime: number
}

type VideoChaptersProps = {
  description: string | null
  currentTime: number
  onSeek: (time: number) => void
}

// Parse chapters from YouTube video description
function parseChapters(description: string): Chapter[] {
  if (!description) return []

  const lines = description.split("\n")
  const chapters: Chapter[] = []
  
  // Match timestamps like "0:00", "1:23", "12:34", "1:23:45"
  const timestampRegex = /^(\d{1,2}:)?(\d{1,2}):(\d{2})\s+(.+)$/

  for (const line of lines) {
    const match = line.trim().match(timestampRegex)
    if (match) {
      const hours = match[1] ? parseInt(match[1].replace(":", "")) : 0
      const minutes = parseInt(match[2])
      const seconds = parseInt(match[3])
      const title = match[4].trim()
      
      const startTime = hours * 3600 + minutes * 60 + seconds
      chapters.push({ title, startTime })
    }
  }

  return chapters
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function VideoChapters({ description, currentTime, onSeek }: VideoChaptersProps) {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeChapterIndex, setActiveChapterIndex] = useState(0)

  useEffect(() => {
    if (description) {
      const parsed = parseChapters(description)
      setChapters(parsed)
    }
  }, [description])

  useEffect(() => {
    // Find current chapter based on playback time
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentTime >= chapters[i].startTime) {
        setActiveChapterIndex(i)
        break
      }
    }
  }, [currentTime, chapters])

  if (chapters.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <List className="h-4 w-4" />
            Chapters ({chapters.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="pt-0">
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-1">
              {chapters.map((chapter, index) => {
                const isActive = index === activeChapterIndex
                const nextChapter = chapters[index + 1]
                const chapterDuration = nextChapter 
                  ? nextChapter.startTime - chapter.startTime 
                  : null

                return (
                  <button
                    key={index}
                    onClick={() => onSeek(chapter.startTime)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      isActive 
                        ? "bg-white/10 border border-white/20" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-sm font-mono shrink-0 ${isActive ? "text-white" : "text-muted-foreground"}`}>
                        {formatTime(chapter.startTime)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isActive ? "text-white" : ""}`}>
                          {chapter.title}
                        </p>
                        {chapterDuration && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatTime(chapterDuration)} duration
                          </p>
                        )}
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-white shrink-0 mt-1.5" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  )
}
