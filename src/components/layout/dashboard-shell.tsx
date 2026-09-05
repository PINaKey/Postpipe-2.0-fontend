"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar-motion";
import { useAuth } from "@/hooks/use-auth";
import {
    LayoutGrid,
    FileText,
    LogOut,
    Settings,
    User,
    Server,
    Key,
    Terminal,
    Activity,
    UserCog,
    Database,
    ArrowLeftToLine,
    ArrowRightFromLine,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import dashboardIconData from "../../../public/logos/dashboard.json";
import backendSystemsIconData from "../../../public/logos/backendSystems.json";
import formsIconData from "../../../public/logos/forms.json";
import connectorIconData from "../../../public/logos/connector.json";
import serverIconData from "../../../public/logos/Server.json";
import logoutIconData from "../../../public/logos/logout.json";
import { AnimatedSidebarIcon } from "@/components/ui/animated-sidebar-icon";

export default function DashboardShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isAuthenticated, loading } = useAuth();

    const scrollRef = React.useRef<HTMLDivElement>(null);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);

    const checkScroll = React.useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const hasOverflow = el.scrollHeight > el.clientHeight + 4;
        setCanScrollUp(hasOverflow && el.scrollTop > 6);
        setCanScrollDown(hasOverflow && el.scrollTop + el.clientHeight < el.scrollHeight - 6);
    }, []);

    useEffect(() => {
        const timer = setTimeout(checkScroll, 100);
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", checkScroll, { passive: true });
        window.addEventListener("resize", checkScroll);
        return () => {
            clearTimeout(timer);
            el.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [checkScroll, open]);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [loading, isAuthenticated, router]);

    if (loading) {
        return null; // Or a loading spinner
    }

    const navItems = [
        {
            label: "Overview",
            href: "/dashboard",
            icon: <AnimatedSidebarIcon animationData={dashboardIconData} className="h-8 w-8 group-hover/sidebar:scale-110 transition-all duration-200" />
        },
        {
            label: "Backend Systems",
            href: "/dashboard/systems",
            icon: (
                <div className="flex flex-col -space-y-[11px] justify-center items-center h-8 w-8 group-hover/sidebar:scale-110 transition-all duration-200">
                    <AnimatedSidebarIcon animationData={backendSystemsIconData} className="h-[22px] w-[22px]" />
                    <AnimatedSidebarIcon animationData={backendSystemsIconData} className="h-[22px] w-[22px]" />
                </div>
            )
        },
        {
            label: "Forms",
            href: "/dashboard/forms",
            icon: <AnimatedSidebarIcon animationData={formsIconData} className="h-8 w-8 group-hover/sidebar:scale-110 transition-all duration-200" />
        },
        {
            label: "Connectors",
            href: "/dashboard/connectors",
            icon: <AnimatedSidebarIcon animationData={connectorIconData} className="h-8 w-8 group-hover/sidebar:scale-110 transition-all duration-200" />
        },
        {
            label: "Databases",
            href: "/dashboard/database",
            icon: <AnimatedSidebarIcon animationData={serverIconData} className="h-8 w-8 group-hover/sidebar:scale-110 transition-all duration-200" />
        },

    ];

    const bottomLinks = [
        {
            label: "Profile",
            href: "/dashboard/profile",
            icon: user?.image ? (
                <img
                    src={user.image}
                    alt={user.name}
                    className="h-5 w-5 flex-shrink-0 rounded-full object-cover group-hover/sidebar:scale-110 transition-all duration-200"
                />
            ) : (
                <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0 group-hover/sidebar:scale-110 transition-all duration-200" />
            ),
        },
    ];

    return (
        <div className={cn(
            "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
            "h-[calc(100vh-4rem)]" // Fits perfectly below the 4rem sticky header without scrolling
        )}>
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-4 md:gap-6">
                    {/* Top 5 Nav Items Container with Scroll Overflow Detection */}
                    <div className="relative flex flex-col flex-1 min-h-0 overflow-hidden my-1">
                        {/* Scroll Up Hint / Fade */}
                        {canScrollUp && (
                            <div 
                                onClick={() => scrollRef.current?.scrollBy({ top: -60, behavior: 'smooth' })}
                                className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-neutral-100 via-neutral-100/90 to-transparent dark:from-neutral-800 dark:via-neutral-800/90 flex items-center justify-center cursor-pointer z-20 group/scroll-up transition-opacity duration-200"
                                title="Scroll up"
                            >
                                <ChevronUp className="h-3.5 w-3.5 text-primary animate-bounce opacity-80 group-hover/scroll-up:opacity-100" />
                            </div>
                        )}

                        {/* Scrollable Nav Items */}
                        <div 
                            ref={scrollRef}
                            className={cn(
                                "flex flex-col h-full overflow-y-auto overflow-x-hidden pt-1 pb-1",
                                "[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary transition-all"
                            )}
                            data-lenis-prevent="true"
                        >
                            <div className="flex flex-col gap-1.5">
                                {navItems.map((link, idx) => (
                                    <SidebarLink key={idx} link={link} />
                                ))}
                            </div>
                        </div>

                        {/* Scroll Down Hint / Fade */}
                        {canScrollDown && (
                            <div 
                                onClick={() => scrollRef.current?.scrollBy({ top: 60, behavior: 'smooth' })}
                                className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-neutral-100 via-neutral-100/90 to-transparent dark:from-neutral-800 dark:via-neutral-800/90 flex items-center justify-center cursor-pointer z-20 group/scroll-down transition-opacity duration-200"
                                title="Scroll down"
                            >
                                <ChevronDown className="h-3.5 w-3.5 text-primary animate-bounce opacity-80 group-hover/scroll-down:opacity-100" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <SidebarLink 
                            link={{
                                label: "Usage",
                                href: "/dashboard/usage",
                                icon: (
                                    <>
                                        <style>{`
                                            @keyframes wipe-right {
                                                0% { clip-path: inset(0 100% 0 0); }
                                                100% { clip-path: inset(0 0 0 0); }
                                            }
                                            .group\\/sidebar:hover .icon-wipe {
                                                animation: wipe-right 0.5s ease-out forwards;
                                            }
                                        `}</style>
                                        <Activity className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0 icon-wipe transition-all duration-200 ml-1.5" />
                                    </>
                                )
                            }} 
                        />
                        {bottomLinks.map((link, idx) => (
                            <SidebarLink key={idx} link={link} />
                        ))}

                        {/* Logout Link */}
                        <div onClick={logout} className="cursor-pointer">
                            <SidebarLink
                                link={{
                                    label: "Logout",
                                    href: "#",
                                    icon: <AnimatedSidebarIcon animationData={logoutIconData} className="h-8 w-8 group-hover/sidebar:scale-110 transition-all duration-200" />
                                }}
                            />
                        </div>

                        {/* Collapse Toggle */}
                        <div onClick={() => setOpen(!open)} className="cursor-pointer mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                            <SidebarLink
                                link={{
                                    label: open ? "Collapse Sidebar" : "Expand Sidebar",
                                    href: "#",
                                    icon: open ? (
                                        <ArrowLeftToLine className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0 group-hover/sidebar:scale-110 transition-all duration-200" />
                                    ) : (
                                        <ArrowRightFromLine className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0 group-hover/sidebar:scale-110 transition-all duration-200" />
                                    )
                                }}
                            />
                        </div>
                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                <div 
                    className="p-2 md:p-10 md:bg-white md:dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto overflow-x-hidden"
                    data-lenis-prevent="true"
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
