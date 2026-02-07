// frontend/app/blocked/page.tsx
"use client";

import { useState, useEffect } from "react";
import { ShieldX, Mail, AlertCircle, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function BlockedPage() {
    const router = useRouter();
    const [userEmail, setUserEmail] = useState<string>("");
    const [blockedReason, setBlockedReason] = useState<string>("");

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Not logged in, redirect to login
                router.push('/login');
                return;
            }

            setUserEmail(user.email || "");

            // Check if user is actually blocked
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_blocked, blocked_reason')
                .eq('id', user.id)
                .single();

            if (profile && !profile.is_blocked) {
                // User is not blocked, redirect to dashboard
                router.push('/dashboard');
                return;
            }

            if (profile?.blocked_reason) {
                setBlockedReason(profile.blocked_reason);
            }
        } catch (error) {
            console.error('Error checking user status:', error);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-red-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                            <ShieldX className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Account Blocked</h1>
                        <p className="text-red-100 mt-2">Your access has been restricted</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Alert Box */}
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-red-800">Access Denied</h3>
                                    <p className="text-sm text-red-700 mt-1">
                                        Your account has been blocked by an administrator. You cannot access any features until this is resolved.
                                    </p>
                                    {blockedReason && (
                                        <p className="text-sm text-red-600 mt-2 font-medium">
                                            Reason: {blockedReason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-slate-50 rounded-xl p-4">
                            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Contact Support
                            </h3>
                            <p className="text-sm text-slate-600 mb-3">
                                If you believe this is an error or would like to appeal, please contact our support team:
                            </p>
                            <a
                                href="mailto:info.careerautomate@gmail.com"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                <Mail className="w-4 h-4" />
                                info.careerautomate@gmail.com
                            </a>
                            <p className="text-xs text-slate-500 mt-3">
                                Please include your registered email ({userEmail}) in your message.
                            </p>
                        </div>

                        {/* Sign Out Button */}
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    © {new Date().getFullYear()} Career Automate. All rights reserved.
                </p>
            </div>
        </div>
    );
}
