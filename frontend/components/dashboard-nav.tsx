// Shared navigation sidebar component
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderKanban, FileText, BarChart3, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Documents", href: "/documents", icon: FileText },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function DashboardNav() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-background">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 border-b px-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="font-bold text-xl">CareerAutoMate</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Settings at bottom */}
            <div className="border-t p-4">
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        pathname === "/settings"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    <Settings className="h-5 w-5" />
                    Settings
                </Link>
            </div>
        </div>
    );
}
