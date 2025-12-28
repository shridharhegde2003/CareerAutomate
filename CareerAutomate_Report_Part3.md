# 4. ANALYSIS AND DESIGN

## 4.1 System Analysis

### 4.1.1 Existing System Analysis

Traditional job search methods involve manual processes that are time-consuming and inefficient:

**Manual Job Searching:** Users visit multiple job portals individually, search for relevant positions, and manually track applications using spreadsheets or notebooks.

**Resume Creation:** Users create resumes using word processors or basic templates, manually updating them for each application without data-driven optimization.

**Project Documentation:** Developers maintain GitHub repositories but rarely create professional descriptions suitable for resumes, leading to underutilization of their work history.

**Application Tracking:** Without centralized tracking, users often lose track of where they applied, when they applied, and what resume version they used.

**Limitations of Existing System:**
- High time investment with low return
- Inconsistent application quality
- No insights into job search performance
- Difficulty maintaining updated documentation
- Manual errors in tracking applications

### 4.1.2 Proposed System Analysis

CareerAutomate addresses these limitations through intelligent automation:

**Automated Integration:** Direct connection to GitHub for project synchronization and job portals for application submission eliminates manual data entry.

**AI-Powered Content:** Google Gemini AI generates professional descriptions and tailored resume content, ensuring high-quality output with minimal user effort.

**Centralized Management:** Single dashboard for all career-related activities provides comprehensive visibility and control.

**Data-Driven Insights:** Analytics and reporting features help users optimize their job search strategies based on actual performance data.

**Advantages of Proposed System:**
- Significant time savings through automation
- Consistent, professional-quality applications
- Real-time insights and recommendations
- Always up-to-date project documentation
- Comprehensive application tracking

## 4.2 System Design

### 4.2.1 Architectural Overview

CareerAutomate follows a microservices architecture pattern with twelve independent service stacks:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                    │
│                    Next.js Frontend (Vercel)                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                                      │
│                    AWS API Gateway / Lambda                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
    ┌───────────┐            ┌───────────┐            ┌───────────┐
    │   Auth    │            │  Projects │            │  Resume   │
    │   Stack   │            │   Stack   │            │   Stack   │
    └───────────┘            └───────────┘            └───────────┘
          │                         │                         │
          └─────────────────────────┼─────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                       │
│                Supabase (PostgreSQL + Auth + Storage)                   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2.2 Microservices Design

Each microservice stack is designed with specific responsibilities:

**1. Auth & Identity Stack**
- JWT validation and session management
- Role-based access control
- Shared authentication middleware

**2. Onboarding Profile Stack**
- User profile management
- Career preferences storage
- Job settings configuration

**3. Integrations Stack**
- OAuth token management
- Third-party service connections
- Encrypted credential storage

**4. GitHub Projects Stack**
- Repository synchronization
- Webhook event handling
- AI description generation
- Project video management

**5. Resume & Documents Stack**
- AI resume building
- PDF generation
- Version management
- Template handling

**6. Identity & Document Verification Stack**
- Certificate upload handling
- OCR processing
- Admin verification workflow

**7. Job Fetcher Stack**
- Multi-portal job fetching
- Job matching and scoring
- Scheduled sync operations

**8. Job Application Stack**
- Application submission
- Status tracking
- Auto-apply functionality

**9. Insights & Reports Stack**
- Analytics aggregation
- Report generation
- Dashboard data

**10. Notifications Stack**
- In-app notifications
- Email notifications
- User preferences

**11. API Management Stack**
- Platform API keys
- Key rotation
- Expiry management

**12. Admin Stack**
- User management
- System configuration
- Cross-stack orchestration

### 4.2.3 Database Design

The database schema is organized around core entities with Row-Level Security enabled for all user-owned tables.

**Core Tables:**

