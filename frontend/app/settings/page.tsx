// frontend/app/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { supabase } from "@/lib/supabase";
import { Edit2, Save, X, Plus, Trash2, Github, Linkedin, Mail, MapPin, Calendar, GraduationCap, Briefcase, Key, User } from "lucide-react";

// Degree type options (same as onboarding form)
const DEGREE_TYPES = [
    { value: '10th', label: '10th Standard / SSLC' },
    { value: '12th', label: '12th Standard / PUC / HSC' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'bachelor', label: "Bachelor's Degree" },
    { value: 'master', label: "Master's Degree" },
    { value: 'phd', label: 'PhD / Doctorate' },
];

interface Education {
    degree_type?: string;
    degree_name?: string;
    institution?: string;
    grade_type?: 'percentage' | 'cgpa';
    obtained_marks?: string;
    total_marks?: string;
    obtained_cgpa?: string;
    max_cgpa?: string;
    year_of_completion?: string;
    percentage?: string;
    // Legacy fields
    degree?: string;
    field_of_study?: string;
    graduation_year?: string;
}

interface CareerPreferences {
    roles_targeted?: string[];
    preferred_roles?: string[];
    min_target_lpa?: number;
    target_lpa?: string;
    preferred_locations?: string[];
    work_preference?: string[];
    other_preferences?: string[];
}

interface ApiKeys {
    gemini_ai_key?: string;
    linkedin_api_key?: string;
    naukri_api_key?: string;
    indeed_api_key?: string;
    gmail_api_key?: string;
}

interface UserProfile {
    id?: string;
    full_name?: string;
    date_of_birth?: string;
    secondary_email?: string;
    address?: string;
    linkedin_url?: string;
    github_username?: string;
    skills?: string[];
    education?: Education[];
    career_preferences?: CareerPreferences;
    api_keys?: ApiKeys;
    profile_photo_url?: string;
    govt_id_url?: string;
    onboarding_completed?: boolean;
}

// Component to check actual GitHub OAuth connection status
function GitHubConnectionStatus({ profile }: { profile: UserProfile }) {
    const [isConnected, setIsConnected] = useState(false);
    const [githubUsername, setGithubUsername] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Check github_integrations table for actual OAuth connection
                const { data, error } = await supabase
                    .from('github_integrations')
                    .select('github_username, is_active')
                    .eq('user_id', user.id)
                    .single();

                if (data && data.is_active) {
                    setIsConnected(true);
                    setGithubUsername(data.github_username);
                } else {
                    setIsConnected(false);
                }
            } catch (error) {
                console.error('Error checking GitHub connection:', error);
                setIsConnected(false);
            } finally {
                setLoading(false);
            }
        };

        checkConnection();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                        <Github className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <p className="font-medium">GitHub</p>
                        <p className="text-sm text-muted-foreground">Checking...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded flex items-center justify-center">
                    <Github className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="font-medium">GitHub</p>
                    <p className="text-sm text-muted-foreground">
                        {isConnected && githubUsername
                            ? `@${githubUsername}`
                            : 'Not connected'}
                    </p>
                </div>
            </div>
            {isConnected ? (
                <Badge className="bg-green-100 text-green-700">Connected</Badge>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        // Redirect to GitHub OAuth
                        const GITHUB_SYNC_URL = process.env.NEXT_PUBLIC_GITHUB_SYNC_SERVICE_URL;
                        supabase.auth.getUser().then(({ data: { user } }) => {
                            if (user) {
                                window.location.href = `${GITHUB_SYNC_URL}/v1/github/authorize?user_id=${user.id}&redirect_to=/settings`;
                            }
                        });
                    }}
                >
                    Connect
                </Button>
            )}
        </div>
    );
}

