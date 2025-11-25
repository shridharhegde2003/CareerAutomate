// frontend/app/projects/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardHeader } from "@/components/dashboard-header";
import { supabase } from "@/lib/supabase";
import { Upload, Info } from "lucide-react";

interface Project {
    id: string;
    repo_name: string;
    description: string;
    video_url: string | null;
    video_status: string;
    status: string;
}

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'New': 'default',
            'No Video': 'secondary',
            'Video Uploaded': 'outline',
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    return (
        <div className="flex h-screen bg-background">
            <DashboardNav />

            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader />

                <div className="flex-1 overflow-auto">
                    <div className="p-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold mb-2">Projects</h1>
                            <p className="text-muted-foreground">Manage your projects and their associated videos.</p>
                        </div>

                        <Card className="mb-6 border-blue-200 bg-blue-50">
                            <CardContent className="pt-6 flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-600" />
                                <span className="text-sm">New Project Detected - Record new Video?</span>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            {loading ? (
                                <div>Loading...</div>
                            ) : projects.length === 0 ? (
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-center text-muted-foreground">No projects yet. Connect your GitHub to sync projects.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                projects.map((project) => (
                                    <Card key={project.id}>
                                        <CardContent className="pt-6">
                                            <div className="grid grid-cols-12 gap-4 items-center">
                                                <div className="col-span-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{project.repo_name}</span>
                                                        {project.status === 'New' && (
                                                            <Badge variant="default" className="text-xs">New</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-span-4">
                                                    <p className="text-sm text-muted-foreground">{project.description}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    {getStatusBadge(project.video_status)}
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="text-sm">{project.status}</span>
                                                </div>
                                                <div className="col-span-2 flex gap-2 justify-end">
                                                    <Button size="sm" variant="outline" className="gap-1">
                                                        <Upload className="w-3 h-3" />
                                                        Record/Upload Video
                                                    </Button>
                                                    <Button size="sm" variant="ghost">
                                                        Regenerate Description
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        {projects.length > 0 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <Button variant="outline" size="sm" disabled>← Prev</Button>
                                <Button variant="default" size="sm">1</Button>
                                <Button variant="outline" size="sm">2</Button>
                                <Button variant="outline" size="sm">Next →</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