```
profiles
├── id (UUID, PK)
├── email (TEXT)
├── display_name (TEXT)
├── role (user|admin)
├── github_username (TEXT)
├── api_keys (JSONB)
├── created_at (TIMESTAMPTZ)
└── updated_at (TIMESTAMPTZ)

github_integrations
├── id (UUID, PK)
├── user_id (UUID, FK → profiles)
├── installation_id (BIGINT)
├── github_user_id (BIGINT)
├── github_username (TEXT)
├── access_token (TEXT)
├── refresh_token (TEXT)
├── is_active (BOOLEAN)
├── scopes (TEXT[])
└── created_at (TIMESTAMPTZ)

repositories
├── id (UUID, PK)
├── user_id (UUID, FK → profiles)
├── provider_repo_id (BIGINT)
├── name (TEXT)
├── full_name (TEXT)
├── html_url (TEXT)
├── description (TEXT)
├── description_ai (TEXT)
├── readme_content (TEXT)
├── language (TEXT)
├── topics (TEXT[])
├── stars_count (INTEGER)
├── has_intro_video (BOOLEAN)
├── last_synced_at (TIMESTAMPTZ)
└── sync_status (TEXT)

resumes
├── id (UUID, PK)
├── user_id (UUID, FK → profiles)
├── name (TEXT)
├── role_type (TEXT)
├── active_version_id (UUID)
├── auto_tailor_enabled (BOOLEAN)
└── created_at (TIMESTAMPTZ)

resume_versions
├── id (UUID, PK)
├── resume_id (UUID, FK → resumes)
├── content_json (JSONB)
├── pdf_storage_path (TEXT)
├── created_at (TIMESTAMPTZ)
└── source_repo_ids (TEXT[])

certificates
├── id (UUID, PK)
├── user_id (UUID, FK → profiles)
├── document_type (TEXT)
├── storage_path (TEXT)
├── ocr_extract_json (JSONB)
├── status (pending|verified|rejected)
├── rejection_notes (TEXT)
├── uploaded_at (TIMESTAMPTZ)
└── reviewed_by_admin_id (UUID)

fetched_jobs
├── id (UUID, PK)
├── user_id (UUID, FK → profiles)
├── portal (TEXT)
├── external_job_id (TEXT)
├── title (TEXT)
├── company (TEXT)
├── location (TEXT)
├── lpa_min (NUMERIC)
├── lpa_max (NUMERIC)
├── job_url (TEXT)
├── match_score (INTEGER)
├── status (new|reviewed|queued|applied)
└── fetched_at (TIMESTAMPTZ)

job_applications
├── id (UUID, PK)
├── user_id (UUID, FK → profiles)
├── fetched_job_id (UUID, FK → fetched_jobs)
├── resume_version_id (UUID)
├── status (pending|submitted|failed)
├── response_status (TEXT)
├── applied_at (TIMESTAMPTZ)
└── error_json (JSONB)

notifications
├── id (UUID, PK)
├── user_id (UUID, FK → profiles)
├── type (TEXT)
├── payload_json (JSONB)
├── read (BOOLEAN)
├── link_url (TEXT)
└── created_at (TIMESTAMPTZ)
```

### 4.2.4 Entity Relationship Diagram

```
┌──────────────┐     1:N     ┌──────────────────────┐
│   profiles   │◄───────────│  github_integrations │
└──────────────┘             └──────────────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐     1:N     ┌──────────────────────┐
│ repositories │◄───────────│    project_videos    │
└──────────────┘             └──────────────────────┘
       │
       │ Referenced by
       ▼
┌──────────────┐     1:N     ┌──────────────────────┐
│   resumes    │◄───────────│   resume_versions    │
└──────────────┘             └──────────────────────┘

┌──────────────┐     1:N     ┌──────────────────────┐
│   profiles   │◄───────────│   fetched_jobs       │
└──────────────┘             └──────────────────────┘
       │                              │
       │ 1:N                          │ 1:N
       ▼                              ▼
┌──────────────┐◄────────────┌──────────────────────┐
│ certificates │             │  job_applications    │
└──────────────┘             └──────────────────────┘
```

## 4.3 UML Diagrams

### 4.3.1 Use Case Diagram

**Actors:**
- User (Job Seeker)
- Administrator
- GitHub (External System)
- Gemini AI (External System)
- Job Portals (External Systems)

**User Use Cases:**
- Register/Login
- Complete Onboarding
- Connect GitHub Account
- View Projects
- Generate AI Descriptions
- Create Resume
- Download Resume
- Search Jobs
- Apply to Jobs
- View Applications
- Upload Certificates
- View Notifications
- Manage Settings

**Administrator Use Cases:**
- View All Users
- Verify Certificates
- Manage API Keys
- View System Reports
- Pause/Resume User Applications
- Send Broadcast Notifications

### 4.3.2 Sequence Diagram - GitHub Sync Flow

