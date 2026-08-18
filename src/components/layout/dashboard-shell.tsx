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
            "h-screen pt-16" // Start below global header
        )}>
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        {/* Logo Removed as requested */}
                        <div className="mt-8 flex flex-col gap-2">
                            {navItems.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div>
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
                <div className="p-2 pt-20 md:p-10 md:pt-10 md:bg-white md:dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto overflow-x-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
}
