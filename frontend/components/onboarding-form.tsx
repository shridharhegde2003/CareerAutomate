// frontend/components/onboarding-form.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

const steps = [
  { id: 1, title: 'Profile & Career Setup' },
  { id: 2, title: 'Career Questionnaire' },
  { id: 3, title: 'Connect your accounts' },
  { id: 4, title: 'Setup Account APIs' },
];

export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);

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
        {currentStep === 1 && <Step1 />}
        {currentStep === 2 && <Step2 />}
        {currentStep === 3 && <Step3 />}
        {currentStep === 4 && <Step4 />}
        
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
            <Button>
              Finish
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Step1() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Welcome to CareerAutomate</h2>
      <p className="text-muted-foreground">Let's get started by setting up your profile. This will help us tailor your job search experience.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" placeholder="e.g. Jane Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Input id="dob" type="date" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondaryEmail">Secondary Email Address (Optional)</Label>
          <Input id="secondaryEmail" type="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" placeholder="123 Main St, Anytown, USA" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Government Photo ID Proof</Label>
        <div className="flex items-center justify-center w-full">
          <Label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
            </div>
            <Input id="dropzone-file" type="file" className="hidden" />
          </Label>
        </div> 
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
          <Input id="linkedin" placeholder="https://linkedin.com/in/yourprofile" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="github">GitHub Username</Label>
          <Input id="github" placeholder="yourusername" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Academic & Skill Details</h3>
        <div className="space-y-2">
          <Label htmlFor="skills">Skills</Label>
          <Input id="skills" placeholder="e.g. Python, React, Data Analysis" />
        </div>
        {/* Education fields would be dynamically added here */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-2">
            <Label>Education 1</Label>
            <Input placeholder="Degree (e.g. Bachelor of Technology)" />
            <Input placeholder="College/University" />
            <Input placeholder="Percentage or CGPA" />
          </div>
        </div>
        <Button variant="outline" size="sm" className="mt-4">Add Education</Button>
      </div>
    </div>
  );
}

function Step2() {
  const roles = ["Software Engineer", "Data Scientist", "Product Manager", "UX/UI Designer", "DevOps Engineer", "Cybersecurity", "Machine Learning", "Blockchain Dev", "Others"];
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
              <Checkbox id={role} />
              <Label htmlFor={role}>{role}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="lpa">Minimum Target LPA (in Lakhs)</Label>
          <Input id="lpa" placeholder="e.g. 15" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="locations">Preferred Job Locations</Label>
          <Input id="locations" placeholder="e.g., Bangalore, Hyderabad, Remote" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Checkbox id="in-office" />
        <Label htmlFor="in-office">In-office</Label>
        <Checkbox id="work-from-home" />
        <Label htmlFor="work-from-home">Work from home</Label>
        <Checkbox id="hybrid" />
        <Label htmlFor="hybrid">Hybrid</Label>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Other Preferences</h3>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox id="startups" />
          <Label htmlFor="startups">Willing to work in startups</Label>
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox id="relocation" />
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
          <Button>Connect</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 flex items-center justify-between">
          <div>
            <p className="font-semibold">Connect a Job Platform Account</p>
            <p className="text-sm text-muted-foreground">Connect LinkedIn, Naukri, or Indeed. (Optional, but one is required)</p>
          </div>
          <Button>Connect</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Step4() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Setup Account APIs</h2>
      <p className="text-muted-foreground">To automate your job search, we need access to your accounts. Please provide the necessary API keys.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="gemini">Gemini AI Key *</Label>
          <Input id="gemini" placeholder="Enter your Gemini AI Key" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedin-api">LinkedIn API Key (Optional)</Label>
          <Input id="linkedin-api" placeholder="Enter your LinkedIn API Key" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="naukri-api">Naukri API Key (Optional)</Label>
          <Input id="naukri-api" placeholder="Enter your Naukri API Key" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="indeed-api">Indeed API Key (Optional)</Label>
          <Input id="indeed-api" placeholder="Enter your Indeed API Key" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gmail-api">Gmail API Key (Optional)</Label>
          <Input id="gmail-api" placeholder="Enter your Gmail API Key" />
        </div>
      </div>
    </div>
  );
}
