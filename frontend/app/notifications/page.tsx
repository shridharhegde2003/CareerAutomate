// frontend/app/notifications/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardHeader } from "@/components/dashboard-header";
import { supabase } from "@/lib/supabase";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
}

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <div className="flex h-screen bg-background">
            <DashboardNav />

            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader />

                <div className="flex-1 overflow-auto">
                    <div className="p-8">
                        <h1 className="text-3xl font-bold mb-8">Notifications</h1>

                        <div className="space-y-4">
                            {loading ? (
                                <div>Loading...</div>
                            ) : notifications.length === 0 ? (
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-center text-muted-foreground">
                                            No notifications yet
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                notifications.map((notification) => (
                                    <Card
                                        key={notification.id}
                                        className={notification.is_read ? 'opacity-60' : ''}
                                        onClick={() => !notification.is_read && markAsRead(notification.id)}
                                    >
                                        <CardContent className="pt-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold">{notification.title}</h3>
                                                        {!notification.is_read && (
                                                            <Badge variant="default">New</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        {new Date(notification.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
