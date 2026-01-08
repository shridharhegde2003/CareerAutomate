"use client";

import { useState, useCallback } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSessionTimeout } from "@/hooks/use-session-timeout";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

    // Session timeout - 15 minutes of inactivity
    const handleWarning = useCallback(() => {
        setShowTimeoutWarning(true);
        // Auto-hide warning after 30 seconds if user doesn't interact
        setTimeout(() => setShowTimeoutWarning(false), 30000);
    }, []);

    useSessionTimeout({
        enabled: true,
        onWarning: handleWarning
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Session Timeout Warning */}
            {showTimeoutWarning && (
                <div className="fixed top-4 right-4 z-[100] bg-yellow-500 text-white px-4 py-3 rounded-lg shadow-lg animate-pulse">
                    <p className="font-medium">⚠️ Session expiring soon!</p>
                    <p className="text-sm">You will be logged out in 2 minutes due to inactivity.</p>
                    <button
                        onClick={() => setShowTimeoutWarning(false)}
                        className="text-xs underline mt-1"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Mobile Header */}
            <div className="lg:hidden flex items-center p-4 border-b bg-white dark:bg-slate-900 sticky top-0 z-50">
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="mr-2">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 border-r-0">
                        <DashboardNav />
                    </SheetContent>
                </Sheet>
                <div className="flex items-center">
                    <img
                        src="https://i.postimg.cc/1RvV7gcX/CA_logo_banner_transparent.png"
                        alt="CareerAutomate"
                        className="h-8 object-contain"
                    />
                </div>
            </div>

            {/* Desktop Sidebar - Fixed */}
            <div className="hidden lg:block fixed left-0 top-0 h-full z-40">
                <DashboardNav />
            </div>

            {/* Main Content Area */}
            <div className="lg:pl-64 min-h-screen">
                {children}
            </div>
        </div>
    );
}

