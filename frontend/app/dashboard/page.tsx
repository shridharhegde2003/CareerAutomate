// frontend/app/dashboard/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { FolderGit2, FileText } from "lucide-react";

import { OnboardingService } from "@/services/onboarding";

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();



    // Placeholder stats
    const [stats, setStats] = useState({
        jobsApplied: 0,
        interviews: 0,
        certificates: 0,
        projects: 0,
        resumeVersions: 0,
    });



    useEffect(() => {
        const checkAuthAndData = async () => {
            const accessToken = searchParams.get('access_token');
            const refreshToken = searchParams.get('refresh_token');

            // 1. Handle OAuth Callback / Token in URL
            if (accessToken) {
                sessionStorage.setItem('access_token', accessToken);
                if (refreshToken) sessionStorage.setItem('refresh_token', refreshToken);

                const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken || '',
                });

                if (error) {
                    console.error("Error setting session from params:", error);
                    router.push('/login');
                    return;
                }

                // Clean URL
                router.replace('/dashboard');
            }

            // 2. Check Authentication State
            const { data: { user } } = await supabase.auth.getUser();

            // If strictly no user AND no access token was just processed
            if (!user && !accessToken) {
                router.push('/login');
                return;
            }

            // Check Onboarding Status & Fetch Data
            try {
                const navProfile = await OnboardingService.getProfile();
                if (!navProfile) {
                    // Not onboarded
                    router.replace('/onboarding');
                    return;
                }

                // User is onboarded, fetch dashboard stats
                const { data: { user } } = await supabase.auth.getUser();

                // Fetch project count
                const { count: projectCount } = await supabase
                    .from('projects')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user?.id);

                // Fetch resume count from documents table (document_type is 'Resume' with capital R)
                const { count: resumeCount } = await supabase
                    .from('documents')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user?.id)
                    .eq('document_type', 'Resume');

                setStats(prev => ({
                    ...prev,
                    projects: projectCount || 0,
                    resumeVersions: resumeCount || 0
                }));

            } catch (err) {
                console.error("Error checking onboarding or data:", err);
            }
        };

        checkAuthAndData();
    }, [searchParams, router]);

    return (
        <>
            <DashboardHeader
                title="Dashboard"
                subtitle="Welcome back! Here's your job search overview."
            />

            <main className="p-6 space-y-6">
                {/* Stats Grid - Only Projects and Resumes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Projects</CardTitle>
                            <FolderGit2 className="h-5 w-5 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.projects}</div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Synced from GitHub
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Resumes</CardTitle>
                            <FileText className="h-5 w-5 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.resumeVersions}</div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Generated versions
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </>
    );
}

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <Suspense fallback={
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-lg font-medium">Loading dashboard...</span>
                    </div>
                </div>
            }>
                <DashboardContent />
            </Suspense>
        </DashboardLayout>
    );
}
