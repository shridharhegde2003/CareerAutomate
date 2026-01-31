' CareerAutomate - PowerPoint Presentation VBA Script
' Instructions: Open PowerPoint > Press Alt+F11 > Insert > Module > Paste this code > Press F5 to Run

Sub CreatePresentation()
    Dim pptPres As Presentation
    Dim pptSlide As Slide
    Dim shp As Shape
    
    Set pptPres = Application.Presentations.Add
    
    ' SLIDE 1: TITLE SLIDE
    Set pptSlide = pptPres.Slides.Add(1, ppLayoutTitle)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "CAREERAUTOMATE"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Size = 44
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes(2).TextFrame.TextRange.Text = "AI-Powered Career Automation Platform" & vbCrLf & vbCrLf & _
        "Team Members:" & vbCrLf & _
        "[Name 1] - [USN 1]" & vbCrLf & _
        "[Name 2] - [USN 2]" & vbCrLf & _
        "[Name 3] - [USN 3]" & vbCrLf & _
        "[Name 4] - [USN 4]" & vbCrLf & vbCrLf & _
        "Guide: [Guide Name]"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 18
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 2: CONTENTS
    Set pptSlide = pptPres.Slides.Add(2, ppLayoutText)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "CONTENTS"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes(2).TextFrame.TextRange.Text = _
        "1. Introduction" & vbCrLf & _
        "2. Problem Statement" & vbCrLf & _
        "3. Proposed Solution" & vbCrLf & _
        "4. Objectives" & vbCrLf & _
        "5. System Architecture" & vbCrLf & _
        "6. Technology Stack" & vbCrLf & _
        "7. Modules and Features" & vbCrLf & _
        "8. Database Design" & vbCrLf & _
        "9. AI Integration" & vbCrLf & _
        "10. Implementation" & vbCrLf & _
        "11. Testing" & vbCrLf & _
        "12. Results and Screenshots" & vbCrLf & _
        "13. Conclusion" & vbCrLf & _
        "14. Future Scope" & vbCrLf & _
        "15. References"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 22
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 3: INTRODUCTION
    Set pptSlide = pptPres.Slides.Add(3, ppLayoutText)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "INTRODUCTION"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes(2).TextFrame.TextRange.Text = _
        "CareerAutomate is an AI-powered career automation platform designed to streamline the job search process." & vbCrLf & vbCrLf & _
        "Key Highlights:" & vbCrLf & _
        "  - Automates repetitive job searching tasks" & vbCrLf & _
        "  - Leverages Google Gemini AI for intelligent features" & vbCrLf & _
        "  - Built using modern microservices architecture" & vbCrLf & _
        "  - Deployed on AWS Lambda (serverless)" & vbCrLf & _
        "  - Uses Supabase for database and authentication" & vbCrLf & vbCrLf & _
        "The platform connects with GitHub, LinkedIn, Naukri, and Indeed to provide a comprehensive career management solution."
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 20
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 4: PROBLEM STATEMENT
    Set pptSlide = pptPres.Slides.Add(4, ppLayoutText)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "PROBLEM STATEMENT"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes(2).TextFrame.TextRange.Text = _
        "1. Time-Consuming Manual Processes" & vbCrLf & _
        "   - Job seekers spend 11+ hours per week on job searching" & vbCrLf & _
        "   - 50-100 applications required before receiving an offer" & vbCrLf & vbCrLf & _
        "2. Inconsistent Personal Branding" & vbCrLf & _
        "   - GitHub projects lack professional descriptions" & vbCrLf & _
        "   - Maintaining profiles across platforms is difficult" & vbCrLf & vbCrLf & _
        "3. Lack of Data-Driven Insights" & vbCrLf & _
        "   - No visibility into resume performance" & vbCrLf & _
        "   - Skill gaps are not identified" & vbCrLf & vbCrLf & _
        "4. Missed Opportunities" & vbCrLf & _
        "   - Manual application processes are too slow"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 18
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 5: PROPOSED SOLUTION
    Set pptSlide = pptPres.Slides.Add(5, ppLayoutText)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "PROPOSED SOLUTION"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes(2).TextFrame.TextRange.Text = _
        "1. Automated GitHub Project Synchronization" & vbCrLf & _
        "   - OAuth-based GitHub connection" & vbCrLf & _
        "   - AI-generated professional project descriptions" & vbCrLf & vbCrLf & _
        "2. Intelligent Resume Builder" & vbCrLf & _
        "   - AI-powered resume generation" & vbCrLf & _
        "   - Multiple templates and auto-tailoring" & vbCrLf & vbCrLf & _
        "3. Multi-Portal Job Aggregation" & vbCrLf & _
        "   - Fetch jobs from LinkedIn, Naukri, Indeed" & vbCrLf & vbCrLf & _
        "4. Comprehensive Analytics Dashboard" & vbCrLf & _
        "   - Application tracking and performance metrics"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 18
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 6: OBJECTIVES
    Set pptSlide = pptPres.Slides.Add(6, ppLayoutText)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "OBJECTIVES"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes(2).TextFrame.TextRange.Text = _
        "1. Develop a scalable microservices-based platform for career automation" & vbCrLf & vbCrLf & _
        "2. Integrate AI capabilities for intelligent resume and description generation" & vbCrLf & vbCrLf & _
        "3. Automate job fetching from multiple job portals" & vbCrLf & vbCrLf & _
        "4. Implement automated job application with tracking" & vbCrLf & vbCrLf & _
        "5. Provide a comprehensive dashboard for career management" & vbCrLf & vbCrLf & _
        "6. Ensure security through JWT authentication and Row-Level Security" & vbCrLf & vbCrLf & _
        "7. Deploy using serverless architecture for cost efficiency"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 20
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 7: SYSTEM ARCHITECTURE
    Set pptSlide = pptPres.Slides.Add(7, ppLayoutText)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "SYSTEM ARCHITECTURE"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes(2).TextFrame.TextRange.Text = _
        "The platform follows a Microservices Architecture with 12 independent service stacks:" & vbCrLf & vbCrLf & _
        "Frontend Layer:" & vbCrLf & _
        "  - Next.js 14 with React and TypeScript" & vbCrLf & vbCrLf & _
        "API Gateway Layer:" & vbCrLf & _
        "  - AWS API Gateway" & vbCrLf & vbCrLf & _
        "Microservices Layer (AWS Lambda):" & vbCrLf & _
        "  - Auth Service, GitHub Service, Resume Service" & vbCrLf & _
        "  - Jobs Service, Notifications Service, Reports Service" & vbCrLf & _
        "  - Documents Service, Admin Service" & vbCrLf & vbCrLf & _
        "Database Layer:" & vbCrLf & _
        "  - Supabase (PostgreSQL) with Row-Level Security" & vbCrLf & _
        "  - Supabase Storage for file management"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 16
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 8: TECHNOLOGY STACK
    Set pptSlide = pptPres.Slides.Add(8, ppLayoutText)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "TECHNOLOGY STACK"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes(2).TextFrame.TextRange.Text = _
        "Frontend:" & vbCrLf & _
        "  - Next.js 14, React, TypeScript, shadcn/ui, Tailwind CSS" & vbCrLf & vbCrLf & _
        "Backend:" & vbCrLf & _
        "  - Python 3.11, FastAPI, Pydantic" & vbCrLf & vbCrLf & _
        "Database:" & vbCrLf & _
        "  - Supabase (PostgreSQL), Row-Level Security" & vbCrLf & vbCrLf & _
        "Authentication:" & vbCrLf & _
        "  - Supabase Auth, JWT, OAuth 2.0 (Google, GitHub)" & vbCrLf & vbCrLf & _
        "AI/ML:" & vbCrLf & _
        "  - Google Gemini 2.5 Flash" & vbCrLf & vbCrLf & _
        "Deployment:" & vbCrLf & _
        "  - AWS Lambda, AWS SAM, API Gateway"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 18
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 9: MODULES - PART 1
    Set pptSlide = pptPres.Slides.Add(9, ppLayoutText)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "MODULES AND FEATURES - I"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes(2).TextFrame.TextRange.Text = _
        "1. Authentication Module" & vbCrLf & _
        "   - Email/Password and OAuth login (Google, GitHub)" & vbCrLf & _
        "   - JWT-based session management" & vbCrLf & _
        "   - Role-based access control (User/Admin)" & vbCrLf & vbCrLf & _
        "2. Onboarding Module (5-Step Workflow)" & vbCrLf & _
        "   - Personal details and education" & vbCrLf & _
        "   - Career preferences (roles, salary, locations)" & vbCrLf & _
        "   - Account connections and API keys" & vbCrLf & vbCrLf & _
        "3. GitHub Integration Module" & vbCrLf & _
        "   - OAuth-based repository synchronization" & vbCrLf & _
        "   - README content extraction" & vbCrLf & _
        "   - AI-generated project descriptions using Gemini"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 18
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 10: MODULES - PART 2
    Set pptSlide = pptPres.Slides.Add(10, ppLayoutText)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "MODULES AND FEATURES - II"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes(2).TextFrame.TextRange.Text = _
        "4. Resume Builder Module" & vbCrLf & _
        "   - Multiple templates (Modern, Classic, Creative)" & vbCrLf & _
        "   - AI-powered content generation" & vbCrLf & _
        "   - PDF generation and download" & vbCrLf & _
        "   - Up to 10 resume versions per user" & vbCrLf & vbCrLf & _
        "5. Job Management Module" & vbCrLf & _
        "   - Multi-portal job fetching (LinkedIn, Naukri, Indeed)" & vbCrLf & _
        "   - Job matching and scoring" & vbCrLf & _
        "   - Application status tracking" & vbCrLf & vbCrLf & _
        "6. Document Management Module" & vbCrLf & _
        "   - Certificate upload and storage" & vbCrLf & _
        "   - Admin verification workflow" & vbCrLf & _
        "   - Document rename, download, delete operations"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 18
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 11: DATABASE DESIGN
    Set pptSlide = pptPres.Slides.Add(11, ppLayoutText)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "DATABASE DESIGN"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes(2).TextFrame.TextRange.Text = _
        "Core Tables (Supabase PostgreSQL):" & vbCrLf & vbCrLf & _
        "  - profiles: User information and settings" & vbCrLf & _
        "  - github_integrations: OAuth tokens and GitHub data" & vbCrLf & _
        "  - repositories: Synced GitHub repositories" & vbCrLf & _
        "  - resumes: Resume metadata" & vbCrLf & _
        "  - resume_versions: Version history with PDF paths" & vbCrLf & _
        "  - documents: User uploaded documents" & vbCrLf & _
        "  - certificates: Verified certificates" & vbCrLf & _
        "  - fetched_jobs: Job listings from portals" & vbCrLf & _
        "  - notifications: User notifications" & vbCrLf & vbCrLf & _
        "Security:" & vbCrLf & _
        "  - Row-Level Security (RLS) enabled on all tables" & vbCrLf & _
        "  - Users can only access their own data"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 18
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 12: AI INTEGRATION
    Set pptSlide = pptPres.Slides.Add(12, ppLayoutText)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "AI INTEGRATION"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes(2).TextFrame.TextRange.Text = _
        "Google Gemini 2.5 Flash Integration:" & vbCrLf & vbCrLf & _
        "BYOK (Bring Your Own Key) Approach:" & vbCrLf & _
        "  - Users provide their personal Gemini API keys" & vbCrLf & _
        "  - Ensures cost control and platform scalability" & vbCrLf & _
        "  - API keys stored encrypted in database" & vbCrLf & vbCrLf & _
        "AI-Powered Features:" & vbCrLf & vbCrLf & _
        "  1. Project Description Generation" & vbCrLf & _
        "     - Analyzes README content from GitHub" & vbCrLf & _
        "     - Generates professional first-person descriptions" & vbCrLf & vbCrLf & _
        "  2. Resume Content Generation" & vbCrLf & _
        "     - Tailors content based on target job role" & vbCrLf & _
        "     - Incorporates user skills and projects"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 18
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 13: TESTING
    Set pptSlide = pptPres.Slides.Add(13, ppLayoutText)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "TESTING"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes(2).TextFrame.TextRange.Text = _
        "Testing Methodology:" & vbCrLf & vbCrLf & _
        "1. API Testing" & vbCrLf & _
        "   - Used Postman for testing all REST API endpoints" & vbCrLf & _
        "   - Validated request/response formats and status codes" & vbCrLf & vbCrLf & _
        "2. Manual System Testing" & vbCrLf & _
        "   - End-to-end testing of all user workflows" & vbCrLf & _
        "   - Login, onboarding, dashboard, resume generation" & vbCrLf & vbCrLf & _
        "3. User Acceptance Testing (UAT)" & vbCrLf & _
        "   - Tested with sample users for feedback" & vbCrLf & _
        "   - Validated usability and functionality" & vbCrLf & vbCrLf & _
        "4. Security Testing" & vbCrLf & _
        "   - Verified JWT token validation" & vbCrLf & _
        "   - Tested Row-Level Security policies"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 18
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 14: RESULTS
    Set pptSlide = pptPres.Slides.Add(14, ppLayoutText)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "RESULTS AND SCREENSHOTS"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes(2).TextFrame.TextRange.Text = _
        "Successfully Implemented Features:" & vbCrLf & vbCrLf & _
        "  - OAuth authentication (Google, GitHub)" & vbCrLf & _
        "  - 5-step dynamic onboarding with file uploads" & vbCrLf & _
        "  - Dashboard with stats overview" & vbCrLf & _
        "  - Projects page with GitHub integration" & vbCrLf & _
        "  - Documents page with resume builder and certificate upload" & vbCrLf & _
        "  - Reports page with analytics" & vbCrLf & _
        "  - Notifications system" & vbCrLf & _
        "  - Settings page with editable profile" & vbCrLf & _
        "  - File upload/download/delete functionality" & vbCrLf & _
        "  - Database with RLS policies" & vbCrLf & _
        "  - Supabase Storage integration" & vbCrLf & vbCrLf & _
        "[Insert Screenshots Here]"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 18
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 15: CONCLUSION
    Set pptSlide = pptPres.Slides.Add(15, ppLayoutText)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "CONCLUSION"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes(2).TextFrame.TextRange.Text = _
        "CareerAutomate successfully demonstrates the practical application of modern software engineering principles:" & vbCrLf & vbCrLf & _
        "Key Achievements:" & vbCrLf & _
        "  - Built a comprehensive AI-powered career automation platform" & vbCrLf & _
        "  - Implemented microservices architecture for scalability" & vbCrLf & _
        "  - Deployed using serverless computing (AWS Lambda)" & vbCrLf & _
        "  - Integrated Google Gemini AI for intelligent features" & vbCrLf & _
        "  - Implemented secure authentication and authorization" & vbCrLf & vbCrLf & _
        "Benefits:" & vbCrLf & _
        "  - Reduces time spent on manual job searching" & vbCrLf & _
        "  - Provides AI-generated professional content" & vbCrLf & _
        "  - Centralizes career management in one platform"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 18
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 16: FUTURE SCOPE
    Set pptSlide = pptPres.Slides.Add(16, ppLayoutText)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "FUTURE SCOPE"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes(2).TextFrame.TextRange.Text = _
        "Planned Enhancements:" & vbCrLf & vbCrLf & _
        "  1. Real-time GitHub webhooks for instant project sync" & vbCrLf & vbCrLf & _
        "  2. Advanced job matching using Machine Learning algorithms" & vbCrLf & vbCrLf & _
        "  3. Video resume recording and processing" & vbCrLf & vbCrLf & _
        "  4. AI-powered interview preparation with mock interviews" & vbCrLf & vbCrLf & _
        "  5. Mobile application development (iOS and Android)" & vbCrLf & vbCrLf & _
        "  6. Integration with additional job portals globally" & vbCrLf & vbCrLf & _
        "  7. Skill gap analysis with course recommendations"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 20
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 17: REFERENCES
    Set pptSlide = pptPres.Slides.Add(17, ppLayoutText)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "REFERENCES"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes(2).TextFrame.TextRange.Text = _
        "1. Next.js Documentation - https://nextjs.org/docs" & vbCrLf & vbCrLf & _
        "2. FastAPI Documentation - https://fastapi.tiangolo.com" & vbCrLf & vbCrLf & _
        "3. Supabase Documentation - https://supabase.com/docs" & vbCrLf & vbCrLf & _
        "4. Google Gemini AI Documentation - https://ai.google.dev/docs" & vbCrLf & vbCrLf & _
        "5. AWS Lambda Documentation - https://docs.aws.amazon.com/lambda" & vbCrLf & vbCrLf & _
        "6. shadcn/ui Components - https://ui.shadcn.com" & vbCrLf & vbCrLf & _
        "7. Tailwind CSS Documentation - https://tailwindcss.com/docs"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 18
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    ' SLIDE 18: THANK YOU
    Set pptSlide = pptPres.Slides.Add(18, ppLayoutTitle)
    pptSlide.Shapes.Title.TextFrame.TextRange.Text = "THANK YOU"
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Size = 54
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Bold = True
    pptSlide.Shapes.Title.TextFrame.TextRange.Font.Name = "Times New Roman"
    pptSlide.Shapes(2).TextFrame.TextRange.Text = "Questions and Discussion" & vbCrLf & vbCrLf & _
        "CareerAutomate - AI-Powered Career Automation Platform"
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Size = 24
    pptSlide.Shapes(2).TextFrame.TextRange.Font.Name = "Times New Roman"
    
    MsgBox "Presentation created successfully with 18 slides!", vbInformation, "CareerAutomate PPT"

End Sub
