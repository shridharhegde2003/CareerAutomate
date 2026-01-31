// frontend/components/dashboard-header.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { OnboardingService } from "@/services/onboarding";

interface DashboardHeaderProps {
    title: string;
    subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
    const router = useRouter();
    const [user, setUser] = useState<{ email: string; name: string; photoUrl?: string } | null>(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                // Get basic auth info for email
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (!authUser) return;

                // specific loading logic
                setUser({
                    email: authUser.email || "",
                    name: "Loading...",
                });

                // Fetch detailed profile
                const profile = await OnboardingService.getProfile();

                setUser({
                    email: authUser.email || "user@example.com",
                    name: profile?.full_name || authUser.user_metadata?.full_name || "User",
                    photoUrl: profile?.profile_photo_url
                });
            } catch (error) {
                console.error("Failed to load profile:", error);
                // Fallback to local user data if service fails
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser) {
                    setUser({
                        email: authUser.email || "user@example.com",
                        name: authUser.user_metadata?.full_name || "User",
                    });
                }
            }
        };
        loadProfile();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        sessionStorage.removeItem("access_token");
        router.push("/login");
    };

    return (
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6">
            <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                )}
            </div>

            <div className="flex items-center gap-4">

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10 ring-2 ring-blue-600/20">
                                <AvatarImage src={user?.photoUrl || ""} alt="User" />
                                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold">
                                    {user ? user.name.charAt(0).toUpperCase() : "U"}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">{user?.name || "Loading..."}</p>
                                <p className="text-xs text-muted-foreground">{user?.email || "..."}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push("/settings")}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