```
User        Frontend      GitHub Stack     GitHub API      Gemini AI       Database
 │              │              │               │               │              │
 │──[1] Click Sync──────►│               │               │              │
 │              │──[2] POST /projects/sync──►│              │              │
 │              │              │──[3] GET /user/repos─────►│              │
 │              │              │◄──[4] Repository List─────│              │
 │              │              │               │               │              │
 │              │              │──[5] Loop: For each repo──│              │
 │              │              │    │          │               │              │
 │              │              │    ├─[6] GET README────────►│              │
 │              │              │    │◄─[7] README Content────│              │
 │              │              │    │          │               │              │
 │              │              │    ├─[8] Check if exists───────────────────►│
 │              │              │    │◄─[9] Existing record───────────────────│
 │              │              │    │          │               │              │
 │              │              │    ├─[10] UPSERT repo─────────────────────►│
 │              │              │    │          │               │              │
 │              │              │──[11] End Loop│               │              │
 │              │              │               │               │              │
 │              │◄─[12] Sync Complete──│               │              │
 │◄─[13] Show Results─────│               │               │              │
```

### 4.3.3 Sequence Diagram - AI Description Generation

```
User        Frontend      GitHub Stack        Database        Gemini AI
 │              │              │                  │               │
 │──[1] Generate Description─►│                  │               │
 │              │──[2] POST /projects/:id/describe──►│           │
 │              │              │──[3] Get stored README──────────►│
 │              │              │◄──[4] README content─────────────│
 │              │              │                  │               │
 │              │              │──[5] Generate Summary───────────────────────►│
 │              │              │◄──[6] AI Generated Text─────────────────────│
 │              │              │                  │               │
 │              │              │──[7] Store description_ai────────►│
 │              │              │                  │               │
 │              │◄─[8] Return description──│               │
 │◄─[9] Show AI description───│                  │               │
```

### 4.3.4 Class Diagram - Core Entities

```
┌─────────────────────────────────────────────────┐
│                    User                          │
├─────────────────────────────────────────────────┤
│ - id: UUID                                       │
│ - email: String                                  │
│ - display_name: String                           │
│ - role: Enum(user, admin)                        │
│ - github_username: String                        │
├─────────────────────────────────────────────────┤
│ + register()                                     │
│ + login()                                        │
│ + updateProfile()                                │
│ + connectGitHub()                                │
└─────────────────────────────────────────────────┘
                    │
                    │ 1:N
                    ▼
┌─────────────────────────────────────────────────┐
│                Repository                        │
├─────────────────────────────────────────────────┤
│ - id: UUID                                       │
│ - name: String                                   │
│ - full_name: String                              │
│ - description_ai: String                         │
│ - readme_content: String                         │
│ - language: String                               │
├─────────────────────────────────────────────────┤
│ + sync()                                         │
│ + generateDescription()                          │
│ + getReadme()                                    │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                  Resume                          │
├─────────────────────────────────────────────────┤
│ - id: UUID                                       │
│ - name: String                                   │
│ - role_type: String                              │
│ - versions: List<ResumeVersion>                  │
├─────────────────────────────────────────────────┤
│ + create()                                       │
│ + build()                                        │
│ + download()                                     │
│ + autoTailor()                                   │
└─────────────────────────────────────────────────┘
```

## 4.4 Data Flow Diagram

### 4.4.1 Level 0 - Context Diagram

```
┌─────────────┐                                      ┌─────────────┐
│    User     │─────── Requests/Responses ──────────│   GitHub    │
└─────────────┘                                      │    API      │
       │                                             └─────────────┘
       │                                                    │
       ▼                                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                    CAREERAUTOMATE SYSTEM                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
       │                                                    │
       ▼                                                    ▼
┌─────────────┐                                      ┌─────────────┐
│   Admin     │                                      │  Gemini AI  │
└─────────────┘                                      └─────────────┘
       │
       ▼
┌─────────────┐
│ Job Portals │
└─────────────┘
```

### 4.4.2 Level 1 - Major Processes

```
                    ┌───────────────┐
    User ──────────►│ 1.0 Auth &    │──────────► JWT Token
                    │    Identity   │
                    └───────────────┘
                           │
                           ▼
                    ┌───────────────┐
    GitHub ────────►│ 2.0 Project   │──────────► Repositories
                    │    Sync       │
                    └───────────────┘
                           │
                           ▼
                    ┌───────────────┐
    Gemini ────────►│ 3.0 AI        │──────────► Descriptions
                    │    Generation │
                    └───────────────┘
                           │
                           ▼
                    ┌───────────────┐
    User ──────────►│ 4.0 Resume    │──────────► PDF Resumes
                    │    Builder    │
                    └───────────────┘
                           │
                           ▼
                    ┌───────────────┐
    Job Portals ───►│ 5.0 Job       │──────────► Applications
                    │    Automation │
                    └───────────────┘
```

---
