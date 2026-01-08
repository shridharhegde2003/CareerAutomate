# 5. IMPLEMENTATION

## 5.1 Development Environment Setup

### 5.1.1 Prerequisites

The following software and tools were installed for development:

- **Node.js 18.x** - JavaScript runtime for frontend development
- **Python 3.11** - Backend development language
- **Git** - Version control system
- **VS Code** - Primary IDE with extensions for Python, TypeScript, and Tailwind CSS
- **Postman** - API testing and documentation
- **Docker** - Local development containers (optional)

### 5.1.2 Project Structure

```
CareerAutomate/
├── frontend/                    # Next.js Frontend Application
│   ├── app/                     # App router pages
│   │   ├── (auth)/             # Authentication pages
│   │   ├── dashboard/          # Dashboard page
│   │   ├── projects/           # Projects page
│   │   ├── resumes/            # Resume management
│   │   ├── settings/           # User settings
│   │   └── admin/              # Admin pages
│   ├── components/             # Reusable UI components
│   ├── lib/                    # Utility functions
│   └── services/               # API service functions
│
├── Auth-Service/               # Authentication microservice
│   ├── main.py                 # FastAPI application
│   ├── auth.py                 # Authentication logic
│   ├── schemas.py              # Pydantic models
│   └── template.yaml           # SAM deployment template
│
├── Onboarding-Service/         # Onboarding microservice
│   ├── main.py
│   └── template.yaml
│
├── GitHub-Sync-Service/        # GitHub integration microservice
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   ├── sql/                    # Database migrations
│   └── .env                    # Environment variables
│
├── Resume-Service/             # Resume builder microservice
├── Job-Service/                # Job fetching microservice
├── Notification-Service/       # Notifications microservice
└── Admin-Service/              # Admin dashboard microservice
```

## 5.2 Frontend Implementation

### 5.2.1 Next.js Application Setup

The frontend was initialized using Create Next App with TypeScript and Tailwind CSS:

```bash
npx create-next-app@latest frontend --typescript --tailwind --app
cd frontend
npm install @supabase/supabase-js lucide-react
npx shadcn-ui@latest init
```

### 5.2.2 Supabase Client Configuration

**lib/supabase.ts**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to get current user
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
}

// Helper function to get session
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
}
```

### 5.2.3 Authentication Context

**contexts/AuthContext.tsx**
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error
    }

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
```

### 5.2.4 Dashboard Layout Component

**components/dashboard-layout.tsx**
```typescript
'use client'

import { useState } from 'react'
import { DashboardNav } from './dashboard-nav'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <Menu className="h-4 w-4" />
                </Button>
            </div>

            {/* Sidebar */}
            <DashboardNav 
                open={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />

            {/* Main content */}
            <main className="lg:pl-64 min-h-screen">
                {children}
            </main>
        </div>
    )
}
```

### 5.2.5 Projects Page with GitHub Integration

**app/projects/page.tsx** (Partial)
```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Github, RefreshCw, Sparkles } from 'lucide-react'

const GITHUB_SYNC_SERVICE_URL = process.env.NEXT_PUBLIC_GITHUB_SYNC_SERVICE_URL

interface Repository {
    id: string
    name: string
    full_name: string
    html_url: string
    description_ai: string | null
    language: string | null
    last_synced_at: string
}

export default function ProjectsPage() {
    const [repositories, setRepositories] = useState<Repository[]>([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)

    const syncRepositories = async () => {
        setSyncing(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            
            const response = await fetch(
                `${GITHUB_SYNC_SERVICE_URL}/v1/projects/sync`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
            
            const data = await response.json()
            // Refresh repository list
            await fetchRepositories()
        } catch (error) {
            console.error('Sync failed:', error)
        } finally {
            setSyncing(false)
        }
    }

    const generateAIDescription = async (repoId: string) => {
        const { data: { session } } = await supabase.auth.getSession()
        
        const response = await fetch(
            `${GITHUB_SYNC_SERVICE_URL}/v1/projects/${repoId}/describe`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ regenerate: true })
            }
        )
        
        const data = await response.json()
        // Update local state with new description
        setRepositories(prev => prev.map(repo =>
            repo.id === repoId 
                ? { ...repo, description_ai: data.description_ai }
                : repo
        ))
    }

    // Component render continues...
}
```

