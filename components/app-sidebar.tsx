"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Play, Home, BookOpen, Trophy, Settings, Plus, LogOut, Menu, X, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

const navigationItems = [
    { label: "Home", href: "/feed", icon: Home },
    { label: "Continue Watching", href: "/history", icon: BookOpen },
    { label: "Playlists", href: "/playlists", icon: Play },
    { label: "Learning Paths", href: "/learn", icon: Trophy },
    { label: "Stats", href: "/stats", icon: Trophy },
]

export function AppSidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(true)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
    }

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

    return (
        <>
            {/* Mobile menu button */}
            <div className="fixed top-0 left-0 z-50 md:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="m-4"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed left-0 top-0 h-screen bg-background/95 backdrop-blur-sm border-r border-border transition-all duration-300 z-40",
                    isOpen ? "w-64" : "-translate-x-full md:translate-x-0 md:w-64",
                    isCollapsed && "md:w-20"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    {/* Logo & Collapse */}
                    <div className="p-4 border-b border-border flex items-center justify-between gap-2">
                        <Link href="/feed" className="flex items-center gap-3 group flex-1 min-w-0">
                            <div className="h-10 w-10 rounded-lg bg-foreground flex items-center justify-center transition-transform group-hover:scale-105 flex-shrink-0">
                                <Play className="h-5 w-5 text-background" fill="currentColor" />
                            </div>
                            {!isCollapsed && (
                                <span className="font-bold text-lg truncate">FlowTube</span>
                            )}
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden md:flex flex-shrink-0 hover:bg-accent"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <ChevronLeft
                                className={cn(
                                    "h-5 w-5 transition-transform",
                                    isCollapsed && "rotate-180"
                                )}
                            />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
                        <div className={cn("px-3 py-1.5 mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60", isCollapsed && "hidden")}>
                            Browse
                        </div>
                        {navigationItems.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href)
                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start gap-3 transition-all duration-200 relative group",
                                            active
                                                ? "bg-gradient-to-r from-primary/20 to-primary/5 text-primary font-medium"
                                                : "hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {active && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-lg bg-primary" />
                                        )}
                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                        {!isCollapsed && <span>{item.label}</span>}
                                    </Button>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Add Playlist Button */}
                    <div className="px-3 py-4 border-t border-border/50 space-y-3">
                        <div className={cn("px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60", isCollapsed && "hidden")}>
                            Actions
                        </div>
                        <Link href="/playlists" className="block w-full">
                            <Button className="w-full justify-start gap-2 gradient-button text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                                <Plus className="h-5 w-5" />
                                {!isCollapsed && "Add Playlist"}
                            </Button>
                        </Link>
                    </div>

                    {/* User Footer */}
                    <div className="p-3 border-t border-border/50 space-y-1">
                        <Link href="/stats" className="block">
                            <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-muted/40 transition-colors">
                                <Settings className="h-5 w-5 flex-shrink-0" />
                                {!isCollapsed && <span className="text-sm">Settings</span>}
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-destructive/80 hover:text-destructive hover:bg-destructive/5 transition-all"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && <span className="text-sm">Logout</span>}
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Main content shift */}
            <div className={cn("md:ml-64 transition-all duration-300", isCollapsed && "md:ml-20")} />
        </>
    )
}
