"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Play, ListVideo, TrendingUp, ArrowRight, ChevronRight, Layers, Clock, FileText } from "lucide-react"

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        setIsAuthenticated(!!user)
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [supabase.auth])

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-foreground flex items-center justify-center">
            <Play className="h-5 w-5 text-background" fill="currentColor" />
          </div>
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <div className="fixed inset-0 glow-top pointer-events-none" />

      {/* Floating orbs */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[100px] animate-float pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px] animate-float delay-300 pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center transition-transform group-hover:scale-105">
              <Play className="h-4 w-4 text-background" fill="currentColor" />
            </div>
            <span className="text-lg font-semibold tracking-tight">FlowTube</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/feed">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    My Feed
                  </Button>
                </Link>
                <Link href="/feed">
                  <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                    Go to Dashboard
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90">
                    Get started
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center space-y-8">
            {/* Announcement badge */}
            <div className="opacity-0 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-secondary/50 text-sm text-muted-foreground">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                Now tracking your learning progress
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-bold tracking-tight leading-[1.1] opacity-0 animate-fade-in-up delay-100">
              <span className="text-gradient">The YouTube Player</span>
              <br />
              <span className="text-foreground">for Serious Learners</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in-up delay-200">
              Track your progress through YouTube playlists, take markdown notes, and pick up exactly where you left
              off. Built for focused learning.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 opacity-0 animate-fade-in-up delay-300">
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 text-base font-medium"
                >
                  Start learning free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base font-medium border-border/50 hover:bg-secondary/50 bg-transparent"
                >
                  See how it works
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="pt-12 opacity-0 animate-fade-in delay-500">
              <p className="text-sm text-muted-foreground mb-4">Trusted by learners worldwide</p>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">100%</div>
                  <div className="text-xs text-muted-foreground">Free forever</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">∞</div>
                  <div className="text-xs text-muted-foreground">Playlists</div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">Auto</div>
                  <div className="text-xs text-muted-foreground">Progress sync</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything you need to learn effectively
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Powerful features designed for focused, uninterrupted learning sessions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Layers,
                title: "Playlist Management",
                description:
                  "Import any YouTube playlist and organize them by category. Your learning library, organized.",
              },
              {
                icon: Clock,
                title: "Progress Tracking",
                description: "Automatic progress saving. Pick up exactly where you left off, down to the second.",
              },
              {
                icon: FileText,
                title: "Markdown Notes",
                description: "Take rich notes with full markdown support. Export anytime, keep your insights forever.",
              },
              {
                icon: Play,
                title: "Seamless Playback",
                description: "Clean, distraction-free video player. Auto-advance to the next video when ready.",
              },
              {
                icon: TrendingUp,
                title: "Visual Progress",
                description: "See your progress at a glance with visual indicators on every playlist and video.",
              },
              {
                icon: ListVideo,
                title: "Smart Feed",
                description: "Your home feed shows exactly what to watch next from each playlist. No decision fatigue.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-xl border border-border/50 bg-card/50 card-hover shine opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${400 + i * 75}ms`, animationFillMode: "forwards" }}
              >
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-4 transition-colors group-hover:bg-secondary/80">
                  <feature.icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 relative border-t border-border/50">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Start learning in minutes</h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to transform your YouTube learning experience.
            </p>
          </div>

          <div className="space-y-12">
            {[
              {
                step: "01",
                title: "Add your playlists",
                description: "Paste any YouTube playlist URL. We'll import all videos and metadata automatically.",
              },
              {
                step: "02",
                title: "Start watching",
                description: "Watch videos in our clean, focused player. Your progress saves automatically.",
              },
              {
                step: "03",
                title: "Track and grow",
                description: "Take notes, track completion, and watch your progress across all your playlists.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start group">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary border border-border/50 flex items-center justify-center text-sm font-mono font-medium text-muted-foreground group-hover:border-foreground/20 group-hover:text-foreground transition-all">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center p-12 rounded-2xl border border-border/50 bg-card/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.02]" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Ready to learn smarter?</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                Join FlowTube and take control of your YouTube learning journey. Completely free.
              </p>
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-foreground text-background hover:bg-foreground/90 text-base font-medium"
                >
                  Get started for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-foreground flex items-center justify-center">
                <Play className="h-3 w-3 text-background" fill="currentColor" />
              </div>
              <span className="text-sm font-medium">FlowTube</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 FlowTube. Curate your own wave of content.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
