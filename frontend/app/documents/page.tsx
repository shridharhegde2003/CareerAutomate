// frontend/app/documents/page.tsx
"use client";

// frontend/app/documents/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DashboardNav } from "@/components/dashboard-nav";
import { DashboardHeader } from "@/components/dashboard-header";
import { supabase } from "@/lib/supabase";
import { Edit, Download, Trash2, Upload, FileText } from "lucide-react";

// TODO: Import AI service functions when AI-Service microservice is implemented
// import { generateAIResume, tailorResume } from "@/lib/api-services";

interface Document {
    id: string;
    title: string;
    role: string | null;
    updated_at: string;
    auto_tailor: boolean;
}

interface CertificateDocument {
    id: string;
    document_name: string;
    document_type: string;
    file_url: string;
    file_name: string;
    file_size: number | null;
    created_at: string;
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

export default function DocumentsPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [certificates, setCertificates] = useState<CertificateDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<CertificateDocument | null>(null);
    const [newFileName, setNewFileName] = useState('');

    useEffect(() => {
        fetchDocuments();
        fetchCertificates();
    }, []);

    const fetchDocuments = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

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
        } finally {
            setLoading(false);
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('certificates-documents')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('certificates-documents')
                .getPublicUrl(fileName);

            // Save to database
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

            // Delete from storage
            const filePath = doc.file_url.split('/').slice(-2).join('/');
            await supabase.storage
                .from('certificates-documents')
                .remove([filePath]);

            // Delete from database
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

    const handleDownload = (doc: CertificateDocument) => {
        window.open(doc.file_url, '_blank');
    };

    const toggleAutoTailor = async (docId: string, value: boolean) => {
        try {
            await supabase
                .from('documents')
                .update({ auto_tailor: value })
                .eq('id', docId);

            // TODO: When AI-Service is implemented, trigger resume tailoring
            // if (value) {
            //   const { data: { user } } = await supabase.auth.getUser();
            //   await tailorResume({
            //     resumeId: docId,
            //     jobDescription: "[Get from job posting]"
            //   });
            // }

            setDocuments(documents.map(doc =>
                doc.id === docId ? { ...doc, auto_tailor: value } : doc
            ));
        } catch (error) {
            console.error('Error updating auto-tailor:', error);
        }
    };

    // TODO: Implement AI Resume Generation
    // This will call AI-Service microservice to generate resume using LLM
    const handleCreateResume = async (targetRole: string) => {
        // TODO: Uncomment when AI-Service (port 8001) is ready
        /*
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch user profile data for resume generation
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            // Call AI-Service to generate resume
            const result = await generateAIResume({
                userId: user.id,
                targetRole: targetRole,
                userProfile: profile
            });

            // Save generated resume to database
            if (result.success) {
                await supabase.from('documents').insert({
                    user_id: user.id,
                    document_type: 'resume',
                    title: `${targetRole} Resume`,
                    role: targetRole,
                    file_url: result.resume_url
                });
                await fetchDocuments();
            }
        } catch (error) {
            console.error('Error generating resume:', error);
        }
        */
        alert('AI Resume Generation will be available when AI-Service microservice is implemented');
    };

    const getRoleBadge = (role: string | null) => {
        if (!role || role === 'General') return null;

        const colors: Record<string, string> = {
            'Data Analyst': 'bg-blue-100 text-blue-700',
            'Software Engineer': 'bg-green-100 text-green-700',
            'Product Manager': 'bg-purple-100 text-purple-700',
        };

        return (
            <Badge className={colors[role] || 'bg-gray-100 text-gray-700'}>
                {role}
            </Badge>
        );
    };

    const formatFileSize = (bytes: number | null) => {
        if (!bytes) return 'Unknown';
        const mb = bytes / 1048576;
        return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
    };

    return (
        <div className="flex h-screen bg-background">
            <DashboardNav />

            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader />

                <div className="flex-1 overflow-auto">
                    <div className="p-8">
                        <h1 className="text-3xl font-bold mb-8">Documents</h1>

                        <Tabs defaultValue="ai-resume" className="w-full">
                            <TabsList>
                                <TabsTrigger value="ai-resume">AI Resume Builder</TabsTrigger>
                                <TabsTrigger value="certificates">Certificates & Documents</TabsTrigger>
                            </TabsList>

                            <TabsContent value="ai-resume" className="mt-6">
                                <p className="text-sm text-muted-foreground mb-6">
                                    You have {documents.length} resume(s) left out of 10
                                </p>

                                <div className="space-y-4">
                                    {loading ? (
                                        <div>Loading...</div>
                                    ) : documents.length === 0 ? (
                                        <Card>
                                            <CardContent className="pt-6">
                                                <p className="text-center text-muted-foreground py-8">
                                                    No resumes yet. Create your first AI-generated resume!
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        documents.map((doc) => (
                                            <Card key={doc.id}>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {getRoleBadge(doc.role)}
                                                            </div>
                                                            <h3 className="font-semibold text-lg">{doc.title}</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                Last updated: {new Date(doc.updated_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <Button variant="ghost" size="sm" className="gap-2">
                                                                <Edit className="w-4 h-4" />
                                                                Edit
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="gap-2">
                                                                <Download className="w-4 h-4" />
                                                                Download PDF
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}

                                    <Card className="mt-6">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-semibold mb-1">Auto-Tailor for Next Job Search</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Automatically tailor your resume for each job application.
                                                    </p>
                                                </div>
                                                <Switch defaultChecked={false} />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {documents.length < 10 && (
                                        <div className="mt-6 p-8 border-2 border-dashed rounded-lg text-center">
                                            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                            <p className="text-muted-foreground mb-4">Create a new AI-powered resume</p>
                                            <Button onClick={() => handleCreateResume('Software Engineer')}>
                                                Create New Resume
                                            </Button>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {/* TODO: AI-Service integration pending */}
                                                Powered by AI (Coming Soon)
                                            </p>
                                        </div>
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
                                                            </div>
                                                            <h3 className="font-semibold">{doc.document_name}</h3>
                                                            <p className="text-sm text-muted-foreground">
                                                                {doc.file_name} • {formatFileSize(doc.file_size)} • Uploaded {new Date(doc.created_at).toLocaleDateString()}
                                                            </p>
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
                                                                onClick={() => handleDownload(doc)}
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
                </div>
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
        </div>
    );
}
