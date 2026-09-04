"use client"

import * as React from "react"
import { ExploreSidebar } from "@/components/explore/ExploreSidebar"
import { cn } from "@/lib/utils"

interface ExploreLayoutWrapperProps {
    children: React.ReactNode
}

export function ExploreLayoutWrapper({ children }: ExploreLayoutWrapperProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <div className={cn(
            "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
            "h-[calc(100vh-4rem)]" // Fits perfectly below the 4rem sticky header without scrolling
        )}>
            <React.Suspense fallback={<div className="w-16 h-full bg-background hidden md:block" />}>
                <ExploreSidebar open={open} setOpen={setOpen} />
            </React.Suspense>
            <div className="flex flex-1 overflow-hidden">
                <div 
                    className="p-2 md:p-10 md:bg-white md:dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto overflow-x-hidden"
                    data-lenis-prevent="true"
                >
                    <React.Suspense fallback={null}>
                        {children}
                    </React.Suspense>
                </div>
            </div>
        </div>
    )
}
