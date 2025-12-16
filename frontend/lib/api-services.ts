// API utility for future microservices
// This file contains placeholder functions for AI-powered features
// Each function will call the respective microservice when implemented

const AI_SERVICE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || 'http://localhost:8001';
const JOB_SERVICE_URL = process.env.NEXT_PUBLIC_JOB_SERVICE_URL || 'http://localhost:8002';
const ANALYTICS_SERVICE_URL = process.env.NEXT_PUBLIC_ANALYTICS_SERVICE_URL || 'http://localhost:8003';
const ONBOARDING_SERVICE_URL = process.env.NEXT_PUBLIC_ONBOARDING_SERVICE_URL || 'http://localhost:8004';

// ============================================================================
// ONBOARDING ENDPOINTS
// ============================================================================

/**
 * GET User Profile
 * Endpoint: GET /v1/onboarding
 * Used to check if user has completed onboarding or to fetch profile for editing.
 */
export async function getUserProfile(token: string) {
    console.log('Fetching user profile from:', `${ONBOARDING_SERVICE_URL}/v1/onboarding`);

    const response = await fetch(`${ONBOARDING_SERVICE_URL}/v1/onboarding`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.status === 404) {
        return null; // Profile not found (User needs onboarding)
    }

    if (!response.ok) {
        throw new Error('Failed to fetch user profile');
    }

    return await response.json();
}

/**
 * Submit Onboarding Data (Upsert)
 * Endpoint: PUT /v1/onboarding
 * Used for both creating NEW profiles and UPDATING existing ones.
 */
export async function submitOnboardingData(payload: any, token: string) {
    console.log('Submitting onboarding data to:', `${ONBOARDING_SERVICE_URL}/v1/onboarding`);
    console.log('Payload:', payload);

    const response = await fetch(`${ONBOARDING_SERVICE_URL}/v1/onboarding`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to submit onboarding data');
    }

    return await response.json();
}

/**
 * TODO: Generate AI-powered resume based on user profile and target role
 * Microservice: AI-Service (port 8001)
 * Endpoint: POST /ai/resume/generate
 */
export async function generateAIResume(params: {
    userId: string;
    targetRole: string;
    jobDescription?: string;
    userProfile: any;
}) {
    // TODO: Implement when AI-Service is ready
    console.log('[PLACEHOLDER] generateAIResume called with:', params);

    /*
    const response = await fetch(`${AI_SERVICE_URL}/ai/resume/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await response.json();
    */

    return {
        success: false,
        message: 'AI-Service not yet implemented',
        placeholder: true
    };
}

/**
 * TODO: Tailor existing resume for specific job description
 * Microservice: AI-Service (port 8001)
 * Endpoint: POST /ai/resume/tailor
 */
export async function tailorResume(params: {
    resumeId: string;
    jobDescription: string;
    jobUrl?: string;
}) {
    // TODO: Implement when AI-Service is ready
    console.log('[PLACEHOLDER] tailorResume called with:', params);

    /*
    const response = await fetch(`${AI_SERVICE_URL}/ai/resume/tailor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await response.json();
    */

    return {
        success: false,
        message: 'AI Resume Tailoring not yet implemented',
        placeholder: true
    };
}

/**
 * TODO: Analyze user skills vs job market requirements
 * Microservice: AI-Service (port 8001)
 * Endpoint: POST /ai/skills/analyze
 */
export async function analyzeSkillGaps(params: {
    userId: string;
    currentSkills: string[];
    targetRole: string;
    jobDescriptions?: string[];
}) {
    // TODO: Implement when AI-Service is ready
    console.log('[PLACEHOLDER] analyzeSkillGaps called with:', params);

    /*
    const response = await fetch(`${AI_SERVICE_URL}/ai/skills/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await response.json();
    */

    return {
        success: false,
        message: 'Skill Gap Analysis not yet implemented',
        placeholder: true,
        // Mock data for UI testing
        mockData: {
            skill_gaps: [
                { skill: 'Kubernetes', importance: 'high', recommendation: 'Take online course' },
                { skill: 'Docker', importance: 'medium', recommendation: 'Build projects' }
            ],
            match_percentage: 65
        }
    };
}

