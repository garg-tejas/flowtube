"use client"

import { ReactNode } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"

interface AuthenticatedLayoutProps {
    children: ReactNode
    title?: string
}

export function AuthenticatedLayout({ children, title }: AuthenticatedLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <AppSidebar />
            <div className="md:ml-64 transition-all duration-300 ease-out">
                <AppHeader title={title} />
                <main className="relative bg-gradient-to-b from-background to-background/50">
                    {children}
                </main>
            </div>
        </div>
    )
}
