"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar-motion";
import { useAuth } from "@/hooks/use-auth";
import {
    Activity,
    UserCog,
    ArrowLeftToLine,
    ArrowRightFromLine,
    Search,
} from "lucide-react";
import dashboardIconData from "../../../public/logos/dashboard.json";
import backendSystemsIconData from "../../../public/logos/backendSystems.json";
import formsIconData from "../../../public/logos/forms.json";
import connectorIconData from "../../../public/logos/connector.json";
import serverIconData from "../../../public/logos/Server.json";
import logoutIconData from "../../../public/logos/logout.json";
import { AnimatedSidebarIcon } from "@/components/ui/animated-sidebar-icon";
import { SearchPopup } from "./SearchPopup";

interface ExploreSidebarProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ExploreSidebar({ open, setOpen }: ExploreSidebarProps) {
    const { user, logout } = useAuth();
    const [searchOpen, setSearchOpen] = useState(false);

    // Keyboard shortcut (⌘K / Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                setSearchOpen((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const navItems = [
        {
            label: "Search (⌘K)",
            href: "#",
            icon: (
                <div className="flex items-center justify-center h-8 w-8 group-hover/sidebar:scale-110 transition-all duration-200">
                    <Search className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
                </div>
            ),
            onClick: () => setSearchOpen(true),
        },
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
                    alt={user.name || "User"}
                    className="h-5 w-5 flex-shrink-0 rounded-full object-cover group-hover/sidebar:scale-110 transition-all duration-200"
                />
            ) : (
                <UserCog className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0 group-hover/sidebar:scale-110 transition-all duration-200" />
            ),
        },
    ];

    return (
        <>
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden" data-lenis-prevent="true">
                        <div className="mt-8 flex flex-col gap-2">
                            {navItems.map((link, idx) => (
                                <div
                                    key={idx}
                                    onClick={link.onClick ? (e) => { e.preventDefault(); link.onClick(); } : undefined}
                                    className={link.onClick ? "cursor-pointer" : undefined}
                                >
                                    <SidebarLink link={link} />
                                </div>
                            ))}
                        </div>
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

            <SearchPopup open={searchOpen} setOpen={setSearchOpen} />
        </>
    );
}