## 5.3 Backend Implementation

### 5.3.1 FastAPI Application Structure

**main.py - GitHub Sync Service**
```python
from fastapi import FastAPI, HTTPException, Depends, Header, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import httpx
import os
from google import genai
from supabase import create_client, Client
from jose import jwt, JWTError
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
JWT_SECRET = os.getenv("JWT_SECRET")
DEV_GEMINI_API_KEY = os.getenv("DEV_GEMINI_API_KEY")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# FastAPI App
app = FastAPI(
    title="GitHub Sync Service",
    description="Syncs GitHub projects and generates AI summaries",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5.3.2 Authentication Middleware

```python
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Verify JWT token and extract user_id."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    token = parts[1]
    
    try:
        # Validate token with Supabase
        user_response = supabase.auth.get_user(token)
        if user_response and user_response.user:
            return {
                "user_id": user_response.user.id,
                "email": user_response.user.email
            }
    except Exception:
        pass
    
    # Fallback to JWT decode
    try:
        payload = jwt.decode(
            token, 
            JWT_SECRET, 
            algorithms=["HS256"],
            options={"verify_aud": False}
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return {"user_id": user_id, "email": payload.get("email")}
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
```

### 5.3.3 GitHub Repository Sync Implementation

```python
@app.post("/v1/projects/sync")
async def sync_projects(current_user: dict = Depends(get_current_user)):
    """Sync repositories from GitHub with README content."""
    user_id = current_user["user_id"]
    
    # Get GitHub integration
    integration = supabase.table("github_integrations")\
        .select("*")\
        .eq("user_id", user_id)\
        .single()\
        .execute()
    
    if not integration.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="GitHub not connected"
        )
    
    access_token = integration.data["access_token"]
    
    # Fetch repositories from GitHub API
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.github.com/user/repos",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github.v3+json"
            },
            params={"type": "owner", "sort": "updated", "per_page": 100}
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to fetch from GitHub"
            )
        
        repos = response.json()
    
    # Sync each repository
    synced_count = 0
    for repo in repos:
        repo_data = {
            "user_id": user_id,
            "provider_repo_id": repo["id"],
            "name": repo["name"],
            "full_name": repo["full_name"],
            "html_url": repo["html_url"],
            "description": repo["description"],
            "language": repo.get("language"),
            "stars_count": repo.get("stargazers_count", 0),
            "last_synced_at": datetime.now(timezone.utc).isoformat(),
            "sync_status": "synced"
        }
        
        # Fetch README content for new repos
        readme = await fetch_readme_content(
            repo["full_name"].split("/")[0],
            repo["name"],
            access_token
        )
        if readme:
            repo_data["readme_content"] = readme[:15000]
        
        # Upsert to avoid duplicates
        supabase.table("repositories").upsert(
            repo_data,
            on_conflict="user_id,provider_repo_id"
        ).execute()
        
        synced_count += 1
    
    return {"success": True, "synced_count": synced_count}
```

### 5.3.4 AI Description Generation

```python
def generate_ai_summary(readme_content: str, api_key: str) -> str:
    """Generate AI summary using Google Gemini."""
    try:
        client = genai.Client(api_key=api_key)
        
        prompt = f"""Read this project documentation. 
Summarize the project into a professional, first-person description 
('I built...', 'Implemented...'). 
The summary must be exactly 4-5 lines long. 
Focus on the problem solved and the tech stack used. 
Do NOT use markdown. Do NOT use bullet points.

Project README:
{readme_content[:8000]}"""
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        
        if response and response.text:
            return response.text.strip()
        return "Project summary could not be generated."
        
    except Exception as e:
        error_msg = str(e).lower()
        if "quota" in error_msg or "rate" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Gemini API quota exceeded"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI summarization failed: {str(e)}"
        )

