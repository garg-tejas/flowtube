"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Play, 
  Plus, 
  BookOpen, 
  Clock, 
  Trophy, 
  Search,
  Sparkles,
  ArrowRight
} from "lucide-react"

type EmptyStateProps = {
  type: "feed" | "playlists" | "history" | "stats" | "search" | "learning-paths" | "achievements"
  title?: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

const emptyStateConfig = {
  feed: {
    icon: Play,
    title: "Your feed is empty",
    description: "Add your first YouTube playlist to start curating your personalized learning journey.",
    tips: [
      "Paste any YouTube playlist URL to get started",
      "Organize playlists by category for easy filtering",
      "Track your progress across all videos",
    ],
    action: { label: "Add Your First Playlist", href: "/playlists" },
  },
  playlists: {
    icon: BookOpen,
    title: "No playlists yet",
    description: "Import YouTube playlists to organize your learning content and track your progress.",
    tips: [
      "Support for any public YouTube playlist",
      "Automatic video syncing and metadata",
      "Progress tracking and notes for each video",
    ],
  },
  history: {
    icon: Clock,
    title: "No watch history",
    description: "Your viewing history will appear here once you start watching videos.",
    tips: [
      "Resume videos from where you left off",
      "See your progress on each video",
      "Track when you last watched",
    ],
    action: { label: "Browse Feed", href: "/feed" },
  },
  stats: {
    icon: Sparkles,
    title: "No stats yet",
    description: "Start watching videos to see your learning insights and statistics.",
    tips: [
      "Track total watch time",
      "Monitor completion rates",
      "See your learning streak",
    ],
    action: { label: "Start Learning", href: "/feed" },
  },
  search: {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search terms or browse your content.",
    tips: [
      "Search by video or playlist title",
      "Use shorter keywords",
      "Check for typos",
    ],
  },
  "learning-paths": {
    icon: BookOpen,
    title: "No learning paths",
    description: "Create learning paths to combine multiple playlists into a structured curriculum.",
    tips: [
      "Combine related playlists together",
      "Set a learning order for playlists",
      "Track progress across the entire path",
    ],
  },
  achievements: {
    icon: Trophy,
    title: "No achievements yet",
    description: "Complete videos and playlists to unlock achievements and showcase your progress.",
    tips: [
      "Complete your first video",
      "Finish an entire playlist",
      "Build a learning streak",
    ],
    action: { label: "Start Earning", href: "/feed" },
  },
}

export function EmptyState({ type, title, description, action }: EmptyStateProps) {
  const config = emptyStateConfig[type]
  const Icon = config.icon
  const displayTitle = title || config.title
  const displayDescription = description || config.description
  const displayAction = action || config.action

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="max-w-lg text-center space-y-8">
        {/* Icon */}
        <div className="relative mx-auto">
          <div className="absolute inset-0 w-32 h-32 rounded-full bg-white/10 blur-2xl opacity-50 animate-pulse" />
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center">
            <Icon className="h-14 w-14 text-white/80" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-foreground">{displayTitle}</h3>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">{displayDescription}</p>
        </div>

        {/* Tips */}
        {config.tips && (
          <div className="bg-muted/30 rounded-xl p-6 text-left space-y-3 border border-white/5">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Quick Tips
            </h4>
            <ul className="space-y-2">
              {config.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-white/50 mt-0.5">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action */}
        {displayAction && (
          <div>
            {displayAction.href ? (
              <Link href={displayAction.href}>
                <Button size="lg" className="bg-white text-black hover:bg-white/90">
                  <Plus className="h-5 w-5 mr-2" />
                  {displayAction.label}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Button size="lg" onClick={displayAction.onClick} className="bg-white text-black hover:bg-white/90">
                <Plus className="h-5 w-5 mr-2" />
                {displayAction.label}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
