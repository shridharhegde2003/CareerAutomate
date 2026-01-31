// frontend/components/onboarding-form.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, Info, Trash2, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";

const steps = [
  { id: 1, title: 'Personal Details' },
  { id: 2, title: 'Skills & Academics' },
  { id: 3, title: 'Career Questionnaire' },
  { id: 4, title: 'Connect Accounts' },
  { id: 5, title: 'API Keys Setup' },
  { id: 6, title: 'Review & Finish' },
];

// Degree type options
const DEGREE_TYPES = [
  { value: '10th', label: '10th Standard / SSLC' },
  { value: '12th', label: '12th Standard / PUC / HSC' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'bachelor', label: "Bachelor's Degree" },
  { value: 'master', label: "Master's Degree" },
  { value: 'phd', label: 'PhD / Doctorate' },
];

// Degree names by type
const DEGREE_NAMES: Record<string, { value: string; label: string }[]> = {
  '10th': [
    { value: 'SSLC', label: 'SSLC' },
    { value: 'CBSE', label: 'CBSE Class 10' },
    { value: 'ICSE', label: 'ICSE Class 10' },
    { value: 'State Board', label: 'State Board' },
  ],
  '12th': [
    { value: 'PUC Science', label: 'PUC - Science' },
    { value: 'PUC Commerce', label: 'PUC - Commerce' },
    { value: 'PUC Arts', label: 'PUC - Arts' },
    { value: 'CBSE Science', label: 'CBSE - Science' },
    { value: 'CBSE Commerce', label: 'CBSE - Commerce' },
    { value: 'CBSE Arts', label: 'CBSE - Arts' },
    { value: 'ISC', label: 'ISC' },
  ],
  'diploma': [
    { value: 'Diploma in Computer Science', label: 'Diploma in Computer Science' },
    { value: 'Diploma in Mechanical Engineering', label: 'Diploma in Mechanical Engineering' },
    { value: 'Diploma in Electronics', label: 'Diploma in Electronics' },
    { value: 'Diploma in Civil Engineering', label: 'Diploma in Civil Engineering' },
    { value: 'Other Diploma', label: 'Other Diploma' },
  ],
  'bachelor': [
    { value: 'B.Tech', label: 'B.Tech (Bachelor of Technology)' },
    { value: 'B.E.', label: 'B.E. (Bachelor of Engineering)' },
    { value: 'BCA', label: 'BCA (Bachelor of Computer Applications)' },
    { value: 'B.Sc', label: 'B.Sc (Bachelor of Science)' },
    { value: 'B.Com', label: 'B.Com (Bachelor of Commerce)' },
    { value: 'BBA', label: 'BBA (Bachelor of Business Administration)' },
    { value: 'BA', label: 'BA (Bachelor of Arts)' },
    { value: 'B.Arch', label: 'B.Arch (Bachelor of Architecture)' },
    { value: 'Other Bachelor', label: 'Other Bachelor Degree' },
  ],
  'master': [
    { value: 'M.Tech', label: 'M.Tech (Master of Technology)' },
    { value: 'MCA', label: 'MCA (Master of Computer Applications)' },
    { value: 'MBA', label: 'MBA (Master of Business Administration)' },
    { value: 'M.Sc', label: 'M.Sc (Master of Science)' },
    { value: 'M.Com', label: 'M.Com (Master of Commerce)' },
    { value: 'MA', label: 'MA (Master of Arts)' },
    { value: 'M.E.', label: 'M.E. (Master of Engineering)' },
    { value: 'Other Master', label: 'Other Master Degree' },
  ],
  'phd': [
    { value: 'PhD in Computer Science', label: 'PhD in Computer Science' },
    { value: 'PhD in Engineering', label: 'PhD in Engineering' },
    { value: 'PhD in Management', label: 'PhD in Management' },
    { value: 'PhD in Science', label: 'PhD in Science' },
    { value: 'Other PhD', label: 'Other PhD' },
  ],
};

interface Education {
  degreeType: string;
  degreeName: string;
  institution: string;
  gradeType: 'percentage' | 'cgpa';
  obtainedMarks?: string;
  totalMarks?: string;
  obtainedCGPA?: string;
  maxCGPA?: string;
  yearOfCompletion: string;
}

interface Experience {
  jobTitle: string;
  companyName: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  skillsUsed: string[];
}

interface Achievement {
  title: string;
  issuer: string;
  date: string;
  description: string;
}

interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate: string;
  credentialId: string;
  credentialUrl: string;
}

interface FormData {
  fullName: string;
  dateOfBirth: string;
  countryCode: string;
  phoneNumber: string;
  secondaryEmail: string;
  address: string;
  profilePhoto: File | null;
  govtId: File | null;
  profilePhotoUrl: string;
  govtIdUrl: string;
  linkedinUrl: string;
  githubUsername: string;
  summary: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  achievements: Achievement[];
  certifications: Certification[];
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

// Validation helper functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidLinkedInUrl = (url: string): boolean => {
  return url.includes('linkedin.com/');
};

const isValidDateOfBirth = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if date is in the future
  if (date > today) return false;

  // Check if user is at least 13 years old
  const minAge = 13;
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - minAge);
  if (date > minDate) return false;

  // Check if date is reasonable (not more than 100 years ago)
  const maxAge = 100;
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - maxAge);
  if (date < maxDate) return false;

  return true;
};

const getMaxDateForDOB = (): string => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 13); // Min 13 years old
  return today.toISOString().split('T')[0];
};

const getMinDateForDOB = (): string => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 100); // Max 100 years old
  return today.toISOString().split('T')[0];
};

