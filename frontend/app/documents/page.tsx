// frontend/app/documents/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DashboardLayout } from "@/components/dashboard-layout";
import { DashboardHeader } from "@/components/dashboard-header";
import { supabase } from "@/lib/supabase";
import { Edit, Download, Trash2, Upload, FileText, Sparkles, Loader2, Eye, CheckCircle2, X, ExternalLink } from "lucide-react";

const RESUME_SERVICE_URL = process.env.NEXT_PUBLIC_RESUME_SERVICE_URL || '';

interface ResumeDocument {
    id: string;
    title: string;
    role: string | null;
    template_id: string | null;
    file_url: string | null;
    updated_at: string;
    created_at: string;
}

interface CertificateDocument {
    id: string;
    document_name: string;
    document_type: string;
    file_url: string;
    file_name: string;
    file_size: number | null;
    created_at: string;
    verification_status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string | null;
}

interface ResumeTemplate {
    id: string;
    name: string;
    has_photo: boolean;
    description: string;
}

interface UserProfile {
    career_preferences?: {
        roles_targeted?: string[];
    };
}

const DOC_TYPES = [
    '10th Mark Sheet',
    '12th Mark Sheet',
    'Undergraduate Degree',
    'Postgraduate Degree',
    'Diploma Certificate',
    'Online Course Certificate',
    'Professional Certificate',
    'Other',
];

// Only show modern and classic templates (exclude creative)
const ALLOWED_TEMPLATES = ['modern', 'classic'];

