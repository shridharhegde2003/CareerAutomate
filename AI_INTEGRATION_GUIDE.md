# AI Microservice Integration Guide

## Overview
This document outlines where AI-powered features will be integrated in the frontend and how they'll connect to future microservices.

---

## Current Status

✅ **Completed**:
- Frontend structure ready for microservice integration
- Placeholder API functions created in `frontend/lib/api-services.ts`
- TODO comments added at all integration points
- Database schema supports AI-generated content

⏳ **Pending**:
- AI-Service microservice (port 8001)
- Job-Service microservice (port 8002)
- Analytics-Service microservice (port 8003)

---

## Integration Points

### 1. Documents Page - AI Resume Generation

**File**: `frontend/app/documents/page.tsx`  
**Function**: `handleCreateResume()`  
**Lines**: ~219-262

**What It Does**:
- User clicks "Create New Resume" button
- Calls AI-Service to generate resume using LLM (Gemini/GPT-4)
- Uses user profile data (education, skills, experience)
- Saves generated resume to database

**Microservice Call**:
```typescript
const result = await generateAIResume({
  userId: user.id,
  targetRole: 'Software Engineer',
  userProfile: profileData
});
```

**Current Behavior**: Shows alert that feature is coming soon

---

### 2. Documents Page - Resume Tailoring

**File**: `frontend/app/documents/page.tsx`  
**Function**: `toggleAutoTailor()`  
**Lines**: ~206-228

**What It Does**:
- User toggles "Auto-Tailor" switch
- When enabled, AI modifies resume to match job description
- Optimizes keywords for ATS (Applicant Tracking Systems)
- Improves match score with target job

**Microservice Call**:
```typescript
const result = await tailorResume({
  resumeId: docId,
  jobDescription: jobDescString
});
```

**Current Behavior**: Only updates toggle state in database

---

### 3. Dashboard - Skill Gap Analysis

**File**: `frontend/app/dashboard/page.tsx`  
**Function**: `fetchDashboardData()`  
**Lines**: ~74-100

**What It Does**:
- Analyzes user's current skills vs job market
- Identifies missing skills for target roles
- Provides learning recommendations
- Updates "Skill Gap Alerts" count on dashboard

**Microservice Call**:
```typescript
const skillAnalysis = await analyzeSkillGaps({
  userId: user.id,
  currentSkills: profile.skills,
  targetRole: profile.career_preferences.preferred_roles[0]
});
```

**Current Behavior**: Fetches count from `skill_gaps` table (manual data)

---

### 4. Reports Page - Analytics

**File**: `frontend/app/reports/page.tsx`  
**Lines**: ~15-32

**What It Does**:
- Fetches application statistics
- Shows resume performance metrics
- Displays skill market trends
- Generates charts and insights

**Microservice Calls**:
```typescript
const analytics = await getApplicationAnalytics(userId);
const resumePerf = await analyzeResumePerformance({ resumeId });
const skillTrends = await getSkillTrends();
```

**Current Behavior**: Displays mock/placeholder data

---

## How to Implement AI Services

### Step 1: Create AI-Service Microservice

```bash
mkdir AI-Service
cd AI-Service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn langchain google-generativeai openai
```

### Step 2: Create main.py

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/ai/resume/generate")
async def generate_resume(request: dict):
    # TODO: Implement using Gemini/GPT-4
    # 1. Get user profile data
    # 2. Create prompt for LLM
    # 3. Generate resume content
    # 4. Return formatted resume
    pass

@app.post("/ai/resume/tailor")
async def tailor_resume(request: dict):
    # TODO: Implement resume tailoring
    pass

@app.post("/ai/skills/analyze")
async def analyze_skills(request: dict):
    # TODO: Implement skill gap analysis
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

### Step 3: Update Frontend

**Uncomment in `frontend/app/documents/page.tsx`**:
```typescript
// Line 23-24
import { generateAIResume, tailorResume } from "@/lib/api-services";
```

**Uncomment function body in `handleCreateResume()`** (lines ~227-258)

### Step 4: Test Integration

1. Start AI-Service: `python main.py`
2. Start frontend: `npm run dev`
3. Click "Create New Resume"
4. Verify API call to `http://localhost:8001/ai/resume/generate`

---

## API Keys Usage

User API keys (collected during onboarding) will be used by microservices:

**Stored in**: `profiles.api_keys` (JSONB column)

**Keys Collected**:
- `gemini`: For Gemini AI (resume generation, skill analysis)
- `linkedin`: For LinkedIn API (job search)
- `naukri`: For Naukri API (job search)
- `indeed`: For Indeed API (job search)
- `gmail`: For Gmail API (email notifications)

**How Microservices Access**:
```python
# In AI-Service endpoint
user_api_keys = get_user_api_keys(user_id)
gemini_client = genai.configure(api_key=user_api_keys['gemini'])
```

---

## Testing Checklist

### Before AI-Service Implementation
- [x] Placeholder functions created
- [x] TODO comments added at integration points
- [x] Database schema supports AI content
- [x] Frontend shows "Coming Soon" alerts

### After AI-Service Implementation
- [ ] AI-Service runs on port 8001
- [ ] Resume generation works
- [ ] Resume tailoring works
- [ ] Skill gap analysis works
- [ ] Frontend successfully calls AI-Service
- [ ] Generated content saves to database
- [ ] User sees AI-generated resumes

---

## File Reference

| File | Purpose | Lines Modified |
|:-----|:--------|:--------------|
| `frontend/lib/api-services.ts` | API utility functions | All (new file) |
| `frontend/app/documents/page.tsx` | Resume generation & tailoring | 23-24, 206-262, 374-384 |
| `frontend/app/dashboard/page.tsx` | Skill gap analysis | 13-14, 74-100 |
| `frontend/app/reports/page.tsx` | Analytics integration | 13-14, 15-32 |

---

## Quick Start Commands

**View all TODO comments**:
```bash
cd frontend
grep -rn "TODO.*AI-Service" app/
grep -rn "TODO.*microservice" app/
```

**Start working on AI features**:
```bash
# 1. Create AI-Service
mkdir AI-Service && cd AI-Service
python -m venv venv && source venv/bin/activate

# 2. Install dependencies
pip install fastapi uvicorn langchain google-generativeai

# 3. Create main.py (see Step 2 above)

# 4. Run service
python main.py

# 5. Uncomment frontend code and test
```

---

**All AI integration points are documented and ready for implementation!** 🚀
