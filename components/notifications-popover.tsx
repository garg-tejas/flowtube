"use client"

import { useState, useEffect } from "react"
import { Bell, X, CheckCircle2, AlertCircle, Info, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface Notification {
    id: string
    type: "success" | "error" | "info"
    title: string
    message: string
    timestamp: Date
    read: boolean
}

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: "1",
            type: "success",
            title: "Video Completed",
            message: "You've completed 'React Fundamentals'",
            timestamp: new Date(Date.now() - 5 * 60000),
            read: false,
        },
        {
            id: "2",
            type: "info",
            title: "Learning Goal Reached",
            message: "You've watched 2 hours this week",
            timestamp: new Date(Date.now() - 30 * 60000),
            read: false,
        },
    ])
    const [open, setOpen] = useState(false)

    const unreadCount = notifications.filter((n) => !n.read).length

    const handleMarkAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
    }

    const handleMarkAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }

    const handleDeleteNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id))
    }

    const handleClearAll = () => {
        setNotifications([])
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "success":
                return <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            case "error":
                return <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            case "info":
                return <Zap className="h-5 w-5 text-primary flex-shrink-0" />
            default:
                return <Bell className="h-5 w-5 flex-shrink-0" />
        }
    }

    const formatTime = (date: Date) => {
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "Just now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-accent/10 transition-all"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <>
                            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-primary opacity-25 animate-ping" />
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
                <style>{`
                    @keyframes slideIn {
                        from { opacity: 0; transform: translateY(-4px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .notification-enter {
                        animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    .notification-item {
                        animation: fadeIn 0.2s ease-out;
                    }
                `}</style>
                <div className="flex flex-col max-h-96 bg-background">
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-border/50 bg-background">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-primary/10">
                                <Bell className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="font-semibold text-base">Updates</h3>
                            {unreadCount > 0 && (
                                <span className="ml-auto text-xs font-medium bg-primary/20 text-primary px-2 py-1 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded hover:bg-primary/5"
                            >
                                Mark all
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    {notifications.length > 0 ? (
                        <ScrollArea className="flex-1">
                            <div className="px-2 py-2">
                                {notifications.map((notification, index) => (
                                    <div
                                        key={notification.id}
                                        className="notification-item"
                                        style={{
                                            animationDelay: `${index * 50}ms`,
                                        }}
                                    >
                                        <div
                                            className={cn(
                                                "px-3 py-3 mb-1.5 rounded-lg border transition-all duration-200 hover:shadow-sm group cursor-pointer",
                                                notification.read
                                                    ? "border-border/30 bg-transparent hover:bg-muted/30"
                                                    : "border-primary/20 bg-gradient-to-r from-primary/8 to-primary/5 hover:from-primary/12 hover:to-primary/8 hover:border-primary/30"
                                            )}
                                            onClick={() => handleMarkAsRead(notification.id)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 p-2 rounded-lg bg-background/50">
                                                    {getIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline gap-2">
                                                        <p className="text-sm font-semibold text-foreground leading-snug">
                                                            {notification.title}
                                                        </p>
                                                        {!notification.read && (
                                                            <div className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground/50 mt-2 font-medium">
                                                        {formatTime(notification.timestamp)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeleteNotification(notification.id)
                                                    }}
                                                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                                                >
                                                    <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                            <div className="text-center">
                                <div className="mx-auto mb-3 p-3 rounded-full bg-muted/50">
                                    <Bell className="h-6 w-6 opacity-40" />
                                </div>
                                <p className="text-sm font-medium">No updates yet</p>
                                <p className="text-xs text-muted-foreground/60 mt-1">
                                    Check back later for activity
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t border-border/50 p-3 bg-background">
                            <button
                                onClick={handleClearAll}
                                className="w-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-2 px-3 rounded-lg hover:bg-muted/50"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
