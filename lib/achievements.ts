import { SupabaseClient } from "@supabase/supabase-js"

export type AchievementType =
  | "first_video"
  | "first_playlist"
  | "video_5"
  | "video_10"
  | "video_25"
  | "video_50"
  | "video_100"
  | "playlist_complete"
  | "playlists_3"
  | "playlists_5"
  | "playlists_10"
  | "streak_3"
  | "streak_7"
  | "streak_30"
  | "watch_time_1h"
  | "watch_time_10h"
  | "watch_time_50h"
  | "watch_time_100h"
  | "learning_path_complete"
  | "night_owl"
  | "early_bird"

export type Achievement = {
  type: AchievementType
  title: string
  description: string
  icon: string
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary"
  requirement: string
}

export const ACHIEVEMENTS: Record<AchievementType, Achievement> = {
  first_video: {
    type: "first_video",
    title: "First Steps",
    description: "Complete your first video",
    icon: "Play",
    rarity: "common",
    requirement: "Complete 1 video",
  },
  first_playlist: {
    type: "first_playlist",
    title: "Curator",
    description: "Add your first playlist",
    icon: "ListVideo",
    rarity: "common",
    requirement: "Add 1 playlist",
  },
  video_5: {
    type: "video_5",
    title: "Getting Started",
    description: "Complete 5 videos",
    icon: "Star",
    rarity: "common",
    requirement: "Complete 5 videos",
  },
  video_10: {
    type: "video_10",
    title: "Dedicated Learner",
    description: "Complete 10 videos",
    icon: "Award",
    rarity: "uncommon",
    requirement: "Complete 10 videos",
  },
  video_25: {
    type: "video_25",
    title: "Knowledge Seeker",
    description: "Complete 25 videos",
    icon: "BookOpen",
    rarity: "uncommon",
    requirement: "Complete 25 videos",
  },
  video_50: {
    type: "video_50",
    title: "Scholar",
    description: "Complete 50 videos",
    icon: "GraduationCap",
    rarity: "rare",
    requirement: "Complete 50 videos",
  },
  video_100: {
    type: "video_100",
    title: "Master Learner",
    description: "Complete 100 videos",
    icon: "Crown",
    rarity: "epic",
    requirement: "Complete 100 videos",
  },
  playlist_complete: {
    type: "playlist_complete",
    title: "Completionist",
    description: "Complete an entire playlist",
    icon: "CheckCircle",
    rarity: "uncommon",
    requirement: "Complete all videos in a playlist",
  },
  playlists_3: {
    type: "playlists_3",
    title: "Collector",
    description: "Add 3 playlists",
    icon: "Folder",
    rarity: "common",
    requirement: "Add 3 playlists",
  },
  playlists_5: {
    type: "playlists_5",
    title: "Organizer",
    description: "Add 5 playlists",
    icon: "FolderOpen",
    rarity: "uncommon",
    requirement: "Add 5 playlists",
  },
  playlists_10: {
    type: "playlists_10",
    title: "Library Builder",
    description: "Add 10 playlists",
    icon: "Library",
    rarity: "rare",
    requirement: "Add 10 playlists",
  },
  streak_3: {
    type: "streak_3",
    title: "Consistent",
    description: "3-day learning streak",
    icon: "Flame",
    rarity: "common",
    requirement: "Watch videos 3 days in a row",
  },
  streak_7: {
    type: "streak_7",
    title: "Week Warrior",
    description: "7-day learning streak",
    icon: "Flame",
    rarity: "uncommon",
    requirement: "Watch videos 7 days in a row",
  },
  streak_30: {
    type: "streak_30",
    title: "Monthly Master",
    description: "30-day learning streak",
    icon: "Flame",
    rarity: "epic",
    requirement: "Watch videos 30 days in a row",
  },
  watch_time_1h: {
    type: "watch_time_1h",
    title: "Hour One",
    description: "Watch 1 hour of content",
    icon: "Clock",
    rarity: "common",
    requirement: "1 hour total watch time",
  },
  watch_time_10h: {
    type: "watch_time_10h",
    title: "Time Invested",
    description: "Watch 10 hours of content",
    icon: "Timer",
    rarity: "uncommon",
    requirement: "10 hours total watch time",
  },
  watch_time_50h: {
    type: "watch_time_50h",
    title: "Deep Diver",
    description: "Watch 50 hours of content",
    icon: "Hourglass",
    rarity: "rare",
    requirement: "50 hours total watch time",
  },
  watch_time_100h: {
    type: "watch_time_100h",
    title: "Centurion",
    description: "Watch 100 hours of content",
    icon: "Trophy",
    rarity: "legendary",
    requirement: "100 hours total watch time",
  },
  learning_path_complete: {
    type: "learning_path_complete",
    title: "Path Finder",
    description: "Complete a learning path",
    icon: "Map",
    rarity: "rare",
    requirement: "Complete all playlists in a learning path",
  },
  night_owl: {
    type: "night_owl",
    title: "Night Owl",
    description: "Study past midnight",
    icon: "Moon",
    rarity: "uncommon",
    requirement: "Watch a video between 12am-4am",
  },
  early_bird: {
    type: "early_bird",
    title: "Early Bird",
    description: "Study before dawn",
    icon: "Sun",
    rarity: "uncommon",
    requirement: "Watch a video between 5am-7am",
  },
}