// Validate education completion year
const isValidEducationYear = (yearStr: string, dateOfBirth: string): { valid: boolean; error?: string } => {
  if (!yearStr) return { valid: true }; // Optional field

  const year = parseInt(yearStr);
  const currentYear = new Date().getFullYear();

  // Year should not be more than 10 years in the future (reasonable for ongoing education)
  if (year > currentYear + 10) {
    return { valid: false, error: `Completion year cannot be more than 10 years in the future (max: ${currentYear + 10})` };
  }

  // Year should be at least 10 years after date of birth (minimum age to complete any education)
  if (dateOfBirth) {
    const birthYear = new Date(dateOfBirth).getFullYear();
    const minGradYear = birthYear + 10;
    if (year < minGradYear) {
      return { valid: false, error: `Completion year must be at least 10 years after birth year (min: ${minGradYear})` };
    }

    // Year should not be before birth year
    if (year <= birthYear) {
      return { valid: false, error: `Completion year must be after your birth year (${birthYear})` };
    }
  }

  // Basic sanity check - year should be reasonable (1950 onwards)
  if (year < 1950) {
    return { valid: false, error: 'Completion year must be 1950 or later' };
  }

  return { valid: true };
};

// Validate experience dates
const isValidExperienceDate = (dateStr: string, dateOfBirth: string, isStart: boolean): { valid: boolean; error?: string } => {
  if (!dateStr) return { valid: true }; // Optional

  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  // Date cannot be in the future
  if (date > today) {
    return { valid: false, error: isStart ? 'Start date cannot be in the future' : 'End date cannot be in the future' };
  }

  // Date must be after DOB + 16 years (minimum working age)
  if (dateOfBirth) {
    const birthDate = new Date(dateOfBirth);
    const minWorkDate = new Date(birthDate);
    minWorkDate.setFullYear(minWorkDate.getFullYear() + 16);
    if (date < minWorkDate) {
      return { valid: false, error: 'Work experience date must be at least 16 years after your date of birth' };
    }

    // Date must be after DOB
    if (date <= birthDate) {
      return { valid: false, error: 'Work experience date must be after your date of birth' };
    }
  }

  // Basic sanity check - not before 1950
  if (date.getFullYear() < 1950) {
    return { valid: false, error: 'Date must be 1950 or later' };
  }

  return { valid: true };
};

// Validate certification dates
const isValidCertificationDate = (dateStr: string, isIssue: boolean, dateOfBirth?: string, issueDate?: string): { valid: boolean; error?: string } => {
  if (!dateStr) return { valid: true }; // Optional

  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const currentYear = new Date().getFullYear();

  if (isIssue) {
    // Issue date cannot be in the future
    if (date > today) {
      return { valid: false, error: 'Issue date cannot be in the future' };
    }

    // Issue date must be after DOB (you can only get certifications after being born!)
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      // Realistically, certifications are obtained after at least age 10
      const minCertDate = new Date(birthDate);
      minCertDate.setFullYear(minCertDate.getFullYear() + 10);
      if (date < minCertDate) {
        return { valid: false, error: 'Certification issue date must be at least 10 years after your date of birth' };
      }
    }

    // Basic sanity check
    if (date.getFullYear() < 1970) {
      return { valid: false, error: 'Issue date must be 1970 or later' };
    }
  } else {
    // Expiry date should be after issue date
    if (issueDate) {
      const issue = new Date(issueDate);
      if (date <= issue) {
        return { valid: false, error: 'Expiry date must be after issue date' };
      }
    }
    // Expiry date should not be more than 10 years in the future
    const maxDate = new Date();
    maxDate.setFullYear(currentYear + 10);
    if (date > maxDate) {
      return { valid: false, error: 'Expiry date cannot be more than 10 years in the future' };
    }
  }

  return { valid: true };
};

// Validate achievement date
const isValidAchievementDate = (dateStr: string, dateOfBirth?: string): { valid: boolean; error?: string } => {
  if (!dateStr) return { valid: true }; // Optional

  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Achievements MUST be in the past - cannot be in the future
  if (date > today) {
    return { valid: false, error: 'Achievement date cannot be in the future. Achievements are for past accomplishments.' };
  }

  // Achievement date must be after DOB
  if (dateOfBirth) {
    const birthDate = new Date(dateOfBirth);
    if (date <= birthDate) {
      return { valid: false, error: 'Achievement date must be after your date of birth' };
    }
  }

  // Basic sanity check - achievements after 1950
  if (date.getFullYear() < 1950) {
    return { valid: false, error: 'Achievement date must be 1950 or later' };
  }

  return { valid: true };
};

