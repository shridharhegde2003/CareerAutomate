# CareerAutoMate - Development Progress

> **Note**: This README tracks development progress. Final documentation will be added upon project completion.

## Project Overview
CareerAutoMate is a job automation platform with OAuth authentication, dynamic onboarding, and a comprehensive dashboard for managing job search activities.

## Tech Stack
- **Backend**: FastAPI (Python)
- **Frontend**: Next.js 14 (React, TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: OAuth (Google, GitHub) via Supabase

---

## ✅ Completed Features

### 1. Authentication System
- **OAuth Integration**: Google and GitHub login via Supabase
- **Smart Redirection**:
  - New users → Onboarding flow
  - Existing users → Dashboard
- **Session Management**: Supabase handles tokens and session persistence
- **Logout**: Available on all dashboard pages via profile avatar dropdown

**Backend Endpoints** (`Auth-Service-main/auth.py`):
```
POST /auth/register
POST /auth/login
GET  /auth/google/login
GET  /auth/google/callback
GET  /auth/github/login
GET  /auth/github/callback
```

---

### 2. Dynamic Onboarding Flow (5 Steps)

**Route**: `/onboarding`

#### Step 1: Personal Details
- Full name, DOB, secondary email, phone, address
- LinkedIn URL, GitHub username
- Skills (dynamic add/remove)
- Education details (multiple entries)
- **File Uploads**:
  - Profile photo → `profile-photos` bucket
  - Government ID → `government-ids` bucket (1MB max, private)

#### Step 2: Career Preferences
- Preferred job roles (multi-select)
- Target LPA (salary)
- Preferred locations (multi-select)
- Work preference (remote/hybrid/on-site)
- Other preferences

#### Step 3: Account Connections
- GitHub integration (UI placeholder)
- Job platform connections (UI placeholder)

#### Step 4: API Keys Collection
- Gemini AI API key (required)
- LinkedIn API key
- Naukri API key
- Indeed API key
- Gmail API key
- **Instructions modals** for each platform

#### Step 5: Review & Submit
- Displays ALL user-entered data dynamically
- Final submission creates profile in database
- Redirects to dashboard

**Component**: `frontend/components/onboarding-form.tsx`

---

### 3. Dashboard Application

All pages include:
- ✅ Sidebar navigation
- ✅ Profile avatar with logout dropdown
- ✅ Authentication guards (redirect to login if not authenticated)

#### A. Dashboard (`/dashboard`)
**Stats Overview**:
- Job Search Status (toggle active/inactive)
- Verified Certificates count
- Projects Synced count
- Resume Versions (X/10)
- Skill Gap Alerts

**Actions**: Navigate to Projects, Reports, Settings

---

#### B. Projects Page (`/projects`)
- Lists all GitHub-connected projects
- Video status tracking (No Video, Video Uploaded, Processing)
- Project status badges (New, In Progress, Completed)
- Record/Upload Video functionality (placeholder)
- Regenerate Description button
- Pagination

---

#### C. Documents Page (`/documents`)

**Tab 1: AI Resume Builder**
- Shows resume count (X/10 limit enforced)
- Lists all resumes with role badges
- Edit and Download PDF buttons
- Auto-tailor toggle for job matching
- Create New Resume button

**Tab 2: Certificates & Documents**
- **Upload Section**:
  - Document type selector (10th, 12th, UG, PG, Diploma, Online Course, etc.)
  - File upload (PDF, JPG, PNG, max 2MB)
  - Uploads to → `certificates-documents` bucket (private)
- **Documents List**:
  - All uploaded certificates with metadata
  - **Actions**: Rename, Download, Delete
  - Rename dialog for changing document names
  - Delete confirmation

---

#### D. Reports Page (`/reports`)
- **Filters**: Type of Work, Job Type, Location, Date Range
- **Analytics Cards**:
  - Application Summary (with mini bar chart)
  - Resume Performance (80% circular progress)
  - Skill Gap Analytics (6 gaps identified)
- Export to CSV/PDF buttons
- Placeholder for detailed charts

---

#### E. Notifications Page (`/notifications`)
- Notification feed
- Mark as read functionality
- "New" badge for unread items
- Timestamp for each notification

---

#### F. Settings/Profile Page (`/settings`)

Displays ALL onboarding data in editable sections:

**Personal Details** (Editable):
- ❌ Full Name (Cannot edit - as designed)
- ✅ Email, DOB, Phone, Address

**Academic Details** (Editable):
- University, Degree, Specialization, Graduation Year
- Displays all education entries from onboarding

**Career Preferences** (Editable):
- Job Titles, Job Type, Desired Salary
- Work Location, Preferred Industry

**API Keys** (Editable):
- GitHub API Key (password masked)
- Edit and Delete buttons

**Social Account Connections**:
- GitHub (shows connection status)
- LinkedIn (Connect button)

Each section has Edit button → Cancel/Save workflow

---

## 📁 Database Schema

### Tables Created

#### 1. `profiles`
```sql
- id UUID (references auth.users)
- full_name TEXT
- dob TEXT
- secondary_email TEXT
- phone_number TEXT
- address TEXT
- linkedin_url TEXT
- github_username TEXT
- skills TEXT[]
- education JSONB
- career_preferences JSONB
- api_keys JSONB
- profile_photo_url TEXT
- govt_id_url TEXT
```

#### 2. `job_search_status`
```sql
- id UUID
- user_id UUID
- is_active BOOLEAN
- resume_versions INTEGER
- skill_gap_alerts INTEGER
```

#### 3. `projects`
```sql
- id UUID
- user_id UUID
- repo_name TEXT
- description TEXT
- video_url TEXT
- video_status TEXT
- status TEXT
```

#### 4. `documents`
```sql
- id UUID
- user_id UUID
- document_type TEXT (resume, cover_letter)
- title TEXT
- role TEXT
- file_url TEXT
- auto_tailor BOOLEAN
```

#### 5. `certificate_documents`
```sql
- id UUID
- user_id UUID
- document_name TEXT
- document_type TEXT
- file_url TEXT
- file_name TEXT
- file_size INTEGER
- file_type TEXT
```

#### 6. `certificates`
```sql
- id UUID
- user_id UUID
- certificate_name TEXT
- issuing_organization TEXT
- issue_date DATE
- certificate_url TEXT
- verified BOOLEAN
```

#### 7. `skill_gaps`
```sql
- id UUID
- user_id UUID
- skill_name TEXT
- gap_level TEXT
- recommended_action TEXT
- status TEXT
```

#### 8. `notifications`
```sql
- id UUID
- user_id UUID
- title TEXT
- message TEXT
- type TEXT
- is_read BOOLEAN
```

**All tables have Row Level Security (RLS) enabled** - users can only access their own data.

---

## 💾 Supabase Storage Buckets

### 1. `profile-photos`
- **Privacy**: PUBLIC
- **Types**: image/jpeg, image/jpg, image/png
- **Size**: 2MB max
- **Usage**: User profile pictures

### 2. `government-ids`
- **Privacy**: PRIVATE
- **Types**: jpeg, jpg, png, pdf
- **Size**: 1MB max
- **Usage**: Government ID verification during onboarding

### 3. `certificates-documents`
- **Privacy**: PRIVATE
- **Types**: application/pdf, image/jpeg, image/jpg, image/png
- **Size**: 2MB max
- **Usage**: Academic certificates, mark sheets, course certificates

---

## 🔧 Setup & Configuration

### Backend (Auth-Service-main)
```bash
cd Auth-Service-main
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

**Runs on**: `http://localhost:8000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

**Runs on**: `http://localhost:3000`

### Environment Variables

**Backend** (`.env`):
```
SUPABASE_URL=https://sapmqweflhqfprkjoikk.supabase.co
SUPABASE_KEY=<service_role_key>
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://sapmqweflhqfprkjoikk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
```

---

## 🔄 User Flow

```
1. Homepage (/) → Click "Login"
   ↓
2. Login Page → OAuth (Google/GitHub)
   ↓
3. Backend OAuth Callback → Check profile exists?
   ├─ No → Redirect to /onboarding
   └─ Yes → Redirect to /dashboard
   ↓
4. If Onboarding:
   - Complete 5-step form
   - Upload files (profile photo, govt ID)
   - Submit → Create profile
   - Redirect to /dashboard
   ↓
5. Dashboard:
   - Access all features
   - View stats
   - Navigate between pages
   - Upload certificates
   - Edit profile
   - Logout (returns to homepage)
```

---

## 🎯 Current Status

### Fully Functional ✅
- OAuth authentication (Google, GitHub)
- 5-step dynamic onboarding with file uploads
- Dashboard with stats overview
- Projects page with GitHub integration (UI)
- Documents page with resume builder & certificate upload
- Reports page with analytics
- Notifications system
- Settings page with editable profile
- Logout functionality on all pages
- Authentication guards on all protected routes
- File upload/download/delete for certificates
- Database with RLS policies
- Supabase Storage integration

### Placeholders 🔄
- GitHub project auto-sync (Step 3 in onboarding)
- Job platform connections (Step 3 in onboarding)
- Actual AI resume generation
- Video recording/upload for projects
- Detailed analytics charts in Reports
- Real-time notifications

---

## 📝 Notes

- All dashboard pages require authentication
- OAuth flow managed by backend (FastAPI)
- Profile data from onboarding is editable in Settings (except name and govt ID)
- Certificates storage is private with 2MB limit
- Resume limit is 10 per user
- All file uploads go to Supabase Storage
- Session persists in browser until logout

---

## 🚀 Next Steps (To Be Implemented)

_This section will be updated as new features are added_

---

**Last Updated**: November 25, 2024
**Status**: Phase 1 Complete - Authentication, Onboarding, Dashboard
