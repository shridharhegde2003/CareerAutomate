// frontend/app/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardHeader } from "@/components/dashboard-header";
import { supabase } from "@/lib/supabase";
import { Edit2, Trash2 } from "lucide-react";

interface UserProfile {
    full_name: string;
    dob: string | null;
    secondary_email: string | null;
    phone_number: string | null;
    address: string | null;
    linkedin_url: string | null;
    github_username: string | null;
    skills: string[];
    education: any[];
    career_preferences: any;
    api_keys: any;
}

export default function SettingsPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile>({
        full_name: '',
        dob: null,
        secondary_email: null,
        phone_number: null,
        address: null,
        linkedin_url: null,
        github_username: null,
        skills: [],
        education: [],
        career_preferences: null,
        api_keys: null,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState({
        personal: false,
        academic: false,
        career: false,
        apiKeys: false,
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            setProfile({
                full_name: data.full_name || '',
                dob: data.dob,
                secondary_email: data.secondary_email,
                phone_number: data.phone_number,
                address: data.address,
                linkedin_url: data.linkedin_url,
                github_username: data.github_username,
                skills: data.skills || [],
                education: data.education || [],
                career_preferences: data.career_preferences || {},
                api_keys: data.api_keys || {},
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (section: string) => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .update(profile)
                .eq('id', user.id);

            if (error) throw error;

            setEditMode({ ...editMode, [section]: false });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Error saving profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-lg font-medium">Loading profile...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <DashboardNav />

            <div className="ml-64">
                <DashboardHeader title="Profile" subtitle="Manage your account settings and preferences" />

                <div className="p-6">
                    <div className="space-y-6 max-w-4xl">

                        <div className="space-y-6 max-w-4xl">
                            {/* Personal Details */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Personal Details</CardTitle>
                                        {!editMode.personal ? (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => setEditMode({ ...editMode, personal: true })}
                                            >
                                                Edit
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditMode({ ...editMode, personal: false });
                                                        fetchProfile();
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSave('personal')}
                                                    disabled={saving}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Full Name (Cannot be edited)</Label>
                                        <Input value={profile.full_name} disabled />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email Address</Label>
                                        <Input
                                            value={profile.secondary_email || ''}
                                            onChange={(e) => setProfile({ ...profile, secondary_email: e.target.value })}
                                            disabled={!editMode.personal}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Date of Birth (dd/mm/yyyy)</Label>
                                        <Input
                                            value={profile.dob || ''}
                                            onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                                            disabled={!editMode.personal}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone Number</Label>
                                        <Input
                                            value={profile.phone_number || ''}
                                            onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                                            disabled={!editMode.personal}
                                            placeholder="+1234567890"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Mailing Address</Label>
                                        <Input
                                            value={profile.address || ''}
                                            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                            disabled={!editMode.personal}
                                            placeholder="San Francisco, CA"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Academic Details */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Academic Details</CardTitle>
                                        {!editMode.academic ? (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => setEditMode({ ...editMode, academic: true })}
                                            >
                                                Edit
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditMode({ ...editMode, academic: false });
                                                        fetchProfile();
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSave('academic')}
                                                    disabled={saving}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {profile.education && profile.education.length > 0 ? (
                                        <div className="space-y-4">
                                            {profile.education.map((edu: any, idx: number) => (
                                                <div key={idx} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                                                    <div className="space-y-2">
                                                        <Label>University</Label>
                                                        <Input value={edu.institution || ''} disabled={!editMode.academic} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Degree</Label>
                                                        <Input value={edu.degree || ''} disabled={!editMode.academic} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Specialization</Label>
                                                        <Input value={edu.field_of_study || ''} disabled={!editMode.academic} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Year of Graduation</Label>
                                                        <Input value={edu.graduation_year || ''} disabled={!editMode.academic} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">No education details found</p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Career Preferences */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Career Preferences</CardTitle>
                                        {!editMode.career ? (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => setEditMode({ ...editMode, career: true })}
                                            >
                                                Edit
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditMode({ ...editMode, career: false });
                                                        fetchProfile();
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSave('career')}
                                                    disabled={saving}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Job Titles</Label>
                                        <Input
                                            value={profile.career_preferences?.preferred_roles?.join(', ') || ''}
                                            disabled={!editMode.career}
                                            placeholder="Software Engineer, Data Analyst"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Job Type</Label>
                                        <Input
                                            value={profile.career_preferences?.work_preference || ''}
                                            disabled={!editMode.career}
                                            placeholder="Full-time"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Desired Salary</Label>
                                        <Input
                                            value={profile.career_preferences?.target_lpa || ''}
                                            disabled={!editMode.career}
                                            placeholder="$100,000 - $150,000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Work Location</Label>
                                        <Input
                                            value={profile.career_preferences?.preferred_locations?.join(', ') || ''}
                                            disabled={!editMode.career}
                                            placeholder="Remote, San Francisco Area"
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <Label>Preferred Industry</Label>
                                        <Textarea
                                            value={profile.career_preferences?.other_preferences || ''}
                                            disabled={!editMode.career}
                                            placeholder="Technology, Healthcare, Finance"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* API Keys */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>API Keys</CardTitle>
                                        {!editMode.apiKeys ? (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => setEditMode({ ...editMode, apiKeys: true })}
                                            >
                                                Edit Connect
                                            </Button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditMode({ ...editMode, apiKeys: false });
                                                        fetchProfile();
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSave('apiKeys')}
                                                    disabled={saving}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>GitHub API Key</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="password"
                                                value={profile.api_keys?.github || ''}
                                                disabled={!editMode.apiKeys}
                                                placeholder="ghp_...****************"
                                            />
                                            <Button variant="ghost" size="sm">
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="text-red-600">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Social Account Connections */}
                            <Card className="border-0 shadow-sm">
                                <CardHeader>
                                    <CardTitle>Social Account Connections</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-black rounded flex items-center justify-center text-white font-bold">
                                                G
                                            </div>
                                            <div>
                                                <p className="font-semibold">GitHub</p>
                                                <p className="text-sm text-muted-foreground">{profile.github_username || 'Not connected'}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline">Reconnect</Button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
                                                in
                                            </div>
                                            <div>
                                                <p className="font-semibold">LinkedIn</p>
                                                <p className="text-sm text-muted-foreground">{profile.linkedin_url ? 'Connected' : 'Not connected'}</p>
                                            </div>
                                        </div>
                                        <Button>Connect</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
