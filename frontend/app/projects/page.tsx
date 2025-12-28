// frontend/app/projects/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { supabase } from "@/lib/supabase";
import { Upload, Info, Github, RefreshCw, ExternalLink, Sparkles, Video, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

// Environment variable for GitHub Sync Service
const GITHUB_SYNC_SERVICE_URL = process.env.NEXT_PUBLIC_GITHUB_SYNC_SERVICE_URL || 'http://localhost:8005';

interface GitHubIntegration {
    id: string;
    github_username: string;
    is_active: boolean;
    created_at: string;
}

interface Repository {
    id: string;
    name: string;
    full_name: string;
    html_url: string;
    description: string | null;
    description_ai: string | null;
    language: string | null;
    stars_count: number;
    has_intro_video: boolean;
    last_synced_at: string;
    sync_status: string;
}

export default function ProjectsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [githubIntegration, setGithubIntegration] = useState<GitHubIntegration | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [generatingAI, setGeneratingAI] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        checkAuth();

        // Check for callback messages
        const success = searchParams.get('github_connected');
        const error = searchParams.get('error');

        if (success === 'true') {
            setMessage({ type: 'success', text: 'GitHub connected successfully! Syncing your repositories...' });
            // Clear the URL params
            router.replace('/projects');
        } else if (error) {
            setMessage({ type: 'error', text: decodeURIComponent(error) });
            router.replace('/projects');
        }
    }, [searchParams]);

    const checkAuth = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Check if GitHub is connected
            await fetchGitHubIntegration(user.id);
            await fetchRepositories(user.id);
        } catch (error) {
            console.error('Error checking auth:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchGitHubIntegration = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('github_integrations')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
            setGithubIntegration(data);
        } catch (error) {
            console.error('Error fetching GitHub integration:', error);
        }
    };

    const fetchRepositories = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('repositories')
                .select('*')
                .eq('user_id', userId)
                .order('last_synced_at', { ascending: false });

            if (error) throw error;
            setRepositories(data || []);
        } catch (error) {
            console.error('Error fetching repositories:', error);
        }
    };

    const connectGitHub = async () => {
        try {
            // Get current session for the callback
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            // Redirect to GitHub OAuth through our service
            window.location.href = `${GITHUB_SYNC_SERVICE_URL}/v1/github/authorize?user_id=${session.user.id}`;
        } catch (error) {
            console.error('Error connecting GitHub:', error);
            setMessage({ type: 'error', text: 'Failed to initiate GitHub connection' });
        }
    };

    const syncRepositories = async () => {
        setSyncing(true);
        setMessage(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${GITHUB_SYNC_SERVICE_URL}/v1/projects/sync`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to sync repositories');
            }

            setMessage({ type: 'success', text: `Synced ${data.synced_count} repositories from GitHub` });
            await fetchRepositories(session.user.id);
        } catch (error: any) {
            console.error('Error syncing repositories:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to sync repositories' });
        } finally {
            setSyncing(false);
        }
    };

    const generateAIDescription = async (repoId: string) => {
        setGeneratingAI(repoId);
        setMessage(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${GITHUB_SYNC_SERVICE_URL}/v1/projects/${repoId}/describe`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ regenerate: true })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to generate AI description');
            }

            // Update the repository in state
            setRepositories(prev => prev.map(repo =>
                repo.id === repoId
                    ? { ...repo, description_ai: data.description_ai }
                    : repo
            ));

            setMessage({ type: 'success', text: 'AI description generated successfully!' });
        } catch (error: any) {
            console.error('Error generating AI description:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to generate AI description' });
        } finally {
            setGeneratingAI(null);
        }
    };

    const disconnectGitHub = async () => {
        if (!confirm('Are you sure you want to disconnect GitHub? This will remove all synced repositories.')) {
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Delete the integration
            const { error } = await supabase
                .from('github_integrations')
                .delete()
                .eq('user_id', session.user.id);

            if (error) throw error;

            setGithubIntegration(null);
            setRepositories([]);
            setMessage({ type: 'success', text: 'GitHub disconnected successfully' });
        } catch (error: any) {
            console.error('Error disconnecting GitHub:', error);
            setMessage({ type: 'error', text: 'Failed to disconnect GitHub' });
        }
    };

    const getLanguageColor = (language: string | null) => {
        const colors: Record<string, string> = {
            'JavaScript': 'bg-yellow-400',
            'TypeScript': 'bg-blue-500',
            'Python': 'bg-green-500',
            'Java': 'bg-red-500',
            'Go': 'bg-cyan-500',
            'Rust': 'bg-orange-500',
            'C++': 'bg-pink-500',
            'C#': 'bg-purple-500',
        };
        return colors[language || ''] || 'bg-gray-400';
    };

    return (
        <DashboardLayout>
            <DashboardHeader title="Projects" subtitle="Manage your GitHub projects and AI-generated descriptions" />

            <div className="p-6">
                {/* Status Message */}
                {message && (
                    <Card className={`mb-6 border ${message.type === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-950/30' : 'border-red-200 bg-red-50 dark:bg-red-950/30'}`}>
                        <CardContent className="pt-6 flex items-center gap-2">
                            {message.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-600" />
                            )}
                            <span className="text-sm">{message.text}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto"
                                onClick={() => setMessage(null)}
                            >
                                ×
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* GitHub Connection Status */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Github className="w-5 h-5" />
                            GitHub Integration
                        </CardTitle>
                        <CardDescription>
                            Connect your GitHub account to sync your repositories and generate AI-powered project descriptions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {githubIntegration ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-medium">Connected as @{githubIntegration.github_username}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Connected on {new Date(githubIntegration.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={syncRepositories}
                                        disabled={syncing}
                                    >
                                        {syncing ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                        )}
                                        {syncing ? 'Syncing...' : 'Sync Repos'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={disconnectGitHub}
                                    >
                                        Disconnect
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <p className="text-muted-foreground">
                                    Connect your GitHub account to get started.
                                </p>
                                <Button onClick={connectGitHub} className="gap-2">
                                    <Github className="w-4 h-4" />
                                    Connect GitHub
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Repositories List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                        </div>
                    ) : !githubIntegration ? (
                        <Card className="border-dashed">
                            <CardContent className="pt-6 text-center py-12">
                                <Github className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-medium mb-2">No GitHub Account Connected</h3>
                                <p className="text-muted-foreground mb-4">
                                    Connect your GitHub account to sync your repositories and generate AI-powered descriptions for your resume.
                                </p>
                                <Button onClick={connectGitHub} className="gap-2">
                                    <Github className="w-4 h-4" />
                                    Connect GitHub
                                </Button>
                            </CardContent>
                        </Card>
                    ) : repositories.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6 text-center py-12">
                                <RefreshCw className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-medium mb-2">No Repositories Synced</h3>
                                <p className="text-muted-foreground mb-4">
                                    Click "Sync Repos" to fetch your GitHub repositories.
                                </p>
                                <Button onClick={syncRepositories} disabled={syncing} className="gap-2">
                                    {syncing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="w-4 h-4" />
                                    )}
                                    {syncing ? 'Syncing...' : 'Sync Repositories'}
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">{repositories.length} Repositories</h2>
                            </div>
                            {repositories.map((repo) => (
                                <Card key={repo.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <a
                                                        href={repo.html_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
                                                    >
                                                        {repo.name}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                    {repo.language && (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <span className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
                                                            {repo.language}
                                                        </Badge>
                                                    )}
                                                    {repo.has_intro_video && (
                                                        <Badge variant="outline" className="gap-1">
                                                            <Video className="w-3 h-3" />
                                                            Video
                                                        </Badge>
                                                    )}
                                                </div>

                                                {/* AI Description */}
                                                {repo.description_ai ? (
                                                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-3 rounded-lg mb-3">
                                                        <div className="flex items-center gap-1 text-xs text-purple-600 mb-1">
                                                            <Sparkles className="w-3 h-3" />
                                                            AI-Generated Summary
                                                        </div>
                                                        <p className="text-sm">{repo.description_ai}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground mb-3">
                                                        {repo.description || 'No description available'}
                                                    </p>
                                                )}

                                                <p className="text-xs text-muted-foreground">
                                                    Last synced: {new Date(repo.last_synced_at).toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="flex gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1"
                                                    onClick={() => generateAIDescription(repo.id)}
                                                    disabled={generatingAI === repo.id}
                                                >
                                                    {generatingAI === repo.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <Sparkles className="w-3 h-3" />
                                                    )}
                                                    {repo.description_ai ? 'Regenerate' : 'Generate AI'}
                                                </Button>
                                                <Button size="sm" variant="outline" className="gap-1">
                                                    <Upload className="w-3 h-3" />
                                                    Video
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </>
                    )}
                </div>

                {/* Pagination */}
                {repositories.length > 10 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                        <Button variant="outline" size="sm" disabled>← Prev</Button>
                        <Button variant="default" size="sm">1</Button>
                        <Button variant="outline" size="sm">2</Button>
                        <Button variant="outline" size="sm">Next →</Button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