export default function SettingsPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile>({});
    const [originalProfile, setOriginalProfile] = useState<UserProfile>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState({
        personal: false,
        academic: false,
        skills: false,
        career: false,
        apiKeys: false,
    });
    const [newSkill, setNewSkill] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        checkAuth();
        fetchProfile();
    }, []);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }
    };

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                setProfile(data);
                setOriginalProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile data' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (section: string) => {
        setSaving(true);
        setMessage(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    ...profile,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            setOriginalProfile(profile);
            setEditMode({ ...editMode, [section]: false });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Error saving profile:', error);
            setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = (section: string) => {
        setProfile(originalProfile);
        setEditMode({ ...editMode, [section]: false });
    };

    const addSkill = () => {
        if (newSkill.trim() && !profile.skills?.includes(newSkill.trim())) {
            setProfile({
                ...profile,
                skills: [...(profile.skills || []), newSkill.trim()]
            });
            setNewSkill('');
        }
    };

    const removeSkill = (index: number) => {
        const updated = [...(profile.skills || [])];
        updated.splice(index, 1);
        setProfile({ ...profile, skills: updated });
    };

    const updateCareerPreference = (field: string, value: any) => {
        setProfile({
            ...profile,
            career_preferences: {
                ...profile.career_preferences,
                [field]: value
            }
        });
    };

    const updateApiKey = (field: string, value: string) => {
        setProfile({
            ...profile,
            api_keys: {
                ...profile.api_keys,
                [field]: value
            }
        });
    };

    // Helper to format date for display
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Not set';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    // Get roles from career preferences
    const getRoles = () => {
        return profile.career_preferences?.roles_targeted ||
            profile.career_preferences?.preferred_roles ||
            [];
    };

    // Get target LPA
    const getTargetLpa = () => {
        return profile.career_preferences?.min_target_lpa?.toString() ||
            profile.career_preferences?.target_lpa ||
            '';
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full pt-48">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-lg font-medium">Loading profile...</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <DashboardHeader title="Profile Settings" subtitle="View and manage your account settings and preferences" />

            <div className="p-6">
                {/* Status Message */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${message.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-700'
                        : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                        <span>{message.text}</span>
                        <button onClick={() => setMessage(null)} className="text-gray-500 hover:text-gray-700">×</button>
                    </div>
                )}

                <div className="space-y-6 max-w-4xl">
                    {/* Personal Details */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    <CardTitle>Personal Details</CardTitle>
                                </div>
                                {!editMode.personal ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditMode({ ...editMode, personal: true })}
                                    >
                                        <Edit2 className="w-4 h-4 mr-1" /> Edit
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCancel('personal')}
                                        >
                                            <X className="w-4 h-4 mr-1" /> Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleSave('personal')}
                                            disabled={saving}
                                        >
                                            <Save className="w-4 h-4 mr-1" /> Save
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <User className="w-4 h-4" /> Full Name
                                </Label>
                                <Input
                                    value={profile.full_name || ''}
                                    disabled
                                    className="bg-muted"
                                />
                                <p className="text-xs text-muted-foreground">Name cannot be changed</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Secondary Email
                                </Label>
                                <Input
                                    type="email"
                                    value={profile.secondary_email || ''}
                                    onChange={(e) => setProfile({ ...profile, secondary_email: e.target.value })}
                                    disabled={!editMode.personal}
                                    placeholder="secondary@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Date of Birth
                                </Label>
                                {editMode.personal ? (
                                    <Input
                                        type="date"
                                        value={profile.date_of_birth || ''}
                                        onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                ) : (
                                    <Input
                                        value={formatDate(profile.date_of_birth)}
                                        disabled
                                    />
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> Address
                                </Label>
                                <Input
                                    value={profile.address || ''}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    disabled={!editMode.personal}
                                    placeholder="City, State, Country"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Linkedin className="w-4 h-4" /> LinkedIn URL
                                </Label>
                                <Input
                                    value={profile.linkedin_url || ''}
                                    onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                                    disabled={!editMode.personal}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Github className="w-4 h-4" /> GitHub Username
                                </Label>
                                <Input
                                    value={profile.github_username || ''}
                                    onChange={(e) => setProfile({ ...profile, github_username: e.target.value })}
                                    disabled={!editMode.personal}
                                    placeholder="yourusername"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Skills</CardTitle>
                                {!editMode.skills ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditMode({ ...editMode, skills: true })}
                                    >
                                        <Edit2 className="w-4 h-4 mr-1" /> Edit
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCancel('skills')}
                                        >
                                            <X className="w-4 h-4 mr-1" /> Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleSave('skills')}
                                            disabled={saving}
                                        >
                                            <Save className="w-4 h-4 mr-1" /> Save
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {editMode.skills && (
                                <div className="flex gap-2 mb-4">
                                    <Input
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                        placeholder="Add a skill..."
                                    />
                                    <Button onClick={addSkill} type="button">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {profile.skills && profile.skills.length > 0 ? (
                                    profile.skills.map((skill, idx) => (
                                        <Badge
                                            key={idx}
                                            variant="secondary"
                                            className="px-3 py-1 text-sm flex items-center gap-2"
                                        >
                                            {skill}
                                            {editMode.skills && (
                                                <button
                                                    onClick={() => removeSkill(idx)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">No skills added yet</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Academic Details */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-green-600" />
                                    <CardTitle>Education</CardTitle>
                                </div>
                            </div>
                            <CardDescription>Your educational qualifications</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {profile.education && profile.education.length > 0 ? (
                                <div className="space-y-4">
                                    {profile.education.map((edu, idx) => (
                                        <div key={idx} className="p-4 bg-muted/50 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium">
                                                        {edu.degree_name || edu.degree || 'Degree'}
                                                        {edu.degree_type && ` (${edu.degree_type})`}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {edu.institution || edu.field_of_study || 'Institution'}
                                                    </p>
                                                </div>
                                                {(edu.year_of_completion || edu.graduation_year) && (
                                                    <Badge variant="outline">
                                                        {edu.year_of_completion || edu.graduation_year}
                                                    </Badge>
                                                )}
                                            </div>
                                            {/* Grade Display */}
                                            {edu.grade_type === 'percentage' && edu.percentage && (
                                                <p className="text-sm text-green-600 mt-2">
                                                    Percentage: {edu.percentage}%
                                                </p>
                                            )}
                                            {edu.grade_type === 'cgpa' && edu.obtained_cgpa && (
                                                <p className="text-sm text-green-600 mt-2">
                                                    CGPA: {edu.obtained_cgpa} / {edu.max_cgpa || '10'}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No education details found. Complete your onboarding to add educational qualifications.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Career Preferences */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-purple-600" />
                                    <CardTitle>Career Preferences</CardTitle>
                                </div>
                                {!editMode.career ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditMode({ ...editMode, career: true })}
                                    >
                                        <Edit2 className="w-4 h-4 mr-1" /> Edit
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCancel('career')}
                                        >
                                            <X className="w-4 h-4 mr-1" /> Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleSave('career')}
                                            disabled={saving}
                                        >
                                            <Save className="w-4 h-4 mr-1" /> Save
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Preferred Job Roles</Label>
                                {editMode.career ? (
                                    <Input
                                        value={getRoles().join(', ')}
                                        onChange={(e) => updateCareerPreference('roles_targeted', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                        placeholder="Software Engineer, Data Analyst"
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-1">
                                        {getRoles().length > 0 ? (
                                            getRoles().map((role, idx) => (
                                                <Badge key={idx} variant="secondary">{role}</Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground">Not set</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Target LPA (in Lakhs)</Label>
                                <Input
                                    type="number"
                                    value={getTargetLpa()}
                                    onChange={(e) => updateCareerPreference('min_target_lpa', parseInt(e.target.value) || 0)}
                                    disabled={!editMode.career}
                                    placeholder="15"
                                    min="1"
                                    max="200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Preferred Locations</Label>
                                {editMode.career ? (
                                    <Input
                                        value={(profile.career_preferences?.preferred_locations || []).join(', ')}
                                        onChange={(e) => updateCareerPreference('preferred_locations', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                        placeholder="Bangalore, Remote"
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-1">
                                        {profile.career_preferences?.preferred_locations?.length ? (
                                            profile.career_preferences.preferred_locations.map((loc, idx) => (
                                                <Badge key={idx} variant="outline">{loc}</Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground">Not set</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label>Work Mode Preference</Label>
                                {editMode.career ? (
                                    <Input
                                        value={(profile.career_preferences?.work_preference || []).join(', ')}
                                        onChange={(e) => updateCareerPreference('work_preference', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                        placeholder="Remote, Hybrid, In-office"
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-1">
                                        {profile.career_preferences?.work_preference?.length ? (
                                            profile.career_preferences.work_preference.map((pref, idx) => (
                                                <Badge key={idx} variant="outline">{pref}</Badge>
                                            ))
                                        ) : (
                                            <span className="text-muted-foreground">Not set</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* API Keys */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Key className="w-5 h-5 text-orange-600" />
                                    <CardTitle>API Keys</CardTitle>
                                </div>
                                {!editMode.apiKeys ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setEditMode({ ...editMode, apiKeys: true })}
                                    >
                                        <Edit2 className="w-4 h-4 mr-1" /> Edit
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCancel('apiKeys')}
                                        >
                                            <X className="w-4 h-4 mr-1" /> Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleSave('apiKeys')}
                                            disabled={saving}
                                        >
                                            <Save className="w-4 h-4 mr-1" /> Save
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <CardDescription>Manage your API keys for AI and automation features</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Gemini AI Key</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="password"
                                        value={profile.api_keys?.gemini_ai_key || ''}
                                        onChange={(e) => updateApiKey('gemini_ai_key', e.target.value)}
                                        disabled={!editMode.apiKeys}
                                        placeholder={profile.api_keys?.gemini_ai_key ? '••••••••••••' : 'Not set'}
                                    />
                                    {profile.api_keys?.gemini_ai_key && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-700">Active</Badge>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>LinkedIn API Key (Optional)</Label>
                                <Input
                                    type="password"
                                    value={profile.api_keys?.linkedin_api_key || ''}
                                    onChange={(e) => updateApiKey('linkedin_api_key', e.target.value)}
                                    disabled={!editMode.apiKeys}
                                    placeholder={profile.api_keys?.linkedin_api_key ? '••••••••••••' : 'Not set'}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Naukri API Key (Optional)</Label>
                                <Input
                                    type="password"
                                    value={profile.api_keys?.naukri_api_key || ''}
                                    onChange={(e) => updateApiKey('naukri_api_key', e.target.value)}
                                    disabled={!editMode.apiKeys}
                                    placeholder={profile.api_keys?.naukri_api_key ? '••••••••••••' : 'Not set'}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Connected Accounts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Connected Accounts</CardTitle>
                            <CardDescription>Manage your connected accounts for project sync</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <GitHubConnectionStatus profile={profile} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
