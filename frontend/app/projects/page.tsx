// frontend/app/projects/page.tsx
"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { supabase } from "@/lib/supabase";
import {
    Upload, Info, Github, RefreshCw, ExternalLink, Sparkles, Video,
    CheckCircle, AlertCircle, Loader2, ChevronDown, ChevronUp,
    Camera, X, FileVideo, AlertTriangle, Play, Trash2, Download, Edit2
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import ReactMarkdown from 'react-markdown';

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
    readme_content: string | null;
    language: string | null;
    stars_count: number;
    has_intro_video: boolean;
    last_synced_at: string;
    sync_status: string;
    genres: string[] | null;
}

interface ProjectVideo {
    id: string;
    repo_id: string;
    storage_path: string;
    status: string;
    playback_url: string | null;
    file_name?: string;
    file_size?: number;
}

// Genre badge colors
const genreColors: Record<string, string> = {
    'web-development': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    'mobile-app': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'machine-learning': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    'data-science': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    'devops': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    'game-development': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    'backend': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'frontend': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    'api': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'automation': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
};

function ProjectsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const [projectVideos, setProjectVideos] = useState<Record<string, ProjectVideo>>({});
    const [githubIntegration, setGithubIntegration] = useState<GitHubIntegration | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [generatingAI, setGeneratingAI] = useState<string | null>(null);
    const [detectingGenre, setDetectingGenre] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [expandedRepo, setExpandedRepo] = useState<string | null>(null);
    const [syncCooldown, setSyncCooldown] = useState(0); // Seconds remaining in cooldown

    // Video recording/upload states
    const [videoDialogOpen, setVideoDialogOpen] = useState(false);
    const [selectedRepoForVideo, setSelectedRepoForVideo] = useState<Repository | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        checkAuth();

        // Check for callback messages
        const success = searchParams.get('github_connected');
        const error = searchParams.get('error');

        if (success === 'true') {
            setMessage({ type: 'success', text: 'GitHub connected successfully! Syncing your repositories...' });
            router.replace('/projects');
        } else if (error) {
            setMessage({ type: 'error', text: decodeURIComponent(error) });
            router.replace('/projects');
        }

        return () => {
            // Cleanup on unmount
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (cooldownTimerRef.current) {
                clearInterval(cooldownTimerRef.current);
            }
        };
    }, [searchParams]);

    const checkAuth = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            await fetchGitHubIntegration(user.id);
            await fetchRepositories(user.id);
            await fetchProjectVideos(user.id);
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

            if (error && error.code !== 'PGRST116') throw error;
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

    const fetchProjectVideos = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('project_videos')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;

            // Create a map of repo_id to video
            const videoMap: Record<string, ProjectVideo> = {};
            (data || []).forEach(video => {
                videoMap[video.repo_id] = video;
            });
            setProjectVideos(videoMap);
        } catch (error) {
            console.error('Error fetching project videos:', error);
        }
    };

    const connectGitHub = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            window.location.href = `${GITHUB_SYNC_SERVICE_URL}/v1/github/authorize?user_id=${session.user.id}`;
        } catch (error) {
            console.error('Error connecting GitHub:', error);
            setMessage({ type: 'error', text: 'Failed to initiate GitHub connection' });
        }
    };

    const syncRepositories = async () => {
        if (syncCooldown > 0) {
            setMessage({ type: 'error', text: `Please wait ${syncCooldown} seconds before syncing again.` });
            return;
        }

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
                // Handle 429 Too Many Requests (cooldown)
                if (response.status === 429) {
                    // Extract remaining seconds from error message
                    const match = data.detail?.match(/wait (\d+) seconds/);
                    const remainingSeconds = match ? parseInt(match[1]) : 180;
                    startCooldownTimer(remainingSeconds);
                    throw new Error(`Cooldown active: Please wait ${remainingSeconds} seconds before syncing again.`);
                }
                throw new Error(data.detail || 'Failed to sync repositories');
            }

            setMessage({ type: 'success', text: data.message || `Synced ${data.synced_count} repositories` });
            await fetchRepositories(session.user.id);
        } catch (error: any) {
            console.error('Error syncing repositories:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to sync repositories' });
        } finally {
            setSyncing(false);
        }
    };

    const startCooldownTimer = (seconds: number) => {
        setSyncCooldown(seconds);

        // Clear any existing timer
        if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
        }

        // Start countdown
        cooldownTimerRef.current = setInterval(() => {
            setSyncCooldown(prev => {
                if (prev <= 1) {
                    if (cooldownTimerRef.current) {
                        clearInterval(cooldownTimerRef.current);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
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

    const detectGenre = async (repoId: string, readmeContent: string) => {
        setDetectingGenre(repoId);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Call the backend genre detection endpoint
            const response = await fetch(`${GITHUB_SYNC_SERVICE_URL}/v1/projects/${repoId}/detect-genre`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to detect genre');
            }

            setRepositories(prev => prev.map(repo =>
                repo.id === repoId
                    ? { ...repo, genres: data.genres }
                    : repo
            ));

            setMessage({ type: 'success', text: 'Project genres detected!' });
        } catch (error: any) {
            console.error('Error detecting genre:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to detect genre' });
        } finally {
            setDetectingGenre(null);
        }
    };

    const disconnectGitHub = async () => {
        if (!confirm('Are you sure you want to disconnect GitHub? This will remove all synced repositories.')) {
            return;
        }

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

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

    // Video Recording Functions
    const openVideoDialog = (repo: Repository) => {
        setSelectedRepoForVideo(repo);
        setVideoDialogOpen(true);
        setRecordedBlob(null);
        setRecordingTime(0);
    };

    const closeVideoDialog = () => {
        stopRecording();
        setVideoDialogOpen(false);
        setSelectedRepoForVideo(null);
        setRecordedBlob(null);
        setRecordingTime(0);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: true
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                setRecordedBlob(blob);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    // Auto-stop at 60 seconds
                    if (prev >= 60) {
                        stopRecording();
                        return 60;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (error) {
            console.error('Error starting recording:', error);
            setMessage({ type: 'error', text: 'Failed to access camera. Please allow camera permissions.' });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        setIsRecording(false);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (50MB limit)
        if (file.size > 52428800) {
            setMessage({ type: 'error', text: 'Video file must be under 50MB' });
            return;
        }

        // Check file type
        const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
        if (!allowedTypes.includes(file.type)) {
            setMessage({ type: 'error', text: 'Invalid file type. Allowed: MP4, WebM, MOV, AVI' });
            return;
        }

        setRecordedBlob(file);
    };

    const uploadVideo = async () => {
        if (!recordedBlob || !selectedRepoForVideo) return;

        setUploadingVideo(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            // Check if there's an existing video to delete first
            const existingVideo = projectVideos[selectedRepoForVideo.id];
            if (existingVideo && existingVideo.storage_path) {
                try {
                    // Delete old video from storage
                    await supabase.storage
                        .from('project-videos')
                        .remove([existingVideo.storage_path]);
                    console.log('Deleted old video:', existingVideo.storage_path);
                } catch (err) {
                    console.warn('Failed to delete old video (may not exist):', err);
                }
            }

            // Generate unique filename
            const fileName = `${session.user.id}/${selectedRepoForVideo.id}/${Date.now()}.webm`;

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from('project-videos')
                .upload(fileName, recordedBlob, {
                    contentType: 'video/webm',
                    upsert: true
                });

            if (error) throw error;

            // Get signed URL for private bucket (valid for 1 year)
            const { data: signedUrlData } = await supabase.storage
                .from('project-videos')
                .createSignedUrl(fileName, 31536000); // 1 year in seconds

            const playbackUrl = signedUrlData?.signedUrl || null;

            // Save video record in database (upsert will update if exists)
            const { error: dbError } = await supabase
                .from('project_videos')
                .upsert({
                    user_id: session.user.id,
                    repo_id: selectedRepoForVideo.id,
                    storage_path: fileName,
                    storage_bucket: 'project-videos',
                    file_name: `${selectedRepoForVideo.name}-intro.webm`,
                    file_size: recordedBlob.size,
                    content_type: 'video/webm',
                    status: 'uploaded',
                    playback_url: playbackUrl
                }, { onConflict: 'user_id,repo_id' });

            if (dbError) throw dbError;

            // Update repository to mark as having video
            await supabase
                .from('repositories')
                .update({ has_intro_video: true })
                .eq('id', selectedRepoForVideo.id);

            // Refresh data
            setRepositories(prev => prev.map(repo =>
                repo.id === selectedRepoForVideo.id
                    ? { ...repo, has_intro_video: true }
                    : repo
            ));

            await fetchProjectVideos(session.user.id);

            setMessage({ type: 'success', text: existingVideo ? 'Video updated successfully!' : 'Video uploaded successfully!' });
            closeVideoDialog();
        } catch (error: any) {
            console.error('Error uploading video:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to upload video' });
        } finally {
            setUploadingVideo(false);
        }
    };

    const deleteVideo = async (repoId: string) => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const video = projectVideos[repoId];
            if (!video) return;

            // Delete from storage
            await supabase.storage
                .from('project-videos')
                .remove([video.storage_path]);

            // Delete from database
            await supabase
                .from('project_videos')
                .delete()
                .eq('id', video.id);

            // Update repository
            await supabase
                .from('repositories')
                .update({ has_intro_video: false })
                .eq('id', repoId);

            // Refresh data
            setRepositories(prev => prev.map(repo =>
                repo.id === repoId
                    ? { ...repo, has_intro_video: false }
                    : repo
            ));

            const newVideos = { ...projectVideos };
            delete newVideos[repoId];
            setProjectVideos(newVideos);

            setMessage({ type: 'success', text: 'Video deleted successfully' });
        } catch (error: any) {
            console.error('Error deleting video:', error);
            setMessage({ type: 'error', text: 'Failed to delete video' });
        }
    };

    const downloadVideo = async (repoId: string) => {
        try {
            const video = projectVideos[repoId];
            if (!video || !video.storage_path) {
                setMessage({ type: 'error', text: 'Video not found' });
                return;
            }

            // Get a fresh signed URL for download
            const { data, error } = await supabase.storage
                .from('project-videos')
                .createSignedUrl(video.storage_path, 3600); // 1 hour

            if (error || !data?.signedUrl) {
                throw new Error('Failed to generate download URL');
            }

            // Trigger download
            const link = document.createElement('a');
            link.href = data.signedUrl;
            link.download = video.file_name || `project-video-${repoId}.webm`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setMessage({ type: 'success', text: 'Video download started!' });
        } catch (error: any) {
            console.error('Error downloading video:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to download video' });
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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <DashboardLayout>
            <DashboardHeader title="Projects" subtitle="Manage your GitHub projects and AI-generated descriptions" />

            <div className="p-6">
                {/* Important Notice Alert */}
                <Alert className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-800 dark:text-amber-400">Important: README.md Required</AlertTitle>
                    <AlertDescription className="text-amber-700 dark:text-amber-300">
                        Only repositories containing a <strong>README.md</strong> file will be synced and processed.
                        The GitHub Sync Service extracts project details from the README.md file to generate AI descriptions
                        and detect project genres. Make sure your repositories have a well-documented README.md file.
                    </AlertDescription>
                </Alert>

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
                                        disabled={syncing || syncCooldown > 0}
                                        className={syncCooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}
                                    >
                                        {syncing ? (
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                        )}
                                        {syncing
                                            ? 'Syncing...'
                                            : syncCooldown > 0
                                                ? `Wait ${Math.floor(syncCooldown / 60)}:${(syncCooldown % 60).toString().padStart(2, '0')}`
                                                : 'Sync Repos'
                                        }
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
                            {/* Important README Notice */}
                            <Alert className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                                <AlertTitle className="text-amber-800 dark:text-amber-400">README.md Required for AI Features</AlertTitle>
                                <AlertDescription className="text-amber-700 dark:text-amber-300">
                                    To generate first-person project descriptions for your resume, each repository <strong>must have a detailed README.md file</strong> that describes:
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        <li>What the project does and its purpose</li>
                                        <li>Technologies and frameworks used</li>
                                        <li>Key features and accomplishments</li>
                                        <li>Your role and contributions</li>
                                    </ul>
                                </AlertDescription>
                            </Alert>

                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">{repositories.length} Repositories</h2>
                            </div>
                            {repositories.map((repo) => (
                                <Card key={repo.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
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
                                                        <Badge variant="outline" className="gap-1 text-green-600 border-green-300">
                                                            <Video className="w-3 h-3" />
                                                            Video
                                                        </Badge>
                                                    )}
                                                    {/* Genre Badges */}
                                                    {repo.genres && repo.genres.length > 0 && repo.genres.map((genre, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            className={`${genreColors[genre] || 'bg-gray-100 text-gray-800'}`}
                                                        >
                                                            {genre.replace(/-/g, ' ')}
                                                        </Badge>
                                                    ))}
                                                </div>

                                                {/* README Content Preview */}
                                                {repo.readme_content ? (
                                                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mb-3">
                                                        <div
                                                            className={`prose prose-sm dark:prose-invert max-w-none ${expandedRepo !== repo.id ? 'line-clamp-3' : ''}`}
                                                        >
                                                            {expandedRepo === repo.id ? (
                                                                <ReactMarkdown>{repo.readme_content}</ReactMarkdown>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {repo.readme_content.slice(0, 200)}...
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="mt-2"
                                                            onClick={() => setExpandedRepo(expandedRepo === repo.id ? null : repo.id)}
                                                        >
                                                            {expandedRepo === repo.id ? (
                                                                <>
                                                                    <ChevronUp className="w-4 h-4 mr-1" />
                                                                    Show Less
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ChevronDown className="w-4 h-4 mr-1" />
                                                                    View Full README
                                                                </>
                                                            )}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground mb-3">
                                                        {repo.description || 'No README content available. Make sure your repository has a README.md file.'}
                                                    </p>
                                                )}

                                                {/* Video Player */}
                                                {projectVideos[repo.id] && projectVideos[repo.id].playback_url && (
                                                    <div className="mt-3 mb-3">
                                                        <video
                                                            controls
                                                            className="w-full max-w-md rounded-lg"
                                                            src={projectVideos[repo.id].playback_url || ''}
                                                        >
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    </div>
                                                )}

                                                {/* AI-Generated Description */}
                                                {repo.description_ai && (
                                                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Sparkles className="w-4 h-4 text-purple-600" />
                                                            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">AI-Generated Resume Description</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                                            {repo.description_ai}
                                                        </p>
                                                        <p className="mt-2 text-xs text-muted-foreground italic">
                                                            ✨ This first-person description is ready for your resume!
                                                        </p>
                                                    </div>
                                                )}

                                                <p className="text-xs text-muted-foreground mt-3">
                                                    Last synced: {new Date(repo.last_synced_at).toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-2 ml-4">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1"
                                                    onClick={() => generateAIDescription(repo.id)}
                                                    disabled={generatingAI === repo.id || !repo.readme_content}
                                                    title={!repo.readme_content ? 'README required' : ''}
                                                >
                                                    {generatingAI === repo.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <Sparkles className="w-3 h-3" />
                                                    )}
                                                    {repo.description_ai ? 'Regenerate' : 'Generate AI'}
                                                </Button>

                                                {!repo.genres || repo.genres.length === 0 ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1"
                                                        onClick={() => detectGenre(repo.id, repo.readme_content || '')}
                                                        disabled={detectingGenre === repo.id || !repo.readme_content}
                                                    >
                                                        {detectingGenre === repo.id ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            <Info className="w-3 h-3" />
                                                        )}
                                                        Detect Genre
                                                    </Button>
                                                ) : null}

                                                {repo.has_intro_video ? (
                                                    <div className="flex flex-col gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-1"
                                                            onClick={() => openVideoDialog(repo)}
                                                        >
                                                            <Edit2 className="w-3 h-3" />
                                                            Update Video
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-1 text-blue-600 hover:text-blue-700"
                                                            onClick={() => downloadVideo(repo.id)}
                                                        >
                                                            <Download className="w-3 h-3" />
                                                            Download
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => deleteVideo(repo.id)}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1"
                                                        onClick={() => openVideoDialog(repo)}
                                                    >
                                                        <Camera className="w-3 h-3" />
                                                        Add Video
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* Video Recording/Upload Dialog */}
            <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Video className="w-5 h-5" />
                            Add Project Intro Video
                        </DialogTitle>
                        <DialogDescription>
                            Record a short video (max 60 seconds) or upload an existing video (max 50MB).
                            <br />
                            Project: <strong>{selectedRepoForVideo?.name}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Video Preview / Recording Area */}
                        <div className="bg-black rounded-lg aspect-video flex items-center justify-center overflow-hidden">
                            {isRecording || recordedBlob ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted={isRecording}
                                    playsInline
                                    className="w-full h-full object-cover"
                                    src={recordedBlob ? URL.createObjectURL(recordedBlob) : undefined}
                                    controls={!!recordedBlob && !isRecording}
                                />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <Camera className="w-16 h-16 mx-auto mb-2" />
                                    <p>Camera preview will appear here</p>
                                </div>
                            )}
                        </div>

                        {/* Recording Timer */}
                        {isRecording && (
                            <div className="text-center">
                                <span className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full">
                                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                                    Recording: {formatTime(recordingTime)} / 1:00
                                </span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-center">
                            {!isRecording && !recordedBlob && (
                                <>
                                    <Button onClick={startRecording} className="gap-2">
                                        <Camera className="w-4 h-4" />
                                        Start Recording
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="w-4 h-4" />
                                        Upload Video
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />
                                </>
                            )}

                            {isRecording && (
                                <Button variant="destructive" onClick={stopRecording} className="gap-2">
                                    <X className="w-4 h-4" />
                                    Stop Recording
                                </Button>
                            )}

                            {recordedBlob && !isRecording && (
                                <>
                                    <Button
                                        onClick={uploadVideo}
                                        disabled={uploadingVideo}
                                        className="gap-2"
                                    >
                                        {uploadingVideo ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Upload className="w-4 h-4" />
                                        )}
                                        {uploadingVideo ? 'Uploading...' : 'Save Video'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setRecordedBlob(null)}
                                        className="gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Re-record
                                    </Button>
                                </>
                            )}
                        </div>
                        {/* File Size Info */}
                        {recordedBlob && (
                            <p className="text-sm text-center text-muted-foreground">
                                File size: {(recordedBlob.size / (1024 * 1024)).toFixed(2)} MB (max 50MB)
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
}

// Wrapper component with Suspense boundary for useSearchParams
function ProjectsLoadingFallback() {
    return (
        <DashboardLayout>
            <DashboardHeader title="Projects" subtitle="Manage your GitHub projects and AI-generated descriptions" />
            <div className="p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
        </DashboardLayout>
    );
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={<ProjectsLoadingFallback />}>
            <ProjectsPageContent />
        </Suspense>
    );
}
