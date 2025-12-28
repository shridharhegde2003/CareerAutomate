// frontend/app/reports/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { Download, FileUp } from "lucide-react";

// TODO: Import analytics service functions when microservices are implemented
// import { getApplicationAnalytics, getSkillTrends, analyzeResumePerformance } from "@/lib/api-services";

export default function ReportsPage() {
    const [dateRange, setDateRange] = useState("Last 30 Days");

    // TODO: Fetch real analytics data from Analytics-Service (port 8003)
    // useEffect(() => {
    //   const fetchAnalytics = async () => {
    //     const analytics = await getApplicationAnalytics(userId);
    //     const resumePerf = await analyzeResumePerformance({ resumeId });
    //     const skillTrends = await getSkillTrends();
    //     // Update state with real data
    //   };
    //   fetchAnalytics();
    // }, [dateRange]);

    return (
        <DashboardLayout>
            <DashboardHeader title="Reports" subtitle="View analytics and export reports" />

            <div className="p-6">
                <div className="flex items-center justify-end mb-6 gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                    <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <FileUp className="w-4 h-4" />
                        Export PDF
                    </Button>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex items-end gap-4">
                            <Button variant="link" className="text-primary px-0">
                                Clear All Filters
                            </Button>
                            <div className="flex-1 grid grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>Type of Work</Label>
                                    <Select defaultValue="all">
                                        <SelectTrigger>
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="fulltime">Full-time</SelectItem>
                                            <SelectItem value="parttime">Part-time</SelectItem>
                                            <SelectItem value="contract">Contract</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Type of Job</Label>
                                    <Select defaultValue="all">
                                        <SelectTrigger>
                                            <SelectValue placeholder="All" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="remote">Remote</SelectItem>
                                            <SelectItem value="hybrid">Hybrid</SelectItem>
                                            <SelectItem value="onsite">On-site</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input placeholder="Enter location" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date Range</Label>
                                    <Select value={dateRange} onValueChange={setDateRange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
                                            <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
                                            <SelectItem value="Last 90 Days">Last 90 Days</SelectItem>
                                            <SelectItem value="Last Year">Last Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* Application Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Application Summary</CardTitle>
                            <p className="text-xs text-muted-foreground">Last 30 Days</p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold">120</p>
                                    <p className="text-xs text-green-600 mt-1">↑ Since Last 30 Days</p>
                                </div>
                                <div className="text-right">
                                    <div className="h-20 w-32 bg-muted rounded flex items-end justify-around p-2">
                                        <div className="w-3 bg-primary/30 rounded" style={{ height: '40%' }}></div>
                                        <div className="w-3 bg-primary/50 rounded" style={{ height: '60%' }}></div>
                                        <div className="w-3 bg-primary rounded" style={{ height: '80%' }}></div>
                                        <div className="w-3 bg-primary/60 rounded" style={{ height: '50%' }}></div>
                                        <div className="w-3 bg-primary/40 rounded" style={{ height: '70%' }}></div>
                                        <div className="w-3 bg-primary/30 rounded" style={{ height: '45%' }}></div>
                                        <div className="w-3 bg-primary/50 rounded" style={{ height: '55%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resume Performance */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Resume Performance</CardTitle>
                            <p className="text-xs text-muted-foreground">Match Ratio</p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-center">
                                <div className="relative w-32 h-32">
                                    {/* Circular progress */}
                                    <svg className="w-full h-full" viewBox="0 0 100 100">
                                        <circle
                                            className="text-muted stroke-current"
                                            strokeWidth="10"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                        ></circle>
                                        <circle
                                            className="text-primary stroke-current"
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="transparent"
                                            strokeDasharray="251.2"
                                            strokeDashoffset="50.24"
                                            transform="rotate(-90 50 50)"
                                        ></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-3xl font-bold">80%</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-green-600 text-center mt-2">↑ Since Last 30 Days</p>
                        </CardContent>
                    </Card>

                    {/* Skill Gap Analytics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Skill Gap Analytics</CardTitle>
                            <p className="text-xs text-muted-foreground">Top 5 Missing Skills</p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-3xl font-bold text-orange-500">6 Gaps</p>
                                    <p className="text-xs text-muted-foreground mt-1">↑ Since Last 30 Days</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Placeholder for future charts */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <p className="text-lg text-muted-foreground mb-2">
                                Detailed analytics and charts coming soon
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Application trends, interview success rates, and job market insights
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

