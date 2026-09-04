"use client"

import * as React from "react"
import { ExploreSidebar } from "@/components/explore/ExploreSidebar"
import { ExploreHeader } from "@/components/explore/ExploreHeader"
import { cn } from "@/lib/utils"

interface ExploreLayoutWrapperProps {
    children: React.ReactNode
}

export function ExploreLayoutWrapper({ children }: ExploreLayoutWrapperProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <div className={cn(
            "flex flex-col md:flex-row bg-background w-full min-h-screen border-r border-neutral-200 dark:border-neutral-800"
        )}>
            <div className="md:sticky md:top-0 md:h-screen md:self-start z-30 shrink-0">
                <React.Suspense fallback={<div className="w-16 h-full bg-background hidden md:block" />}>
                    <ExploreSidebar open={open} setOpen={setOpen} />
                </React.Suspense>
            </div>
            <div className="flex flex-1 flex-col min-w-0">
                <ExploreHeader />
                <main className="flex-1 w-full">
                    <React.Suspense fallback={null}>
                        {children}
                    </React.Suspense>
                </main>
            </div>
        </div>
    )
}
