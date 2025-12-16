// frontend/app/dashboard/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardNav } from "@/components/dashboard-nav";
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

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Placeholder stats
    const stats = {
        jobsApplied: 47,
        interviews: 8,
        certificates: 12,
        projects: 6,
        resumeVersions: 3,
    };

    const skillGaps = [
        { skill: "Kubernetes", importance: "high", progress: 30 },
        { skill: "System Design", importance: "medium", progress: 45 },
        { skill: "GraphQL", importance: "low", progress: 60 },
    ];

    useEffect(() => {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');

        if (accessToken) {
            sessionStorage.setItem('access_token', accessToken);
            if (refreshToken) sessionStorage.setItem('refresh_token', refreshToken);

            supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || '',
            });

            router.replace('/dashboard');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <DashboardNav />

            <div className="ml-64">
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
                        {/* Skill Gap Analysis */}
                        <Card className="lg:col-span-2 border-0 shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Skill Gap Analysis</CardTitle>
                                        <CardDescription>Based on your target job roles</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm">View Detailed Report</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {skillGaps.map((gap, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{gap.skill}</span>
                                                    {gap.importance === 'high' && (
                                                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">Critical</span>
                                                    )}
                                                </div>
                                                <span className="text-muted-foreground">{gap.progress}% Mastered</span>
                                            </div>
                                            <Progress value={gap.progress} className="h-2" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Items */}
                        <Card className="border-0 shadow-sm bg-white dark:bg-slate-900">
                            <CardHeader>
                                <CardTitle>Action Items</CardTitle>
                                <CardDescription>Recommended next steps</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50">
                                        <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-orange-900 dark:text-orange-200">Resume Keyword Check</p>
                                            <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">Your 'React' keyword density is low for 3 target jobs.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50">
                                        <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Mock Interview</p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Scheduled for tomorrow at 2:00 PM</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
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
    );
}
