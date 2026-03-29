import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Trophy, Lock, Star, Award, CheckCircle, Flame, Clock, BookOpen, Crown, Moon, Sun, Map, GraduationCap, Folder, FolderOpen, Library, Timer, Hourglass } from "lucide-react"
import { GlobalSearch, SearchButton } from "@/components/global-search"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { ACHIEVEMENTS, RARITY_COLORS, RARITY_TEXT_COLORS, type AchievementType } from "@/lib/achievements"
import { EmptyState } from "@/components/empty-state"
import { AuthenticatedLayout } from "@/components/authenticated-layout"

const iconMap: Record<string, any> = {
  Play, Star, Award, CheckCircle, Flame, Clock, BookOpen, Crown, Moon, Sun, Map,
  GraduationCap, Folder, FolderOpen, Library, Timer, Hourglass, Trophy,
  ListVideo: BookOpen,
}

export default async function AchievementsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's achievements
  const { data: userAchievements } = await supabase
    .from("achievements")
    .select("achievement_type, unlocked_at")
    .eq("user_id", user.id)
    .order("unlocked_at", { ascending: false })

  const unlockedAchievements = new Set(userAchievements?.map(a => a.achievement_type) || [])
  const achievementDates = new Map(
    userAchievements?.map(a => [a.achievement_type, a.unlocked_at]) || []
  )

  // Group achievements by rarity
  const achievementsByRarity = {
    legendary: [] as AchievementType[],
    epic: [] as AchievementType[],
    rare: [] as AchievementType[],
    uncommon: [] as AchievementType[],
    common: [] as AchievementType[],
  }

  Object.entries(ACHIEVEMENTS).forEach(([type, achievement]) => {
    achievementsByRarity[achievement.rarity].push(type as AchievementType)
  })

  const totalAchievements = Object.keys(ACHIEVEMENTS).length
  const unlockedCount = unlockedAchievements.size
  const progressPercent = (unlockedCount / totalAchievements) * 100

  return (
    <AuthenticatedLayout title="Achievements">
      <GlobalSearch />
      <KeyboardShortcuts />

      <div className="p-6 space-y-6">
        <p className="text-sm text-muted-foreground">Earn badges by learning and completing videos</p>

        {/* Progress Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{unlockedCount} / {totalAchievements}</h2>
                <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
              </div>
              <div className="text-4xl font-bold text-amber-400">{Math.round(progressPercent)}%</div>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Achievement Grid by Rarity */}
        {(["legendary", "epic", "rare", "uncommon", "common"] as const).map((rarity) => {
          const achievements = achievementsByRarity[rarity]
          if (achievements.length === 0) return null

          return (
            <div key={rarity} className="mb-8">
              <h2 className={`text-lg font-bold mb-4 capitalize ${RARITY_TEXT_COLORS[rarity]}`}>
                {rarity} ({achievements.filter(t => unlockedAchievements.has(t)).length}/{achievements.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {achievements.map((type) => {
                  const achievement = ACHIEVEMENTS[type]
                  const isUnlocked = unlockedAchievements.has(type)
                  const unlockedAt = achievementDates.get(type)
                  const Icon = iconMap[achievement.icon] || Trophy

                  return (
                    <Card
                      key={type}
                      className={`overflow-hidden transition-all ${isUnlocked
                          ? `border-2 ${RARITY_COLORS[rarity]}`
                          : "opacity-50 grayscale"
                        }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${isUnlocked ? RARITY_COLORS[rarity] : "bg-muted"}`}>
                            {isUnlocked ? (
                              <Icon className={`h-6 w-6 ${RARITY_TEXT_COLORS[rarity]}`} />
                            ) : (
                              <Lock className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm">{achievement.title}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {achievement.description}
                            </p>
                            {isUnlocked && unlockedAt && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Unlocked {new Date(unlockedAt).toLocaleDateString()}
                              </p>
                            )}
                            {!isUnlocked && (
                              <p className="text-xs text-muted-foreground mt-2 italic">
                                {achievement.requirement}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </AuthenticatedLayout>
  )
}
