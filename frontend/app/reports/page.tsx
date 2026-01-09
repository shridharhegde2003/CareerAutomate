// frontend/app/reports/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { supabase } from "@/lib/supabase";
import { FileText, Mail, Calendar } from "lucide-react";

export default function ReportsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setLoading(false);
        };
        checkAuth();
    }, [router]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full pt-48">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-lg font-medium">Loading reports...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <DashboardHeader title="Reports" subtitle="View your job recommendation reports" />

            <div className="p-6">
                {/* Empty state - Reports will be populated from Reports-Notifications service */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" />
                            Job Recommendation Reports
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                                No reports yet
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                Job recommendation reports will appear here once the system starts analyzing
                                suitable opportunities for your profile. Reports are sent via email and
                                stored here for your reference.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
