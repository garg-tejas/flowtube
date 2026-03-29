"use client"

import { useRef, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlobalSearch } from "@/components/global-search"
import { NotificationsPopover } from "@/components/notifications-popover"
import { UserProfilePopover } from "@/components/user-profile-popover"

interface AppHeaderProps {
    title?: string
}

export function AppHeader({ title }: AppHeaderProps) {
    const [showSearch, setShowSearch] = useState(false)
    const searchRef = useRef<HTMLDivElement>(null)

    return (
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="px-6 h-16 flex items-center justify-between gap-6">
                {/* Left - Title */}
                <div className="flex-1 min-w-0">
                    {title && (
                        <h1 className="text-2xl font-bold truncate bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            {title}
                        </h1>
                    )}
                </div>

                {/* Center - Search (hidden on mobile) */}
                <div className="hidden md:block flex-1 max-w-md">
                    <div
                        className="relative group"
                        ref={searchRef}
                        onClick={() => setShowSearch(!showSearch)}
                    >
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search videos, playlists..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/80 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Right - Actions */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden hover:bg-accent/10"
                        onClick={() => setShowSearch(!showSearch)}
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                    <NotificationsPopover />
                    <UserProfilePopover />
                </div>
            </div>
        </header>
    )
}