export function OnboardingForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubConnecting, setGithubConnecting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    dateOfBirth: '',
    countryCode: '+91',
    phoneNumber: '',
    secondaryEmail: '',
    address: '',
    profilePhoto: null,
    govtId: null,
    profilePhotoUrl: '',
    govtIdUrl: '',
    linkedinUrl: '',
    githubUsername: '',
    summary: '',
    skills: [],
    education: [],
    experience: [],
    achievements: [],
    certifications: [],
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

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setUserId(user.id);

        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (profile?.onboarding_completed) {
          // User already completed onboarding, redirect to dashboard
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [router]);

  // Restore form data from sessionStorage if returning from GitHub OAuth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isFromGitHubOAuth = params.has('github_connected') || params.has('github_error');

      if (isFromGitHubOAuth) {
        // Restore saved form data
        const savedData = sessionStorage.getItem('onboarding_form_data');
        const savedStep = sessionStorage.getItem('onboarding_current_step');

        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            // Note: File objects cannot be serialized, so profilePhoto and govtId will be null
            // But the URLs are preserved
            setFormData(prev => ({
              ...prev,
              ...parsedData,
              profilePhoto: null, // File objects can't be restored
              govtId: null
            }));
          } catch (e) {
            console.error('Error restoring form data:', e);
          }
        }

        if (savedStep) {
          setCurrentStep(parseInt(savedStep, 10));
        }

        // Clear saved data after restoring
        sessionStorage.removeItem('onboarding_form_data');
        sessionStorage.removeItem('onboarding_current_step');
      }
    }
  }, []);

  // Function to save form data before external redirect (GitHub OAuth)
  const saveFormDataForRedirect = () => {
    if (typeof window !== 'undefined') {
      // Create a serializable version of formData (excluding File objects)
      const serializableData = {
        ...formData,
        profilePhoto: null,
        govtId: null
      };
      sessionStorage.setItem('onboarding_form_data', JSON.stringify(serializableData));
      sessionStorage.setItem('onboarding_current_step', currentStep.toString());
    }
  };

  const validateStep1 = (): boolean => {
    if (!formData.fullName.trim()) {
      setValidationError('Full Name is required');
      return false;
    }
    if (formData.fullName.trim().length < 2) {
      setValidationError('Full Name must be at least 2 characters');
      return false;
    }
    if (!formData.dateOfBirth) {
      setValidationError('Date of Birth is required');
      return false;
    }
    if (!isValidDateOfBirth(formData.dateOfBirth)) {
      setValidationError('Invalid Date of Birth. You must be between 13 and 100 years old.');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setValidationError('Phone Number is required');
      return false;
    }
    if (formData.countryCode === '+91' && formData.phoneNumber.length !== 10) {
      setValidationError('Phone number must be exactly 10 digits for India (+91)');
      return false;
    }
    if (formData.phoneNumber.length < 10) { // Minimum length for other countries
      setValidationError('Please enter a valid phone number (at least 10 digits)');
      return false;
    }
    if (formData.secondaryEmail && !isValidEmail(formData.secondaryEmail)) {
      setValidationError('Please enter a valid secondary email address');
      return false;
    }
    if (!formData.address.trim()) {
      setValidationError('Address is required');
      return false;
    }
    if (formData.address.trim().length < 10) {
      setValidationError('Please enter a complete address (at least 10 characters)');
      return false;
    }
    if (!formData.profilePhoto) {
      setValidationError('Profile Photo is required');
      return false;
    }
    if (!formData.govtId) {
      setValidationError('Government Photo ID is required');
      return false;
    }
    if (!formData.linkedinUrl.trim()) {
      setValidationError('LinkedIn Profile URL is required');
      return false;
    }
    if (!isValidLinkedInUrl(formData.linkedinUrl)) {
      setValidationError('Please enter a valid LinkedIn URL (must contain linkedin.com/)');
      return false;
    }
    if (!formData.githubUsername.trim()) {
      setValidationError('GitHub Username is required');
      return false;
    }

    return true;
  };

  // Step 2: Skills & Academics validation
  const validateStep2 = (): boolean => {
    if (formData.skills.length === 0) {
      setValidationError('At least one skill is required');
      return false;
    }

    // Validate education entries
    for (let i = 0; i < formData.education.length; i++) {
      const edu = formData.education[i];

      // Validate completion year
      if (edu.yearOfCompletion) {
        const yearValidation = isValidEducationYear(edu.yearOfCompletion, formData.dateOfBirth);
        if (!yearValidation.valid) {
          setValidationError(`Education #${i + 1}: ${yearValidation.error}`);
          return false;
        }
      }

      // Validate grades - obtained must be <= max
      if (edu.gradeType === 'cgpa') {
        const obtained = parseFloat(edu.obtainedCGPA || '0');
        const max = parseFloat(edu.maxCGPA || '10');
        if (obtained > max) {
          setValidationError(`Education #${i + 1}: CGPA Obtained (${obtained}) cannot be greater than Maximum CGPA (${max})`);
          return false;
        }
        if (obtained < 0) {
          setValidationError(`Education #${i + 1}: CGPA cannot be negative`);
          return false;
        }
        if (max <= 0 || max > 10) {
          setValidationError(`Education #${i + 1}: Maximum CGPA must be between 1 and 10`);
          return false;
        }
      } else if (edu.gradeType === 'percentage') {
        const obtained = parseFloat(edu.obtainedMarks || '0');
        const total = parseFloat(edu.totalMarks || '100');
        if (obtained > total) {
          setValidationError(`Education #${i + 1}: Obtained Marks (${obtained}) cannot be greater than Total Marks (${total})`);
          return false;
        }
        if (obtained < 0 || total < 0) {
          setValidationError(`Education #${i + 1}: Marks cannot be negative`);
          return false;
        }
        if (total > 1000) {
          setValidationError(`Education #${i + 1}: Total marks cannot exceed 1000`);
          return false;
        }
      }
    }

    // Validate experience entries
    for (let i = 0; i < formData.experience.length; i++) {
      const exp = formData.experience[i];

      // Validate start date
      if (exp.startDate) {
        const startValidation = isValidExperienceDate(exp.startDate, formData.dateOfBirth, true);
        if (!startValidation.valid) {
          setValidationError(`Experience #${i + 1}: ${startValidation.error}`);
          return false;
        }
      }

      // Validate end date
      if (exp.endDate && !exp.isCurrent) {
        const endValidation = isValidExperienceDate(exp.endDate, formData.dateOfBirth, false);
        if (!endValidation.valid) {
          setValidationError(`Experience #${i + 1}: ${endValidation.error}`);
          return false;
        }

        // End date must be after start date
        if (exp.startDate && new Date(exp.endDate) <= new Date(exp.startDate)) {
          setValidationError(`Experience #${i + 1}: End date must be after start date`);
          return false;
        }
      }
    }

    // Validate certification entries
    for (let i = 0; i < formData.certifications.length; i++) {
      const cert = formData.certifications[i];

      // Validate issue date
      if (cert.issueDate) {
        const issueValidation = isValidCertificationDate(cert.issueDate, true, formData.dateOfBirth);
        if (!issueValidation.valid) {
          setValidationError(`Certification #${i + 1}: ${issueValidation.error}`);
          return false;
        }
      }

      // Validate expiry date
      if (cert.expiryDate) {
        const expiryValidation = isValidCertificationDate(cert.expiryDate, false, formData.dateOfBirth, cert.issueDate);
        if (!expiryValidation.valid) {
          setValidationError(`Certification #${i + 1}: ${expiryValidation.error}`);
          return false;
        }
      }
    }

    // Validate achievement entries
    for (let i = 0; i < formData.achievements.length; i++) {
      const achievement = formData.achievements[i];

      if (achievement.date) {
        const dateValidation = isValidAchievementDate(achievement.date, formData.dateOfBirth);
        if (!dateValidation.valid) {
          setValidationError(`Achievement #${i + 1}: ${dateValidation.error}`);
          return false;
        }
      }
    }

    return true;
  };

  // Step 3: Career Questionnaire validation
  const validateStep3 = (): boolean => {
    if (formData.preferredRoles.length === 0) {
      setValidationError('Please select at least one preferred job role');
      return false;
    }
    if (!formData.targetLpa) {
      setValidationError('Please enter your minimum target LPA');
      return false;
    }
    const lpa = parseInt(formData.targetLpa);
    if (isNaN(lpa) || lpa < 1 || lpa > 200) {
      setValidationError('Target LPA must be between 1 and 200 lakhs');
      return false;
    }
    if (formData.preferredLocations.length === 0) {
      setValidationError('Please enter at least one preferred location');
      return false;
    }
    return true;
  };

  // Step 4: Connect Accounts validation (GitHub is optional)
  const validateStep4 = (): boolean => {
    // GitHub connection is optional but recommended
    // User can proceed even without connecting
    if (!githubConnected) {
      console.log('GitHub not connected - proceeding without it');
    }
    return true; // Always allow proceeding
  };

  // Step 5: API Keys validation
  const validateStep5 = (): boolean => {
    if (!formData.apiKeys.geminiAiKey.trim()) {
      setValidationError('Gemini AI Key is required for AI features');
      return false;
    }
    if (formData.apiKeys.geminiAiKey.length < 20) {
      setValidationError('Please enter a valid Gemini AI Key');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (isUploading) return;
    setValidationError('');

    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep === 4 && !validateStep4()) return;
    if (currentStep === 5 && !validateStep5()) return;

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
    if (!userId) {
      console.error('User ID not found for upload');
      return null;
    }
    const fileExt = file.name.split('.').pop();
    // Use consistent path to prevent garbage accumulation (overwrite existing)
    const type = bucket === 'profile-photos' ? 'avatar' : 'govt_id';
    // Add timestamp to query param to bust cache if needed, but file path remains same
    const filePath = `${userId}/${type}.${fileExt}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // For private buckets (government-ids), use signed URL
    // For public buckets (profile-photos), use public URL
    if (bucket === 'government-ids') {
      const { data, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (signedError || !data) {
        console.error('Signed URL error:', signedError);
        return null;
      }
      return data.signedUrl;
    } else {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      return data.publicUrl;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePhoto' | 'govtId') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 1MB)
      if (file.size > 1 * 1024 * 1024) {
        setValidationError('File size must be less than 1MB. Please compress your image and try again.');
        return;
      }

      setIsUploading(true);
      try {
        // Upload immediately
        const bucket = field === 'profilePhoto' ? 'profile-photos' : 'government-ids';

        // Delete previous file if exists to prevent garbage (optional optimization)
        // Note: Ideally we'd delete the old file from bucket, but we only have its public URL.
        // For now, we just upload the new one.

        const url = await uploadFile(file, bucket);

        if (url) {
          setFormData(prev => ({
            ...prev,
            [field]: file,
            [field === 'profilePhoto' ? 'profilePhotoUrl' : 'govtIdUrl']: url
          }));
        }
      } catch (error) {
        console.error('Upload failed:', error);
        setValidationError('File upload failed. Please try again.');
      } finally {
        setIsUploading(false);
      }
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

      // Format education data for backend
      const formattedEducation = formData.education.map(edu => ({
        degree_type: edu.degreeType,
        degree_name: edu.degreeName,
        institution: edu.institution,
        grade_type: edu.gradeType,
        obtained_marks: edu.gradeType === 'percentage' ? edu.obtainedMarks : null,
        total_marks: edu.gradeType === 'percentage' ? edu.totalMarks : null,
        obtained_cgpa: edu.gradeType === 'cgpa' ? edu.obtainedCGPA : null,
        max_cgpa: edu.gradeType === 'cgpa' ? edu.maxCGPA : null,
        year_of_completion: edu.yearOfCompletion,
        percentage: edu.gradeType === 'percentage' && edu.obtainedMarks && edu.totalMarks
          ? ((parseFloat(edu.obtainedMarks) / parseFloat(edu.totalMarks)) * 100).toFixed(2)
          : null,
      }));

      // Format experience data for backend
      const formattedExperience = formData.experience.map(exp => ({
        job_title: exp.jobTitle,
        company_name: exp.companyName,
        location: exp.location,
        employment_type: exp.employmentType,
        start_date: exp.startDate,
        end_date: exp.isCurrent ? 'Present' : exp.endDate,
        is_current: exp.isCurrent,
        description: exp.description,
        skills_used: exp.skillsUsed,
      }));

      // Format achievements for backend
      const formattedAchievements = formData.achievements.map(ach => ({
        title: ach.title,
        issuer: ach.issuer,
        date: ach.date,
        description: ach.description,
      }));

      // Format certifications for backend
      const formattedCertifications = formData.certifications.map(cert => ({
        name: cert.name,
        issuing_organization: cert.issuingOrganization,
        issue_date: cert.issueDate,
        expiry_date: cert.expiryDate,
        credential_id: cert.credentialId,
        credential_url: cert.credentialUrl,
      }));

      // Prepare payload to match backend schema strictly
      const payload = {
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth,
        phone_number: formData.phoneNumber ? `${formData.countryCode} ${formData.phoneNumber}` : null,
        secondary_email: formData.secondaryEmail || null,
        address: formData.address,
        profile_photo_url: formData.profilePhotoUrl || null,
        govt_id_url: formData.govtIdUrl || null,
        linkedin_url: formData.linkedinUrl || null,
        github_username: formData.githubUsername || null,
        summary: formData.summary || null,
        skills: formData.skills,
        education: formattedEducation,
        experience: formattedExperience,
        achievements: formattedAchievements,
        certifications: formattedCertifications,
        career_preferences: {
          roles_targeted: formData.preferredRoles,
          min_target_lpa: formData.targetLpa ? parseInt(formData.targetLpa) : null,
          preferred_locations: formData.preferredLocations,
          work_preference: formData.workPreference,
          other_preferences: formData.otherPreferences,
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

  // Show loading while checking onboarding status
  if (isCheckingOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <div className="flex justify-between items-center mb-4">
          <CardTitle>Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}</CardTitle>
        </div>
        <Progress value={progressValue} />
      </CardHeader>
      <CardContent>
        {validationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {validationError}
          </div>
        )}

        {currentStep === 1 && <Step1Personal formData={formData} setFormData={setFormData} handleFileChange={handleFileChange} isUploading={isUploading} />}
        {currentStep === 2 && <Step2Academics formData={formData} setFormData={setFormData} />}
        {currentStep === 3 && <Step3Career formData={formData} setFormData={setFormData} />}
        {currentStep === 4 && <Step4GitHub githubConnected={githubConnected} setGithubConnected={setGithubConnected} githubConnecting={githubConnecting} setGithubConnecting={setGithubConnecting} onBeforeRedirect={saveFormDataForRedirect} />}
        {currentStep === 5 && <Step5APIKeys formData={formData} setFormData={setFormData} />}
        {currentStep === 6 && <Step6Review formData={formData} githubConnected={githubConnected} />}

        <div className="flex flex-col gap-4 mt-8">
          {/* Terms and Conditions notice for Step 6 */}
          {currentStep === 6 && (
            <p className="text-center text-sm text-muted-foreground">
              By clicking Finish, you agree to our{' '}
              <a href="/terms" target="_blank" className="text-blue-600 hover:underline font-medium">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>.
            </p>
          )}

          <div className="flex justify-between">
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
        </div>
      </CardContent>
    </Card>
  );
}

// Step 1: Personal Details
function Step1Personal({ formData, setFormData, handleFileChange, isUploading }: any) {
  const COUNTRY_CODES = [
    { code: '+91', country: 'India' },
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+61', country: 'Australia' },
    { code: '+81', country: 'Japan' },
    { code: '+49', country: 'Germany' },
    { code: '+33', country: 'France' },
    { code: '+86', country: 'China' },
  ];

  return (
    <div className="space-y-6">
      {/* Warning about unsaved progress */}
      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-sm flex items-center gap-2">
        <span>⚠️</span>
        <span>Your progress is not saved. Please complete all steps and submit before leaving this page.</span>
      </div>

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
            maxLength={100}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth *</Label>
          <Input
            id="dob"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            max={getMaxDateForDOB()}
            min={getMinDateForDOB()}
          />
          <p className="text-xs text-muted-foreground">You must be at least 13 years old</p>
        </div>

        {/* Phone Number Field */}
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <div className="flex gap-2">
            <Select
              value={formData.countryCode}
              onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="+91" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRY_CODES.map((item) => (
                  <SelectItem key={item.code} value={item.code}>
                    {item.code} ({item.country})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              id="phone"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '') })}
              placeholder="9876543210"
              maxLength={15}
              className="flex-1"
            />
          </div>
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
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="City, State, Country"
            maxLength={200}
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold">Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Profile Photo *</Label>
            <div className="flex flex-col gap-2">
              <Input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleFileChange(e, 'profilePhoto')}
                disabled={isUploading}
              />
              {isUploading && !formData.profilePhotoUrl && <p className="text-xs text-blue-600 animate-pulse">Uploading...</p>}
              {formData.profilePhotoUrl && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <span>✓ Uploaded</span>
                  <a href={formData.profilePhotoUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-500">View</a>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Max 1MB, formats: JPEG, JPG, PNG</p>
          </div>

          <div className="space-y-2">
            <Label>Government Photo ID Proof *</Label>
            <div className="flex flex-col gap-2">
              <Input
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={(e) => handleFileChange(e, 'govtId')}
                disabled={isUploading}
              />
              {isUploading && !formData.govtIdUrl && <p className="text-xs text-blue-600 animate-pulse">Uploading...</p>}
              {formData.govtIdUrl && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <span>✓ Uploaded</span>
                  <a href={formData.govtIdUrl} target="_blank" rel="noopener noreferrer" className="underline text-blue-500">View</a>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Max 1MB, formats: JPEG, JPG, PNG, PDF</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-semibold">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile URL *</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground w-4 h-4">in</span>
              <Input
                id="linkedin"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
                className="pl-8"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="github">GitHub Username *</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground w-4 h-4">gh</span>
              <Input
                id="github"
                value={formData.githubUsername}
                onChange={(e) => setFormData({ ...formData, githubUsername: e.target.value })}
                placeholder="yourusername"
                className="pl-8"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 2: Skills & Academics
function Step2Academics({ formData, setFormData }: any) {
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData({ ...formData, skills: formData.skills.filter((_: any, i: number) => i !== index) });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, {
        degreeType: '',
        degreeName: '',
        institution: '',
        gradeType: 'percentage',
        obtainedMarks: '',
        totalMarks: '',
        obtainedCGPA: '',
        maxCGPA: '10',
        yearOfCompletion: ''
      }]
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...formData.education];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'degreeType') updated[index].degreeName = '';
    if (field === 'gradeType') {
      updated[index].obtainedMarks = '';
      updated[index].totalMarks = '';
      updated[index].obtainedCGPA = '';
      updated[index].maxCGPA = '10';
    }
    setFormData({ ...formData, education: updated });
  };

  const removeEducation = (index: number) => {
    setFormData({ ...formData, education: formData.education.filter((_: any, i: number) => i !== index) });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [...formData.experience, {
        jobTitle: '', companyName: '', location: '', employmentType: 'full-time',
        startDate: '', endDate: '', isCurrent: false, description: '', skillsUsed: []
      }]
    });
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = [...formData.experience];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, experience: updated });
  };

  const removeExperience = (index: number) => {
    setFormData({ ...formData, experience: formData.experience.filter((_: any, i: number) => i !== index) });
  };

  const addAchievement = () => {
    setFormData({
      ...formData,
      achievements: [...formData.achievements, { title: '', issuer: '', date: '', description: '' }]
    });
  };

  const updateAchievement = (index: number, field: string, value: string) => {
    const updated = [...formData.achievements];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, achievements: updated });
  };

  const removeAchievement = (index: number) => {
    setFormData({ ...formData, achievements: formData.achievements.filter((_: any, i: number) => i !== index) });
  };

  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [...formData.certifications, {
        name: '', issuingOrganization: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: ''
      }]
    });
  };

  const updateCertification = (index: number, field: string, value: string) => {
    const updated = [...formData.certifications];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, certifications: updated });
  };

  const removeCertification = (index: number) => {
    setFormData({ ...formData, certifications: formData.certifications.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Skills & Academics</h2>
        <p className="text-muted-foreground">Tell us about your skills, education, experience, and achievements.</p>
      </div>

      {/* Skills Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Technical Skills *</h3>
        <div className="flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="e.g. Python, React, Data Analysis"
          />
          <Button type="button" onClick={addSkill}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill: string, index: number) => (
            <span key={index} className="bg-primary/10 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              {skill}
              <button onClick={() => removeSkill(index)} className="text-red-500 hover:text-red-700">×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Professional Summary */}
      <div className="space-y-2">
        <Label>Professional Summary (Optional)</Label>
        <Textarea
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          placeholder="Brief summary of your professional background and career goals..."
          rows={3}
        />
      </div>

      {/* Education Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Education</h3>
          <Button variant="outline" size="sm" onClick={addEducation} type="button" className="gap-1">
            <Plus className="w-4 h-4" /> Add Education
          </Button>
        </div>
        {formData.education.length === 0 && (
          <div className="p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground">
            No education added. Click "Add Education" to add your qualifications.
          </div>
        )}
        {formData.education.map((edu: any, index: number) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="font-medium text-sm text-muted-foreground">Education #{index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeEducation(index)} className="text-red-500">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Degree Type *</Label>
                <Select value={edu.degreeType} onValueChange={(v) => updateEducation(index, 'degreeType', v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {DEGREE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Degree Name *</Label>
                <Select value={edu.degreeName} onValueChange={(v) => updateEducation(index, 'degreeName', v)} disabled={!edu.degreeType}>
                  <SelectTrigger><SelectValue placeholder={edu.degreeType ? "Select degree" : "Select type first"} /></SelectTrigger>
                  <SelectContent>
                    {edu.degreeType && DEGREE_NAMES[edu.degreeType]?.map((d: any) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Institution Name *</Label>
                <Input placeholder="College/University/School" value={edu.institution} onChange={(e) => updateEducation(index, 'institution', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Grade Type</Label>
                <Select value={edu.gradeType} onValueChange={(v) => updateEducation(index, 'gradeType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="cgpa">CGPA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year of Completion</Label>
                <Input type="number" placeholder="2024" value={edu.yearOfCompletion} onChange={(e) => updateEducation(index, 'yearOfCompletion', e.target.value)} min="1990" max={new Date().getFullYear() + 5} />
              </div>
              {edu.gradeType === 'percentage' && (
                <>
                  <div className="space-y-2">
                    <Label>Marks Obtained</Label>
                    <Input type="number" placeholder="450" value={edu.obtainedMarks} onChange={(e) => updateEducation(index, 'obtainedMarks', e.target.value)} min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Marks</Label>
                    <Input type="number" placeholder="500" value={edu.totalMarks} onChange={(e) => updateEducation(index, 'totalMarks', e.target.value)} min="1" />
                    {edu.obtainedMarks && edu.totalMarks && (
                      parseFloat(edu.obtainedMarks) > parseFloat(edu.totalMarks)
                        ? <p className="text-xs text-red-600">❌ Obtained cannot exceed Total</p>
                        : <p className="text-xs text-green-600">✓ {((parseFloat(edu.obtainedMarks) / parseFloat(edu.totalMarks)) * 100).toFixed(2)}%</p>
                    )}
                  </div>
                </>
              )}
              {edu.gradeType === 'cgpa' && (
                <>
                  <div className="space-y-2">
                    <Label>CGPA Obtained</Label>
                    <Input type="number" step="0.01" placeholder="8.5" value={edu.obtainedCGPA} onChange={(e) => updateEducation(index, 'obtainedCGPA', e.target.value)} min="0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Max CGPA</Label>
                    <Select value={edu.maxCGPA || '10'} onValueChange={(v) => updateEducation(index, 'maxCGPA', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                    {edu.obtainedCGPA && edu.maxCGPA && (
                      parseFloat(edu.obtainedCGPA) > parseFloat(edu.maxCGPA)
                        ? <p className="text-xs text-red-600">❌ CGPA cannot exceed Max</p>
                        : <p className="text-xs text-green-600">✓ {edu.obtainedCGPA} / {edu.maxCGPA}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Experience Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Work Experience (Optional)</h3>
          <Button variant="outline" size="sm" onClick={addExperience} type="button" className="gap-1">
            <Plus className="w-4 h-4" /> Add Experience
          </Button>
        </div>
        {formData.experience.map((exp: any, index: number) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="font-medium text-sm text-muted-foreground">Experience #{index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeExperience(index)} className="text-red-500">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input placeholder="Software Engineer" value={exp.jobTitle} onChange={(e) => updateExperience(index, 'jobTitle', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Company *</Label>
                <Input placeholder="Company Name" value={exp.companyName} onChange={(e) => updateExperience(index, 'companyName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="City, Country" value={exp.location} onChange={(e) => updateExperience(index, 'location', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select value={exp.employmentType} onValueChange={(v) => updateExperience(index, 'employmentType', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="month" value={exp.startDate} onChange={(e) => updateExperience(index, 'startDate', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="month" value={exp.endDate} onChange={(e) => updateExperience(index, 'endDate', e.target.value)} disabled={exp.isCurrent} />
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={exp.isCurrent} onChange={(e) => updateExperience(index, 'isCurrent', e.target.checked)} />
                  <span className="text-sm">Currently working here</span>
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe your responsibilities..." value={exp.description} onChange={(e) => updateExperience(index, 'description', e.target.value)} rows={2} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Achievements Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Achievements (Optional)</h3>
          <Button variant="outline" size="sm" onClick={addAchievement} type="button" className="gap-1">
            <Plus className="w-4 h-4" /> Add Achievement
          </Button>
        </div>
        {formData.achievements.map((ach: any, index: number) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="font-medium text-sm text-muted-foreground">Achievement #{index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeAchievement(index)} className="text-red-500">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input placeholder="Best Project Award" value={ach.title} onChange={(e) => updateAchievement(index, 'title', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Issuer</Label>
                <Input placeholder="Organization/Event" value={ach.issuer} onChange={(e) => updateAchievement(index, 'issuer', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="month" value={ach.date} onChange={(e) => updateAchievement(index, 'date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Brief description" value={ach.description} onChange={(e) => updateAchievement(index, 'description', e.target.value)} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Certifications Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Certifications (Optional)</h3>
          <Button variant="outline" size="sm" onClick={addCertification} type="button" className="gap-1">
            <Plus className="w-4 h-4" /> Add Certification
          </Button>
        </div>
        {formData.certifications.map((cert: any, index: number) => (
          <Card key={index} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="font-medium text-sm text-muted-foreground">Certification #{index + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeCertification(index)} className="text-red-500">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Certificate Name *</Label>
                <Input placeholder="AWS Solutions Architect" value={cert.name} onChange={(e) => updateCertification(index, 'name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Issuing Organization *</Label>
                <Input placeholder="Amazon Web Services" value={cert.issuingOrganization} onChange={(e) => updateCertification(index, 'issuingOrganization', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input type="month" value={cert.issueDate} onChange={(e) => updateCertification(index, 'issueDate', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Expiry Date (if applicable)</Label>
                <Input type="month" value={cert.expiryDate} onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Credential ID</Label>
                <Input placeholder="ABC123XYZ" value={cert.credentialId} onChange={(e) => updateCertification(index, 'credentialId', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Credential URL</Label>
                <Input placeholder="https://verify.example.com/..." value={cert.credentialUrl} onChange={(e) => updateCertification(index, 'credentialUrl', e.target.value)} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Step3Career({ formData, setFormData }: any) {
  const roles = ["Software Engineer", "Data Scientist", "Product Manager", "UX/UI Designer", "DevOps Engineer", "Cybersecurity", "Machine Learning", "Blockchain Dev", "Others"];

  // Local state for location input - allows typing commas and spaces freely
  const [locationInput, setLocationInput] = useState(formData.preferredLocations.join(', '));

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

  // Parse locations and save to formData when user leaves the field
  const handleLocationBlur = () => {
    const locations = locationInput.split(',').map((l: string) => l.trim()).filter((l: string) => l);
    setFormData({ ...formData, preferredLocations: locations });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Tell Us Your Career Goals</h2>
      <p className="text-muted-foreground">Help us understand your career preferences to find the best opportunities for you.</p>

      <div>
        <h3 className="text-lg font-semibold">Career Preferences *</h3>
        <p className="text-sm text-muted-foreground">Preferred Job Roles and Fields (select at least one)</p>
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
          <Label htmlFor="lpa">Minimum Target LPA (in Lakhs) *</Label>
          <Input
            id="lpa"
            type="number"
            value={formData.targetLpa}
            onChange={(e) => setFormData({ ...formData, targetLpa: e.target.value })}
            placeholder="e.g. 15"
            min="1"
            max="200"
          />
          <p className="text-xs text-muted-foreground">Enter a value between 1 and 200</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="locations">Preferred Job Locations (comma separated) *</Label>
          <Input
            id="locations"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            onBlur={handleLocationBlur}
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

function Step4GitHub({ githubConnected, setGithubConnected, githubConnecting, setGithubConnecting, onBeforeRedirect }: {
  githubConnected: boolean;
  setGithubConnected: (value: boolean) => void;
  githubConnecting: boolean;
  setGithubConnecting: (value: boolean) => void;
  onBeforeRedirect?: () => void;
}) {
  const GITHUB_SYNC_SERVICE_URL = process.env.NEXT_PUBLIC_GITHUB_SYNC_SERVICE_URL;

  const handleConnectGitHub = async () => {
    setGithubConnecting(true);

    try {
      // Get current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user logged in');
        setGithubConnecting(false);
        return;
      }

      // Save form data before redirecting to GitHub OAuth
      if (onBeforeRedirect) {
        onBeforeRedirect();
      }

      // Redirect to GitHub Sync Service OAuth flow with user_id and redirect_to for onboarding
      window.location.href = `${GITHUB_SYNC_SERVICE_URL}/v1/github/authorize?user_id=${user.id}&redirect_to=/onboarding`;
    } catch (error) {
      console.error('Error initiating GitHub connection:', error);
      setGithubConnecting(false);
    }
  };

  // Check if already connected on mount AND handle callback params
  const checkGitHubConnection = async () => {
    try {
      // Check URL params for OAuth callback result
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const connected = params.get('github_connected');
        const error = params.get('github_error');

        if (connected === 'true') {
          setGithubConnected(true);
          setGithubConnecting(false);
          // Clean up URL params
          window.history.replaceState({}, '', '/onboarding');
          return;
        }

        if (error) {
          console.error('GitHub OAuth error:', error);
          setGithubConnecting(false);
          // Clean up URL params
          window.history.replaceState({}, '', '/onboarding');
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('github_integrations')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setGithubConnected(true);
      }
    } catch (error) {
      console.error('Error checking GitHub connection:', error);
    }
  };

  // Check connection status on component mount
  useEffect(() => {
    checkGitHubConnection();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Connect your accounts</h2>
      <p className="text-muted-foreground">
        Connecting your GitHub account allows us to showcase your projects and professional experience on your profile.
        <strong> This step is optional but highly recommended.</strong>
      </p>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Why connect GitHub?</p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Your GitHub repositories will be automatically synced to display on your profile.
              AI will analyze your projects to generate professional descriptions for your resume.
              You can also connect later from the Projects page.
            </p>
          </div>
        </div>
      </div>

      <Card className={githubConnected ? "border-green-500 bg-green-50 dark:bg-green-950/30" : ""}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
                Connect GitHub Account
                <span className="text-xs text-muted-foreground ml-2">(Recommended)</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {githubConnected
                  ? "✓ GitHub connected! Your repositories will be synced."
                  : "Showcase your projects and contributions. Uses GitHub App (not OAuth)."}
              </p>
            </div>
            {githubConnected ? (
              <Button variant="outline" className="border-green-500 text-green-600" disabled>
                ✓ Connected
              </Button>
            ) : (
              <Button onClick={handleConnectGitHub} disabled={githubConnecting}>
                {githubConnecting ? 'Connecting...' : 'Connect GitHub'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {!githubConnected && (
        <p className="text-sm text-muted-foreground text-center">
          💡 <strong>Tip:</strong> You can skip this step and connect GitHub later from the Projects page.
        </p>
      )}


    </div>
  );
}

function Step5APIKeys({ formData, setFormData }: any) {
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
          <p className="text-xs text-muted-foreground">Required for AI-powered features like resume generation and project descriptions</p>
        </div>

        {/* Optional API Keys - Temporarily hidden as per request */}
        {/* 
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
          <Label htmlFor="naukri-api">Naukri API Key (Optional)</Label>
          <Input
            id="naukri-api"
            type="password"
            value={formData.apiKeys.naukriApiKey}
            onChange={(e) => setFormData({ ...formData, apiKeys: { ...formData.apiKeys, naukriApiKey: e.target.value } })}
            placeholder="Enter your Naukri API Key"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="indeed-api">Indeed API Key (Optional)</Label>
          <Input
            id="indeed-api"
            type="password"
            value={formData.apiKeys.indeedApiKey}
            onChange={(e) => setFormData({ ...formData, apiKeys: { ...formData.apiKeys, indeedApiKey: e.target.value } })}
            placeholder="Enter your Indeed API Key"
          />
        </div>

         <div className="space-y-2">
          <Label htmlFor="gmail-api">Gmail API Key (Optional)</Label>
          <Input
             id="gmail-api"
            type="password"
            value={formData.apiKeys.gmailApiKey}
            onChange={(e) => setFormData({ ...formData, apiKeys: { ...formData.apiKeys, gmailApiKey: e.target.value } })}
            placeholder="Enter your Gmail API Key"
          />
        </div>
        */}
      </div>
    </div>
  );
}

function Step6Review({ formData, githubConnected }: any) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review Your Information</h2>
      <p className="text-muted-foreground">Please review your information before submitting.</p>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Personal Details</CardTitle>
              {formData.profilePhotoUrl && (
                <div className="w-16 h-16 rounded-full overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Full Name:</span>
              <p className="font-medium">{formData.fullName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Date of Birth:</span>
              <p className="font-medium">{formData.dateOfBirth}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Phone Number:</span>
              <p className="font-medium">{formData.countryCode} {formData.phoneNumber}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Secondary Email:</span>
              <p className="font-medium">{formData.secondaryEmail || 'Not provided'}</p>
            </div>
            <div className="md:col-span-2">
              <span className="text-muted-foreground">Address:</span>
              <p className="font-medium">{formData.address}</p>
            </div>

            <div className="md:col-span-2 pt-3 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground block mb-1">Documents:</span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">Profile Photo:</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">{formData.profilePhoto?.name || 'Uploaded'}</span>
                    {formData.profilePhotoUrl && <a href={formData.profilePhotoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-xs">View</a>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">Govt ID:</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">{formData.govtId?.name || 'Uploaded'}</span>
                    {formData.govtIdUrl && <a href={formData.govtIdUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-xs">View</a>}
                  </div>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Social Links:</span>
                <div className="space-y-1">
                  <div>
                    <span className="text-xs font-medium">LinkedIn: </span>
                    <a href={formData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-xs truncate block">{formData.linkedinUrl}</a>
                  </div>
                  <div>
                    <span className="text-xs font-medium">GitHub: </span>
                    <span className="text-xs">{formData.githubUsername}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {formData.summary && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Professional Summary</CardTitle></CardHeader>
            <CardContent><p className="text-sm whitespace-pre-wrap">{formData.summary}</p></CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-lg">Skills</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill: string, index: number) => (
                <span key={index} className="bg-primary/10 px-3 py-1 rounded-full text-sm">{skill}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        {formData.experience.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Experience</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {formData.experience.map((exp: any, i: number) => (
                <div key={i} className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="font-bold">{exp.jobTitle} at {exp.companyName}</p>
                  <p className="text-xs text-muted-foreground">{exp.location} • {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</p>
                  <p className="mt-1">{exp.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {formData.education.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Education</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {formData.education.map((edu: Education, index: number) => (
                <div key={index} className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="font-medium">{edu.degreeName} ({edu.degreeType})</p>
                  <p className="text-muted-foreground">{edu.institution}</p>
                  <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Year: {edu.yearOfCompletion}</span>
                    {edu.gradeType === 'percentage' && <span>Result: {edu.obtainedMarks}/{edu.totalMarks}</span>}
                    {edu.gradeType === 'cgpa' && <span>CGPA: {edu.obtainedCGPA}/{edu.maxCGPA}</span>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {formData.achievements.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Achievements</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {formData.achievements.map((ach: any, i: number) => (
                <div key={i} className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="font-bold">{ach.title}</p>
                  <p className="text-xs text-muted-foreground">{ach.issuer} • {ach.date}</p>
                  <p className="mt-1">{ach.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {formData.certifications.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Certifications</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {formData.certifications.map((cert: any, i: number) => (
                <div key={i} className="p-3 bg-muted/50 rounded-lg text-sm">
                  <p className="font-bold">{cert.name}</p>
                  <p className="text-xs text-muted-foreground">{cert.issuingOrganization} • {cert.issueDate}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Career Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Preferred Roles:</span>
              <p className="font-medium">{formData.preferredRoles.join(', ')}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Target LPA:</span>
              <p className="font-medium">{formData.targetLpa} LPA</p>
            </div>
            <div>
              <span className="text-muted-foreground">Locations:</span>
              <p className="font-medium">{formData.preferredLocations.join(', ')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Keys Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className={formData.apiKeys.geminiAiKey ? "text-green-600" : "text-red-600"}>
                {formData.apiKeys.geminiAiKey ? "✓" : "✗"}
              </span>
              <span>Gemini AI Key</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Other optional keys (LinkedIn, Naukri, Indeed, Gmail) are {formData.apiKeys.linkedinApiKey || formData.apiKeys.naukriApiKey || formData.apiKeys.indeedApiKey || formData.apiKeys.gmailApiKey ? 'partially provided' : 'not provided'}.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