export const RARITY_COLORS = {
  common: "border-gray-400 bg-gray-400/10",
  uncommon: "border-green-400 bg-green-400/10",
  rare: "border-blue-400 bg-blue-400/10",
  epic: "border-purple-400 bg-purple-400/10",
  legendary: "border-amber-400 bg-amber-400/10",
}

export const RARITY_TEXT_COLORS = {
  common: "text-gray-400",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-amber-400",
}

export async function checkAndUnlockAchievements(
  supabase: SupabaseClient,
  userId: string
): Promise<AchievementType[]> {
  const newAchievements: AchievementType[] = []

  // Get existing achievements
  const { data: existingAchievements } = await supabase
    .from("achievements")
    .select("achievement_type")
    .eq("user_id", userId)

  const unlockedTypes = new Set(existingAchievements?.map(a => a.achievement_type) || [])

  // Get user stats
  const { count: completedVideos } = await supabase
    .from("watch_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("completed", true)

  const { count: playlistCount } = await supabase
    .from("playlists")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)

  const { data: watchProgress } = await supabase
    .from("watch_progress")
    .select("progress_seconds")
    .eq("user_id", userId)

  const totalWatchTime = watchProgress?.reduce((sum, p) => sum + p.progress_seconds, 0) || 0
  const totalWatchHours = totalWatchTime / 3600

  // Check video milestones
  const videoMilestones: [number, AchievementType][] = [
    [1, "first_video"],
    [5, "video_5"],
    [10, "video_10"],
    [25, "video_25"],
    [50, "video_50"],
    [100, "video_100"],
  ]

  for (const [count, type] of videoMilestones) {
    if ((completedVideos || 0) >= count && !unlockedTypes.has(type)) {
      newAchievements.push(type)
    }
  }

  // Check playlist milestones
  const playlistMilestones: [number, AchievementType][] = [
    [1, "first_playlist"],
    [3, "playlists_3"],
    [5, "playlists_5"],
    [10, "playlists_10"],
  ]

  for (const [count, type] of playlistMilestones) {
    if ((playlistCount || 0) >= count && !unlockedTypes.has(type)) {
      newAchievements.push(type)
    }
  }

  // Check watch time milestones
  const watchTimeMilestones: [number, AchievementType][] = [
    [1, "watch_time_1h"],
    [10, "watch_time_10h"],
    [50, "watch_time_50h"],
    [100, "watch_time_100h"],
  ]

  for (const [hours, type] of watchTimeMilestones) {
    if (totalWatchHours >= hours && !unlockedTypes.has(type)) {
      newAchievements.push(type)
    }
  }

  // Check time-based achievements
  const currentHour = new Date().getHours()
  if (currentHour >= 0 && currentHour < 4 && !unlockedTypes.has("night_owl")) {
    newAchievements.push("night_owl")
  }
  if (currentHour >= 5 && currentHour < 7 && !unlockedTypes.has("early_bird")) {
    newAchievements.push("early_bird")
  }

  // Insert new achievements
  if (newAchievements.length > 0) {
    await supabase.from("achievements").insert(
      newAchievements.map(type => ({
        user_id: userId,
        achievement_type: type,
        achievement_data: {},
      }))
    )
  }

  return newAchievements
}