export default function DocumentsPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<ResumeDocument[]>([]);
    const [certificates, setCertificates] = useState<CertificateDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<CertificateDocument | null>(null);
    const [newFileName, setNewFileName] = useState('');

    // Resume generation states
    const [generating, setGenerating] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('modern');
    const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [generationSuccess, setGenerationSuccess] = useState<{ url: string; docId: string } | null>(null);

    // PDF Viewer states
    const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
    const [viewingResume, setViewingResume] = useState<ResumeDocument | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Fetch user profile to get targeted roles
            const { data: profile } = await supabase
                .from('profiles')
                .select('career_preferences')
                .eq('id', user.id)
                .single();

            if (profile?.career_preferences?.roles_targeted) {
                setUserRoles(profile.career_preferences.roles_targeted);
                if (profile.career_preferences.roles_targeted.length > 0) {
                    setSelectedRole(profile.career_preferences.roles_targeted[0]);
                }
            }

            // Fetch resumes
            await fetchDocuments();
            await fetchCertificates();

            // Fetch resume options from API
            await fetchResumeOptions(user);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchResumeOptions = async (user: any) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || !RESUME_SERVICE_URL) return;

            const response = await fetch(`${RESUME_SERVICE_URL}/v1/resumes/options`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Filter to only allowed templates (modern and classic)
                const filteredTemplates = (data.templates || []).filter(
                    (t: ResumeTemplate) => ALLOWED_TEMPLATES.includes(t.id)
                );
                setTemplates(filteredTemplates);

                // If user has no roles from profile, use genres from API
                if (userRoles.length === 0 && data.genres?.length > 0) {
                    setUserRoles(data.genres);
                    setSelectedRole(data.genres[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching resume options:', error);
        }
    };

    const fetchDocuments = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('user_id', user.id)
                .eq('document_type', 'resume')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setDocuments(data || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const fetchCertificates = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('certificate_documents')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCertificates(data || []);
        } catch (error) {
            console.error('Error fetching certificates:', error);
        }
    };

    const handleGenerateResume = async () => {
        if (!selectedRole || !selectedTemplate) {
            alert('Please select a role and template');
            return;
        }

        setGenerating(true);
        setGenerationSuccess(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
                return;
            }

            const response = await fetch(`${RESUME_SERVICE_URL}/v1/resumes/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    genre: selectedRole,
                    template_id: selectedTemplate
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || data.message || 'Failed to generate resume');
            }

            // Success!
            setGenerationSuccess({
                url: data.pdf_url,
                docId: data.document_id
            });

            // Refresh documents list
            await fetchDocuments();

        } catch (error: any) {
            console.error('Error generating resume:', error);
            alert(error.message || 'Failed to generate resume. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('certificates-documents')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('certificates-documents')
                .getPublicUrl(fileName);

            const { error: dbError } = await supabase
                .from('certificate_documents')
                .insert({
                    user_id: user.id,
                    document_name: file.name.replace(/\.[^/.]+$/, ''),
                    document_type: docType,
                    file_url: urlData.publicUrl,
                    file_name: file.name,
                    file_size: file.size,
                    file_type: file.type,
                });

            if (dbError) throw dbError;

            await fetchCertificates();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error uploading file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (doc: CertificateDocument) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const filePath = doc.file_url.split('/').slice(-2).join('/');
            await supabase.storage
                .from('certificates-documents')
                .remove([filePath]);

            await supabase
                .from('certificate_documents')
                .delete()
                .eq('id', doc.id);

            await fetchCertificates();
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Error deleting document. Please try again.');
        }
    };

    const handleDeleteResume = async (doc: ResumeDocument) => {
        if (!confirm('Are you sure you want to delete this resume?')) return;

        try {
            await supabase
                .from('documents')
                .delete()
                .eq('id', doc.id);

            await fetchDocuments();
        } catch (error) {
            console.error('Error deleting resume:', error);
            alert('Error deleting resume. Please try again.');
        }
    };

    const handleRename = async () => {
        if (!selectedDoc || !newFileName.trim()) return;

        try {
            await supabase
                .from('certificate_documents')
                .update({ document_name: newFileName.trim() })
                .eq('id', selectedDoc.id);

            await fetchCertificates();
            setRenameDialogOpen(false);
            setSelectedDoc(null);
            setNewFileName('');
        } catch (error) {
            console.error('Error renaming document:', error);
            alert('Error renaming document. Please try again.');
        }
    };

    const handleDownload = (url: string) => {
        window.open(url, '_blank');
    };

    const getRoleBadge = (role: string | null) => {
        if (!role || role === 'General') return null;

        const colors: Record<string, string> = {
            'Data Analyst': 'bg-blue-100 text-blue-700',
            'Software Engineer': 'bg-green-100 text-green-700',
            'Full Stack Developer': 'bg-emerald-100 text-emerald-700',
            'Backend Developer': 'bg-teal-100 text-teal-700',
            'Frontend Developer': 'bg-cyan-100 text-cyan-700',
            'Product Manager': 'bg-purple-100 text-purple-700',
            'Data Scientist': 'bg-indigo-100 text-indigo-700',
        };

        return (
            <Badge className={colors[role] || 'bg-gray-100 text-gray-700'}>
                {role}
            </Badge>
        );
    };

    const getTemplateBadge = (templateId: string | null) => {
        if (!templateId) return null;
        const names: Record<string, string> = {
            'modern': 'Modern Minimal',
            'classic': 'Classic Corporate'
        };
        return (
            <Badge variant="outline" className="text-xs">
                {names[templateId] || templateId}
            </Badge>
        );
    };

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return 'Unknown';
        const mb = bytes / 1048576;
        return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
    };

    const getVerificationBadge = (status: 'pending' | 'approved' | 'rejected') => {
        switch (status) {
            case 'approved':
                return (
                    <Badge className="bg-green-100 text-green-700 gap-1">
                        <span>✓</span> Verified
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-red-100 text-red-700 gap-1">
                        <span>✗</span> Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-yellow-100 text-yellow-700 gap-1">
                        <span>⏳</span> Pending
                    </Badge>
                );
        }
    };

    return (
        <DashboardLayout>
            <DashboardHeader title="Documents" subtitle="Manage your resumes and certificates" />

            <div className="p-8">
                <h1 className="text-3xl font-bold mb-8">Documents</h1>

                <Tabs defaultValue="ai-resume" className="w-full">
                    <TabsList>
                        <TabsTrigger value="ai-resume">AI Resume Builder</TabsTrigger>
                        <TabsTrigger value="certificates">Certificates & Documents</TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai-resume" className="mt-6">
                        {/* Resume Generation Card */}
                        <Card className="mb-6 border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-100 rounded-xl">
                                        <Sparkles className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                            Generate AI-Powered Resume
                                        </h3>
                                        <p className="text-sm text-slate-600 mb-4">
                                            Create a professional resume tailored to your target role using AI.
                                            Your profile, skills, and projects will be automatically included.
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <Label className="text-xs text-slate-500 mb-1 block">Target Role</Label>
                                                <Select value={selectedRole} onValueChange={setSelectedRole}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select role" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {userRoles.map((role) => (
                                                            <SelectItem key={role} value={role}>
                                                                {role}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-slate-500 mb-1 block">Template</Label>
                                                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select template" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {templates.map((template) => (
                                                            <SelectItem key={template.id} value={template.id}>
                                                                {template.name}
                                                            </SelectItem>
                                                        ))}
                                                        {templates.length === 0 && (
                                                            <>
                                                                <SelectItem value="modern">Modern Minimal</SelectItem>
                                                                <SelectItem value="classic">Classic Corporate</SelectItem>
                                                            </>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex items-end">
                                                <Button
                                                    onClick={handleGenerateResume}
                                                    disabled={generating || !selectedRole || !RESUME_SERVICE_URL}
                                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                                >
                                                    {generating ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Generating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="w-4 h-4 mr-2" />
                                                            Generate Resume
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        {!RESUME_SERVICE_URL && (
                                            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded">
                                                Resume service not configured. Please set NEXT_PUBLIC_RESUME_SERVICE_URL.
                                            </p>
                                        )}

                                        {generationSuccess && (
                                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                    <span className="text-green-800 font-medium">Resume generated successfully!</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            // Find the newly generated resume and open viewer
                                                            const newResume = documents.find(d => d.id === generationSuccess.docId);
                                                            if (newResume) {
                                                                setViewingResume(newResume);
                                                                setPdfViewerOpen(true);
                                                            } else {
                                                                // Fallback: open in new tab
                                                                window.open(generationSuccess.url, '_blank');
                                                            }
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        View PDF
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleDownload(generationSuccess.url)}
                                                    >
                                                        <Download className="w-4 h-4 mr-1" />
                                                        Download
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Existing Resumes */}
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-slate-800">Your Resumes</h3>
                            <p className="text-sm text-muted-foreground">
                                {documents.length} resume{documents.length !== 1 ? 's' : ''} generated
                            </p>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                            <span className="ml-2 text-muted-foreground">Loading resumes...</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : documents.length === 0 ? (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center py-12">
                                            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                            <p className="text-muted-foreground">
                                                No resumes yet. Generate your first AI-powered resume above!
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                documents.map((doc) => (
                                    <Card key={doc.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {getRoleBadge(doc.role)}
                                                        {getTemplateBadge(doc.template_id)}
                                                    </div>
                                                    <h3 className="font-semibold text-lg text-slate-900">{doc.title}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Created: {new Date(doc.created_at).toLocaleDateString()} • Updated: {new Date(doc.updated_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {doc.file_url && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setViewingResume(doc);
                                                                    setPdfViewerOpen(true);
                                                                }}
                                                            >
                                                                <Eye className="w-4 h-4 mr-1" />
                                                                View
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDownload(doc.file_url!)}
                                                            >
                                                                <Download className="w-4 h-4 mr-1" />
                                                                Download
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteResume(doc)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="certificates" className="mt-6">
                        {/* Upload Section */}
                        <Card className="mb-6">
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="doc-type">Document Type</Label>
                                        <Select>
                                            <SelectTrigger id="doc-type">
                                                <SelectValue placeholder="Select document type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DOC_TYPES.map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="file-upload">Upload Document</Label>
                                        <div className="flex gap-2 mt-2">
                                            <Input
                                                id="file-upload"
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => {
                                                    const select = document.getElementById('doc-type') as HTMLSelectElement;
                                                    const docType = select?.value || 'Other';
                                                    handleFileUpload(e, docType);
                                                }}
                                                disabled={uploading}
                                            />
                                            <Button disabled={uploading}>
                                                <Upload className="w-4 h-4 mr-2" />
                                                {uploading ? 'Uploading...' : 'Upload'}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Allowed formats: PDF, JPG, PNG | Max size: 5MB
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Documents List */}
                        <div className="space-y-4">
                            {certificates.length === 0 ? (
                                <Card>
                                    <CardContent className="pt-6">
                                        <p className="text-center text-muted-foreground py-8">
                                            No documents uploaded yet. Upload your certificates and academic documents above.
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                certificates.map((doc) => (
                                    <Card key={doc.id}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline">{doc.document_type}</Badge>
                                                        {getVerificationBadge(doc.verification_status || 'pending')}
                                                    </div>
                                                    <h3 className="font-semibold">{doc.document_name}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {doc.file_name} • {formatFileSize(doc.file_size)} • Uploaded {new Date(doc.created_at).toLocaleDateString()}
                                                    </p>
                                                    {doc.verification_status === 'rejected' && doc.rejection_reason && (
                                                        <p className="text-sm text-red-600 mt-1">
                                                            Reason: {doc.rejection_reason}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedDoc(doc);
                                                            setNewFileName(doc.document_name);
                                                            setRenameDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDownload(doc.file_url)}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(doc)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Rename Dialog */}
            <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Document</DialogTitle>
                        <DialogDescription>
                            Enter a new name for this document
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            placeholder="Document name"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleRename}>Rename</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* PDF Viewer Dialog */}
            <Dialog open={pdfViewerOpen} onOpenChange={setPdfViewerOpen}>
                <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden">
                    <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
                            <div className="flex items-center gap-3">
                                <FileText className="w-6 h-6 text-blue-600" />
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        {viewingResume?.title || 'Resume Preview'}
                                    </h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        {viewingResume?.role && (
                                            <Badge className="text-xs bg-blue-100 text-blue-700">
                                                {viewingResume.role}
                                            </Badge>
                                        )}
                                        {viewingResume?.template_id && (
                                            <Badge variant="outline" className="text-xs">
                                                {viewingResume.template_id === 'modern' ? 'Modern Minimal' : 'Classic Corporate'}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => viewingResume?.file_url && window.open(viewingResume.file_url, '_blank')}
                                >
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Open in New Tab
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => viewingResume?.file_url && handleDownload(viewingResume.file_url)}
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
                        <div className="flex-1 bg-gray-100">
                            {viewingResume?.file_url ? (
                                <iframe
                                    src={`${viewingResume.file_url}#toolbar=0&navpanes=0&scrollbar=1`}
                                    className="w-full h-full border-0"
                                    title="Resume PDF Preview"
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
