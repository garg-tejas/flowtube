"use client"

import { useState } from "react"
import { User, LogOut, Settings, User2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import useSWR from "swr"

interface UserProfile {
    id: string
    email: string | undefined
    user_metadata?: {
        name?: string
        picture?: string
    }
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function UserProfilePopover() {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const supabase = createClient()
    const { data: profile } = useSWR<UserProfile>(
        open ? "/api/user/profile" : null,
        fetcher
    )

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/auth/login")
    }

    const getUserInitials = () => {
        if (!profile?.email) return "U"
        const name = profile.user_metadata?.name || profile.email
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-accent/10 transition-all rounded-full"
                >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">
                            {getUserInitials()}
                        </span>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-background">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                                <span className="text-sm font-semibold text-white">
                                    {getUserInitials()}
                                </span>
                            </div>
                            <div className="min-w-0">
                                {profile?.user_metadata?.name && (
                                    <p className="text-sm font-semibold truncate">
                                        {profile.user_metadata.name}
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground truncate">
                                    {profile?.email}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-lg leading-none"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2 px-2 space-y-1">
                        <button
                            onClick={() => router.push("/profile")}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                        >
                            <User2 className="h-4 w-4 text-muted-foreground" />
                            <span>Account Settings</span>
                        </button>

                        <button
                            onClick={() => setOpen(false)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
                        >
                            <Settings className="h-4 w-4 text-muted-foreground" />
                            <span>Preferences</span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border/50" />

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    )
}
