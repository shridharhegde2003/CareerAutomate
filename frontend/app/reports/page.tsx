// frontend/app/reports/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { supabase } from "@/lib/supabase";
import { FileText, Mail, Calendar, Download, Eye, X, ExternalLink, Loader2, RefreshCw } from "lucide-react";

interface JobMatchReport {
    id: string;
    name: string;
    created_at: string;
    url: string;
}

export default function ReportsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState<JobMatchReport[]>([]);
    const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
    const [viewingReport, setViewingReport] = useState<JobMatchReport | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchReports();
    }, [router]);

    const fetchReports = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Fetch job match PDFs from storage
            // They are stored in certificates-documents bucket under {user_id}/job_matches/
            const { data: files, error } = await supabase.storage
                .from('certificates-documents')
                .list(`${user.id}/job_matches`, {
                    sortBy: { column: 'created_at', order: 'desc' }
                });

            if (error) {
                console.error('Error fetching reports:', error);
                setLoading(false);
                return;
            }

            if (files && files.length > 0) {
                const reportList: JobMatchReport[] = files
                    .filter(file => file.name.endsWith('.pdf'))
                    .map(file => {
                        const { data: urlData } = supabase.storage
                            .from('certificates-documents')
                            .getPublicUrl(`${user.id}/job_matches/${file.name}`);

                        return {
                            id: file.id || file.name,
                            name: file.name,
                            created_at: file.created_at || new Date().toISOString(),
                            url: urlData.publicUrl
                        };
                    });

                setReports(reportList);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchReports();
        setRefreshing(false);
    };

    const handleView = (report: JobMatchReport) => {
        setViewingReport(report);
        setPdfViewerOpen(true);
    };

    const handleDownload = (url: string) => {
        window.open(url, '_blank');
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    const formatReportName = (name: string) => {
        // Convert JobMatch_20260117_112603.pdf to a readable format
        const match = name.match(/JobMatch_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})\.pdf/);
        if (match) {
            const [, year, month, day, hour, min] = match;
            const date = new Date(`${year}-${month}-${day}T${hour}:${min}:00`);
            return `Job Recommendations - ${date.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })}`;
        }
        return name.replace('.pdf', '').replace(/_/g, ' ');
    };

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
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                    Job Recommendation Reports
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Daily job match reports based on your profile and preferences
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                disabled={refreshing}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {reports.length === 0 ? (
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
                        ) : (
                            <div className="space-y-3">
                                {reports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                                                    {formatReportName(report.name)}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatDate(report.created_at)}
                                                    </span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        PDF
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleView(report)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownload(report.url)}
                                            >
                                                <Download className="w-4 h-4 mr-1" />
                                                Download
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* PDF Viewer Dialog */}
            <Dialog open={pdfViewerOpen} onOpenChange={setPdfViewerOpen}>
                <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden">
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-blue-600" />
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                        {viewingReport ? formatReportName(viewingReport.name) : 'Report Preview'}
                                    </h2>
                                    {viewingReport && (
                                        <p className="text-sm text-muted-foreground">
                                            Generated on {formatDate(viewingReport.created_at)}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => viewingReport?.url && window.open(viewingReport.url, '_blank')}
                                >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Open in New Tab
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => viewingReport?.url && handleDownload(viewingReport.url)}
                                >
                                    <Download className="w-4 h-4 mr-1" />
                                    Download PDF
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setPdfViewerOpen(false)}
                                    className="ml-2"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* PDF Viewer */}
                        <div className="flex-1 bg-gray-100 dark:bg-slate-800">
                            {viewingReport?.url ? (
                                <iframe
                                    src={`${viewingReport.url}#toolbar=0&navpanes=0&scrollbar=1`}
                                    className="w-full h-full border-0"
                                    title="Report PDF Preview"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                        <p className="text-gray-500">No PDF available</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}