@app.post("/v1/projects/{repo_id}/describe")
async def describe_project(
    repo_id: str,
    request: DescribeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate AI description for a project."""
    user_id = current_user["user_id"]
    
    # Get repository
    repo = supabase.table("repositories")\
        .select("*")\
        .eq("id", repo_id)\
        .eq("user_id", user_id)\
        .single()\
        .execute()
    
    if not repo.data:
        raise HTTPException(status_code=404, detail="Repository not found")
    
    # Return existing if not regenerating
    if repo.data.get("description_ai") and not request.regenerate:
        return {"description_ai": repo.data["description_ai"]}
    
    # Use stored README content
    readme_content = repo.data.get("readme_content")
    if not readme_content:
        raise HTTPException(
            status_code=404,
            detail="No README content available"
        )
    
    # Generate AI summary
    gemini_key = get_gemini_api_key(user_id)
    ai_summary = generate_ai_summary(readme_content, gemini_key)
    
    # Store the generated description
    supabase.table("repositories").update({
        "description_ai": ai_summary
    }).eq("id", repo_id).execute()
    
    return {"description_ai": ai_summary}
```

### 5.3.5 GitHub OAuth Flow

```python
@app.get("/v1/github/authorize")
async def github_authorize(user_id: str):
    """Initiate GitHub OAuth flow."""
    state = secrets.token_urlsafe(32)
    oauth_states[state] = {"user_id": user_id}
    
    github_auth_url = (
        f"https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={SERVICE_URL}/v1/github/callback"
        f"&scope=read:user,repo"
        f"&state={state}"
    )
    
    return RedirectResponse(url=github_auth_url)

@app.get("/v1/github/callback")
async def github_callback(code: str, state: str):
    """Handle GitHub OAuth callback."""
    state_data = oauth_states.pop(state, None)
    if not state_data:
        return RedirectResponse(f"{FRONTEND_URL}/projects?error=Invalid+state")
    
    user_id = state_data["user_id"]
    
    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code
            },
            headers={"Accept": "application/json"}
        )
        
        token_data = token_response.json()
        access_token = token_data.get("access_token")
        
        # Get GitHub user info
        user_response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        github_user = user_response.json()
    
    # Store integration
    supabase.table("github_integrations").upsert({
        "user_id": user_id,
        "github_user_id": github_user["id"],
        "github_username": github_user["login"],
        "access_token": access_token,
        "is_active": True
    }, on_conflict="user_id").execute()
    
    return RedirectResponse(f"{FRONTEND_URL}/projects?github_connected=true")
```

## 5.4 Database Implementation

### 5.4.1 Migration Script

```sql
-- Create GitHub Integrations Table
CREATE TABLE IF NOT EXISTS public.github_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    github_user_id BIGINT NOT NULL,
    github_username TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    scopes TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id),
    UNIQUE(github_user_id)
);

-- Create Repositories Table
CREATE TABLE IF NOT EXISTS public.repositories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_repo_id BIGINT NOT NULL,
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    html_url TEXT NOT NULL,
    description TEXT,
    description_ai TEXT,
    readme_content TEXT,
    default_branch TEXT DEFAULT 'main',
    language TEXT,
    topics TEXT[],
    stars_count INTEGER DEFAULT 0,
    has_intro_video BOOLEAN DEFAULT FALSE,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    sync_status TEXT DEFAULT 'synced',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider_repo_id)
);

-- Enable Row Level Security
ALTER TABLE public.github_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own integrations"
ON public.github_integrations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own repositories"
ON public.repositories FOR SELECT
USING (auth.uid() = user_id);

-- Create Indexes
CREATE INDEX idx_repositories_user_id ON public.repositories(user_id);
CREATE INDEX idx_repositories_last_synced ON public.repositories(last_synced_at);
```

## 5.5 Deployment Configuration

### 5.5.1 AWS SAM Template

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: GitHub Sync Service

Globals:
  Function:
    Timeout: 30
    Runtime: python3.11
    MemorySize: 256

Resources:
  GitHubSyncFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: main.handler
      CodeUri: ./
      Environment:
        Variables:
          SUPABASE_URL: !Ref SupabaseUrl
          SUPABASE_KEY: !Ref SupabaseKey
          JWT_SECRET: !Ref JwtSecret
          GITHUB_CLIENT_ID: !Ref GithubClientId
          GITHUB_CLIENT_SECRET: !Ref GithubClientSecret
      Events:
        ApiEvent:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: ANY

Outputs:
  ApiUrl:
    Description: API Gateway endpoint URL
    Value: !Sub 'https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/'
```

---
