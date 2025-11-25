// Shared header component with profile avatar and logout
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function DashboardHeader() {
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchUserProfile();
        fetchUnreadNotifications();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, profile_photo_url')
                .eq('id', user.id)
                .single();

            setUserProfile({
                name: profile?.full_name || user.email?.split('@')[0] || 'User',
                email: user.email,
                photo: profile?.profile_photo_url,
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchUnreadNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { count } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            setUnreadCount(count || 0);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            router.push('/');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="flex items-center justify-end gap-4 px-8 py-4 border-b">
            {/* Notifications Bell */}
            <button
                onClick={() => router.push('/notifications')}
                className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Profile Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none">
                        <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-offset-2 ring-primary/20 hover:ring-primary/40 transition-all">
                            <AvatarImage src={userProfile?.photo} alt={userProfile?.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                {userProfile?.name ? getInitials(userProfile.name) : 'U'}
                            </AvatarFallback>
                        </Avatar>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium">{userProfile?.name || 'User'}</p>
                            <p className="text-xs text-muted-foreground">{userProfile?.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                        Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                        Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
