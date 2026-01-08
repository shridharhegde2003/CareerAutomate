// frontend/app/dashboard/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import {
    Briefcase,
    FileCheck,
    FolderGit2,
    FileText,
    AlertTriangle,
    TrendingUp,
    Clock,
    Target
} from "lucide-react";

import { OnboardingService } from "@/services/onboarding";

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Placeholder stats
    const [profile, setProfile] = useState<any>(null);

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
                setProfile(navProfile);

                // User is onboarded, fetch dashboard stats
                const { data: jobStatus } = await supabase.from('job_search_status').select('resume_versions').single();
                const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
                const { count: certCount } = await supabase.from('certificates').select('*', { count: 'exact', head: true });

                setStats(prev => ({
                    ...prev,
                    projects: projectCount || 0,
                    certificates: certCount || 0,
                    resumeVersions: jobStatus?.resume_versions || 0
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
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Jobs Applied</CardTitle>
                            <Briefcase className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.jobsApplied}</div>
                            <p className="text-sm text-muted-foreground mt-1">
                                <TrendingUp className="inline h-4 w-4 mr-1" />
                                +12 this week
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Interviews</CardTitle>
                            <FileCheck className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.interviews}</div>
                            <p className="text-sm text-muted-foreground mt-1">
                                <Clock className="inline h-4 w-4 mr-1" />
                                2 scheduled
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Projects</CardTitle>
                            <FolderGit2 className="h-5 w-5 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.projects}</div>
                            <p className="text-sm text-muted-foreground mt-1">
                                <Target className="inline h-4 w-4 mr-1" />
                                1 in progress
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
                                Last filtered 2d ago
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Skill Gap Analysis - Only if GitHub connected */}
                    {profile?.github_username ? (
                        <Card className="lg:col-span-2 border-0 shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Skill Gap Analysis</CardTitle>
                                        <CardDescription>Based on your GitHub projects and target roles</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-3">
                                        <Target className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <p className="font-medium">No critical skill gaps detected</p>
                                    <p className="text-sm mt-1 max-w-sm">
                                        Great work! Your projects align well with your target roles. Continue building to maintain your edge.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="lg:col-span-2 border-0 shadow-sm bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center min-h-[250px]">
                            <CardContent className="text-center pt-6">
                                <FolderGit2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="font-semibold text-lg max-w-xs mx-auto text-slate-900 dark:text-slate-100">Connect GitHub to unlock Skill Gap Analysis</h3>
                                <p className="text-sm text-muted-foreground mt-2 mb-4 max-w-xs mx-auto">
                                    We analyze your projects to identify missing skills for your dream job.
                                </p>
                                <Button variant="outline" onClick={() => router.push('/settings')}>Connect GitHub</Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Items */}
                    <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                        <CardHeader>
                            <CardTitle>Action Items</CardTitle>
                            <CardDescription>Recommended next steps</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <p className="text-sm">You're all caught up!</p>
                                    <p className="text-xs mt-1">Check back later for new recommendations.</p>
                                </div>
                            </div>
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