/**
 * TODO: Analyze resume performance (ATS compatibility, keyword optimization)
 * Microservice: AI-Service (port 8001)
 * Endpoint: POST /ai/resume/analyze-performance
 */
export async function analyzeResumePerformance(params: {
    resumeId: string;
    recentApplications?: number;
}) {
    // TODO: Implement when AI-Service is ready
    console.log('[PLACEHOLDER] analyzeResumePerformance called with:', params);

    /*
    const response = await fetch(`${AI_SERVICE_URL}/ai/resume/analyze-performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await response.json();
    */

    return {
        success: false,
        message: 'Resume Performance Analysis not yet implemented',
        placeholder: true,
        // Mock data for UI testing
        mockData: {
            score: 78,
            ats_compatibility: 'high',
            improvements: ['Add more action verbs', 'Include metrics']
        }
    };
}

// ============================================================================
// JOB-SERVICE ENDPOINTS (Job Search, Matching, Auto-Apply)
// ============================================================================

/**
 * TODO: Search for jobs across multiple platforms
 * Microservice: Job-Service (port 8002)
 * Endpoint: POST /jobs/search
 */
export async function searchJobs(params: {
    keywords: string;
    location: string;
    platforms: string[];
    userId?: string;
}) {
    // TODO: Implement when Job-Service is ready
    console.log('[PLACEHOLDER] searchJobs called with:', params);

    /*
    const response = await fetch(`${JOB_SERVICE_URL}/jobs/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await response.json();
    */

    return {
        success: false,
        message: 'Job Search Service not yet implemented',
        placeholder: true
    };
}

/**
 * TODO: Auto-apply to jobs (with user approval)
 * Microservice: Job-Service (port 8002)
 * Endpoint: POST /jobs/auto-apply
 */
export async function autoApplyJob(params: {
    userId: string;
    jobId: string;
    resumeId: string;
    coverLetter?: string;
}) {
    // TODO: Implement when Job-Service is ready
    console.log('[PLACEHOLDER] autoApplyJob called with:', params);

    return {
        success: false,
        message: 'Auto-Apply feature not yet implemented',
        placeholder: true
    };
}

// ============================================================================
// ANALYTICS-SERVICE ENDPOINTS (Reports, Trends, Insights)
// ============================================================================

/**
 * TODO: Get application statistics and trends
 * Microservice: Analytics-Service (port 8003)
 * Endpoint: GET /analytics/applications/{userId}
 */
export async function getApplicationAnalytics(userId: string) {
    // TODO: Implement when Analytics-Service is ready
    console.log('[PLACEHOLDER] getApplicationAnalytics called for user:', userId);

    /*
    const response = await fetch(`${ANALYTICS_SERVICE_URL}/analytics/applications/${userId}`);
    return await response.json();
    */

    return {
        success: false,
        message: 'Analytics Service not yet implemented',
        placeholder: true,
        // Mock data for UI testing
        mockData: {
            total_applications: 120,
            response_rate: 15,
            interview_rate: 5
        }
    };
}

/**
 * TODO: Get skill market trends
 * Microservice: Analytics-Service (port 8003)
 * Endpoint: GET /analytics/skills/trends
 */
export async function getSkillTrends() {
    // TODO: Implement when Analytics-Service is ready
    console.log('[PLACEHOLDER] getSkillTrends called');

    return {
        success: false,
        message: 'Skill Trends Analysis not yet implemented',
        placeholder: true
    };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if microservice is available
 */
export async function checkServiceHealth(serviceUrl: string) {
    try {
        const response = await fetch(`${serviceUrl}/health`);
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * Get user's API keys from database (for microservices to use)
 */
export async function getUserAPIKeys(userId: string) {
    // Microservices will need these keys to make API calls
    // to Gemini, LinkedIn, Indeed, etc.

    // TODO: Fetch from Supabase profiles table
    console.log('[PLACEHOLDER] getUserAPIKeys called for:', userId);

    return {
        gemini: null,
        linkedin: null,
        naukri: null,
        indeed: null,
        gmail: null
    };
}
