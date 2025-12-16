// frontend/components/onboarding-form.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";

const steps = [
  { id: 1, title: 'Profile & Career Setup' },
  { id: 2, title: 'Career Questionnaire' },
  { id: 3, title: 'Connect your accounts' },
  { id: 4, title: 'Setup Account APIs' },
  { id: 5, title: 'Review & Finish' },
];

interface Education {
  degree: string;
  institution: string;
  grade: string;
}

interface FormData {
  fullName: string;
  dateOfBirth: string;
  secondaryEmail: string;
  address: string;
  profilePhoto: File | null;
  govtId: File | null;
  profilePhotoUrl: string;
  govtIdUrl: string;
  linkedinUrl: string;
  githubUsername: string;
  skills: string[];
  education: Education[];
  preferredRoles: string[];
  targetLpa: string;
  preferredLocations: string[];
  workPreference: string[];
  otherPreferences: string[];
  apiKeys: {
    geminiAiKey: string;
    linkedinApiKey: string;
    naukriApiKey: string;
    indeedApiKey: string;
    gmailApiKey: string;
  };
}

export function OnboardingForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    dateOfBirth: '',
    secondaryEmail: '',
    address: '',
    profilePhoto: null,
    govtId: null,
    profilePhotoUrl: '',
    govtIdUrl: '',
    linkedinUrl: '',
    githubUsername: '',
    skills: [],
    education: [],
    preferredRoles: [],
    targetLpa: '',
    preferredLocations: [],
    workPreference: [],
    otherPreferences: [],
    apiKeys: {
      geminiAiKey: '',
      linkedinApiKey: '',
      naukriApiKey: '',
      indeedApiKey: '',
      gmailApiKey: '',
    },
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePhoto' | 'govtId') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, [field]: file });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Upload files if they exist
      if (formData.profilePhoto) {
        const url = await uploadFile(formData.profilePhoto, 'profile-photos');
        if (url) formData.profilePhotoUrl = url;
      }

      if (formData.govtId) {
        const url = await uploadFile(formData.govtId, 'government-ids');
        if (url) formData.govtIdUrl = url;
      }

      // Prepare payload to match backend schema strictly
      const payload = {
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth, // "YYYY-MM-DD"
        secondary_email: formData.secondaryEmail || null,
        address: formData.address,
        profile_photo_url: formData.profilePhotoUrl || null,
        govt_id_url: formData.govtIdUrl || null,
        linkedin_url: formData.linkedinUrl || null,
        github_username: formData.githubUsername || null,
        skills: formData.skills, // Array of strings

        // Backend expects a single education object? Taking the first one if multiple.
        education: formData.education.length > 0 ? {
          degree: formData.education[0].degree,
          field: formData.education[0].institution // Mapping institution to field for now, or just sending institution if schema allows
        } : null,

        career_preferences: {
          roles_targeted: formData.preferredRoles, // Mapped from preferred_roles
          min_target_lpa: formData.targetLpa ? parseInt(formData.targetLpa) : null, // Mapped from target_lpa
          preferred_locations: formData.preferredLocations,
          // Extra fields like work_preference might be ignored by backend, but safe to send
          work_preference: formData.workPreference
        },

        api_keys: {
          gemini_ai_key: formData.apiKeys.geminiAiKey || null,
          linkedin_api_key: formData.apiKeys.linkedinApiKey || null,
          naukri_api_key: formData.apiKeys.naukriApiKey || null,
          indeed_api_key: formData.apiKeys.indeedApiKey || null,
          gmail_api_key: formData.apiKeys.gmailApiKey || null,
        },
        onboarding_completed: true
      };

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

      // Submit to backend
      // console.log("Submitting payload to teammate's microservice (placeholder):", payload);

      const { submitOnboardingData } = await import('@/lib/api-services');
      await submitOnboardingData(payload, session.access_token);

      // Redirect to dashboard
      router.push('/dashboard');

    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressValue = (currentStep / steps.length) * 100;

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}</CardTitle>
        </div>
        <Progress value={progressValue} />
      </CardHeader>
      <CardContent>
        {currentStep === 1 && <Step1 formData={formData} setFormData={setFormData} handleFileChange={handleFileChange} />}
        {currentStep === 2 && <Step2 formData={formData} setFormData={setFormData} />}
        {currentStep === 3 && <Step3 />}
        {currentStep === 4 && <Step4 formData={formData} setFormData={setFormData} />}
        {currentStep === 5 && <Step5 formData={formData} />}

        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          <div className="flex-grow" />
          {currentStep < steps.length ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Finish'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Step1({ formData, setFormData, handleFileChange }: any) {
  const [skillInput, setSkillInput] = useState('');

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, { degree: '', institution: '', grade: '' }]
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...formData.education];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, education: updated });
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData({ ...formData, skills: formData.skills.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Welcome to CareerAutomate</h2>
      <p className="text-muted-foreground">Let's get started by setting up your profile. This will help us tailor your job search experience.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g. Jane Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth *</Label>
          <Input
            id="dob"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondaryEmail">Secondary Email Address (Optional)</Label>
          <Input
            id="secondaryEmail"
            type="email"
            value={formData.secondaryEmail}
            onChange={(e) => setFormData({ ...formData, secondaryEmail: e.target.value })}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Main St, Anytown, USA"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Profile Photo</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={(e) => handleFileChange(e, 'profilePhoto')}
            />
            {formData.profilePhoto && <span className="text-sm text-green-600">✓ {formData.profilePhoto.name}</span>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Government Photo ID Proof *</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={(e) => handleFileChange(e, 'govtId')}
            />
            {formData.govtId && <span className="text-sm text-green-600">✓ {formData.govtId.name}</span>}
          </div>
          <p className="text-xs text-muted-foreground">Max 1MB, formats: JPEG, JPG, PNG, PDF</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
          <Input
            id="linkedin"
            value={formData.linkedinUrl}
            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="github">GitHub Username</Label>
          <Input
            id="github"
            value={formData.githubUsername}
            onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
            placeholder="yourusername"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Academic & Skill Details</h3>
        <div className="space-y-2">
          <Label>Skills *</Label>
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="e.g. Python, React, Data Analysis"
            />
            <Button type="button" onClick={addSkill}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.skills.map((skill: string, index: number) => (
              <span key={index} className="bg-primary/10 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                {skill}
                <button onClick={() => removeSkill(index)} className="text-red-500">×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {formData.education.map((edu: Education, index: number) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded">
              <Input
                placeholder="Degree (e.g. Bachelor of Technology)"
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
              />
              <Input
                placeholder="College/University"
                value={edu.institution}
                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
              />
              <Input
                placeholder="Percentage or CGPA"
                value={edu.grade}
                onChange={(e) => updateEducation(index, 'grade', e.target.value)}
              />
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addEducation} type="button">
            Add Education
          </Button>
        </div>
      </div>
    </div>
  );
}

function Step2({ formData, setFormData }: any) {
  const roles = ["Software Engineer", "Data Scientist", "Product Manager", "UX/UI Designer", "DevOps Engineer", "Cybersecurity", "Machine Learning", "Blockchain Dev", "Others"];

  const toggleRole = (role: string) => {
    setFormData({
      ...formData,
      preferredRoles: formData.preferredRoles.includes(role)
        ? formData.preferredRoles.filter((r: string) => r !== role)
        : [...formData.preferredRoles, role]
    });
  };

  const toggleWorkPref = (pref: string) => {
    setFormData({
      ...formData,
      workPreference: formData.workPreference.includes(pref)
        ? formData.workPreference.filter((p: string) => p !== pref)
        : [...formData.workPreference, pref]
    });
  };

  const toggleOtherPref = (pref: string) => {
    setFormData({
      ...formData,
      otherPreferences: formData.otherPreferences.includes(pref)
        ? formData.otherPreferences.filter((p: string) => p !== pref)
        : [...formData.otherPreferences, pref]
    });
  };

  const handleLocationChange = (value: string) => {
    const locations = value.split(',').map(l => l.trim()).filter(l => l);
    setFormData({ ...formData, preferredLocations: locations });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tell Us Your Career Goals</h2>
      <p className="text-muted-foreground">Help us understand your career preferences to find the best opportunities for you.</p>

      <div>
        <h3 className="text-lg font-semibold">Career Preferences</h3>
        <p className="text-sm text-muted-foreground">Preferred Job Roles and Fields</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {roles.map(role => (
            <div key={role} className="flex items-center space-x-2">
              <Checkbox
                id={role}
                checked={formData.preferredRoles.includes(role)}
                onCheckedChange={() => toggleRole(role)}
              />
              <Label htmlFor={role}>{role}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="lpa">Minimum Target LPA (in Lakhs)</Label>
          <Input
            id="lpa"
            value={formData.targetLpa}
            onChange={(e) => setFormData({ ...formData, targetLpa: e.target.value })}
            placeholder="e.g. 15"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="locations">Preferred Job Locations (comma separated)</Label>
          <Input
            id="locations"
            value={formData.preferredLocations.join(', ')}
            onChange={(e) => handleLocationChange(e.target.value)}
            placeholder="e.g., Bangalore, Hyderabad, Remote"
          />
        </div>
      </div>

      <div>
        <Label>Work Mode Preference</Label>
        <div className="flex items-center space-x-4 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-office"
              checked={formData.workPreference.includes('in-office')}
              onCheckedChange={() => toggleWorkPref('in-office')}
            />
            <Label htmlFor="in-office">In-office</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="work-from-home"
              checked={formData.workPreference.includes('work-from-home')}
              onCheckedChange={() => toggleWorkPref('work-from-home')}
            />
            <Label htmlFor="work-from-home">Work from home</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hybrid"
              checked={formData.workPreference.includes('hybrid')}
              onCheckedChange={() => toggleWorkPref('hybrid')}
            />
            <Label htmlFor="hybrid">Hybrid</Label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Other Preferences</h3>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox
            id="startups"
            checked={formData.otherPreferences.includes('startups')}
            onCheckedChange={() => toggleOtherPref('startups')}
          />
          <Label htmlFor="startups">Willing to work in startups</Label>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox
            id="relocation"
            checked={formData.otherPreferences.includes('relocation')}
            onCheckedChange={() => toggleOtherPref('relocation')}
          />
          <Label htmlFor="relocation">Open to relocation</Label>
        </div>
      </div>
    </div>
  );
}

function Step3() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Connect your accounts</h2>
      <p className="text-muted-foreground">Connecting your accounts allows us to showcase your projects and professional experience on your profile, enhancing your visibility to potential employers.</p>

      <Card>
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <p className="font-semibold">Connect GitHub Account *</p>
            <p className="text-sm text-muted-foreground">Showcase your projects and contributions.</p>
          </div>
          <Button disabled>Connect (Coming Soon)</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <p className="font-semibold">Connect a Job Platform Account</p>
            <p className="text-sm text-muted-foreground">Connect LinkedIn, Naukri, or Indeed. (Optional, but one is required)</p>
          </div>
          <Button disabled>Connect (Coming Soon)</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Step4({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Setup Account APIs</h2>
      <p className="text-muted-foreground">To automate your job search, we need access to your accounts. Please provide the necessary API keys.</p>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="gemini">Gemini AI Key *</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm"><Info className="w-4 h-4" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>How to get Gemini AI API Key</DialogTitle>
                  <DialogDescription>
                    <ol className="list-decimal list-inside space-y-2 mt-4">
                      <li>Go to <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-primary underline">Google AI Studio</a></li>
                      <li>Sign in with your Google account</li>
                      <li>Click on "Get API Key"</li>
                      <li>Create a new API key or use an existing one</li>
                      <li>Copy the key and paste it here</li>
                    </ol>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          <Input
            id="gemini"
            type="password"
            value={formData.apiKeys.geminiAiKey}
            onChange={(e) => setFormData({ ...formData, apiKeys: { ...formData.apiKeys, geminiAiKey: e.target.value } })}
            placeholder="Enter your Gemini AI Key"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="linkedin-api">LinkedIn API Key (Optional)</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm"><Info className="w-4 h-4" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>How to get LinkedIn API Key</DialogTitle>
                  <DialogDescription>
                    <ol className="list-decimal list-inside space-y-2 mt-4">
                      <li>Go to <a href="https://www.linkedin.com/developers/apps" target="_blank" className="text-primary underline">LinkedIn Developers</a></li>
                      <li>Create a new app</li>
                      <li>Navigate to the "Auth" tab</li>
                      <li>Copy your Client ID and Client Secret</li>
                      <li>Use them as your API credentials</li>
                    </ol>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          <Input
            id="linkedin-api"
            type="password"
            value={formData.apiKeys.linkedinApiKey}
            onChange={(e) => setFormData({ ...formData, apiKeys: { ...formData.apiKeys, linkedinApiKey: e.target.value } })}
            placeholder="Enter your LinkedIn API Key"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="naukri-api">Naukri API Key (Optional)</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm"><Info className="w-4 h-4" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>How to get Naukri API Key</DialogTitle>
                  <DialogDescription>
                    <p className="mt-4">Naukri does not provide public APIs. Contact their business team for API access.</p>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          <Input
            id="naukri-api"
            type="password"
            value={formData.apiKeys.naukriApiKey}
            onChange={(e) => setFormData({ ...formData, apiKeys: { ...formData.apiKeys, naukriApiKey: e.target.value } })}
            placeholder="Enter your Naukri API Key"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="indeed-api">Indeed API Key (Optional)</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm"><Info className="w-4 h-4" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>How to get Indeed API Key</DialogTitle>
                  <DialogDescription>
                    <ol className="list-decimal list-inside space-y-2 mt-4">
                      <li>Go to <a href="https://www.indeed.com/publisher" target="_blank" className="text-primary underline">Indeed Publisher Portal</a></li>
                      <li>Sign up or log in</li>
                      <li>Register your application</li>
                      <li>Get your Publisher ID (API key)</li>
                    </ol>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          <Input
            id="indeed-api"
            type="password"
            value={formData.apiKeys.indeedApiKey}
            onChange={(e) => setFormData({ ...formData, apiKeys: { ...formData.apiKeys, indeedApiKey: e.target.value } })}
            placeholder="Enter your Indeed API Key"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="gmail-api">Gmail API Key (Optional)</Label>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm"><Info className="w-4 h-4" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>How to get Gmail API Credentials</DialogTitle>
                  <DialogDescription>
                    <ol className="list-decimal list-inside space-y-2 mt-4">
                      <li>Go to <a href="https://console.cloud.google.com/" target="_blank" className="text-primary underline">Google Cloud Console</a></li>
                      <li>Create a new project or select existing</li>
                      <li>Enable Gmail API</li>
                      <li>Create credentials (OAuth 2.0 Client ID)</li>
                      <li>Download the credentials JSON file</li>
                    </ol>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          <Input
            id="gmail-api"
            type="password"
            value={formData.apiKeys.gmailApiKey}
            onChange={(e) => setFormData({ ...formData, apiKeys: { ...formData.apiKeys, gmailApiKey: e.target.value } })}
            placeholder="Enter your Gmail API Key"
          />
        </div>
      </div>
    </div>
  );
}

function Step5({ formData }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review & Finish</h2>
      <p className="text-muted-foreground">Please review your information below before completing the onboarding process.</p>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Name:</strong> {formData.fullName || 'Not provided'}</p>
            <p><strong>Date of Birth:</strong> {formData.dateOfBirth || 'Not provided'}</p>
            <p><strong>Email:</strong> {formData.secondaryEmail || 'Not provided'}</p>
            <p><strong>Address:</strong> {formData.address || 'Not provided'}</p>
            <p><strong>LinkedIn:</strong> {formData.linkedinUrl || 'Not provided'}</p>
            <p><strong>GitHub:</strong> {formData.githubUsername || 'Not provided'}</p>
            <p><strong>Profile Photo:</strong> {formData.profilePhoto ? formData.profilePhoto.name : 'Not uploaded'}</p>
            <p><strong>Govt ID:</strong> {formData.govtId ? formData.govtId.name : 'Not uploaded'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skills & Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Skills:</strong> {formData.skills.join(', ') || 'None'}</p>
            <div>
              <strong>Education:</strong>
              {formData.education.length > 0 ? (
                <ul className="list-disc list-inside ml-4 mt-1">
                  {formData.education.map((edu: Education, index: number) => (
                    <li key={index}>{edu.degree} from {edu.institution} ({edu.grade})</li>
                  ))}
                </ul>
              ) : (
                <p className="ml-4">None added</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Career Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Preferred Roles:</strong> {formData.preferredRoles.join(', ') || 'None'}</p>
            <p><strong>Target LPA:</strong> {formData.targetLpa ? `${formData.targetLpa} Lakhs` : 'Not specified'}</p>
            <p><strong>Preferred Locations:</strong> {formData.preferredLocations.join(', ') || 'None'}</p>
            <p><strong>Work Preference:</strong> {formData.workPreference.join(', ') || 'None'}</p>
            <p><strong>Other Preferences:</strong> {formData.otherPreferences.join(', ') || 'None'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Keys Configured</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Gemini AI:</strong> {formData.apiKeys.geminiAiKey ? '✓ Configured' : '✗ Not configured'}</p>
            <p><strong>LinkedIn:</strong> {formData.apiKeys.linkedinApiKey ? '✓ Configured' : '✗ Not configured'}</p>
            <p><strong>Naukri:</strong> {formData.apiKeys.naukriApiKey ? '✓ Configured' : '✗ Not configured'}</p>
            <p><strong>Indeed:</strong> {formData.apiKeys.indeedApiKey ? '✓ Configured' : '✗ Not configured'}</p>
            <p><strong>Gmail:</strong> {formData.apiKeys.gmailApiKey ? '✓ Configured' : '✗ Not configured'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
