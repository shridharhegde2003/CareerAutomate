# 2. PROJECT PLAN

## 2.1 Project Planning Methodology

The CareerAutomate project was developed using an Agile methodology with iterative sprints. The team followed a modular approach where each microservice stack was developed as an independent unit, allowing parallel development and deployment.

## 2.2 Team Structure and Responsibilities

The project team was organized into specialized roles:

| Role | Responsibilities |
|------|------------------|
| Project Lead | Overall project coordination, architecture decisions, integration oversight |
| Frontend Developer | Next.js application development, UI/UX implementation, responsive design |
| Backend Developer (Auth) | Authentication service, JWT implementation, OAuth integration |
| Backend Developer (Projects) | GitHub integration, webhook handling, AI description generation |
| Backend Developer (Resume) | Resume builder, PDF generation, document management |
| Backend Developer (Jobs) | Job fetching, application automation, portal integrations |
| Database Administrator | Schema design, optimization, Row-Level Security policies |
| DevOps Engineer | AWS Lambda deployment, CI/CD pipelines, monitoring |
| QA Engineer | Testing strategy, test case development, quality assurance |

## 2.3 Development Timeline

The project was executed over a 16-week development cycle:

**Phase 1: Planning and Design (Weeks 1-2)**
- Requirements gathering and analysis
- System architecture design
- Database schema design
- Technology stack finalization
- Project documentation setup

**Phase 2: Core Infrastructure (Weeks 3-4)**
- Supabase project setup and configuration
- Authentication service development (Auth Stack)
- Frontend project initialization with Next.js
- Base UI component library setup
- JWT validation middleware development

**Phase 3: User Management (Weeks 5-6)**
- User registration and login flows
- OAuth integration (Google, GitHub)
- Onboarding workflow development
- Profile management features
- Settings page implementation

**Phase 4: GitHub Integration (Weeks 7-8)**
- GitHub App creation and OAuth flow
- Repository synchronization service
- Webhook handling implementation
- README content extraction
- AI description generation with Gemini

**Phase 5: Resume Features (Weeks 9-10)**
- Resume builder backend development
- AI-powered content generation
- PDF generation service
- Resume version management
- Project video upload feature

**Phase 6: Job Automation (Weeks 11-12)**
- Job fetcher service development
- Multi-portal integration (LinkedIn, Naukri, Indeed)
- Job matching algorithm
- Application automation service
- Status tracking implementation

**Phase 7: Admin and Analytics (Weeks 13-14)**
- Admin dashboard development
- Certificate verification workflow
- Reporting and analytics service
- Notification system
- API key management

**Phase 8: Testing and Deployment (Weeks 15-16)**
- Integration testing
- User acceptance testing
- Performance optimization
- AWS Lambda deployment
- Documentation finalization

## 2.4 Risk Management

| Risk | Probability | Impact | Mitigation Strategy |
|------|-------------|--------|---------------------|
| API Rate Limits | High | Medium | Implement caching, request queuing, and graceful degradation |
| Third-party Service Changes | Medium | High | Design abstraction layers, maintain fallback mechanisms |
| Scope Creep | Medium | Medium | Strict change control, prioritization framework |
| Integration Complexity | High | Medium | Early integration testing, well-defined interfaces |
| Security Vulnerabilities | Medium | High | Regular security audits, dependency updates |

## 2.5 Resource Allocation

**Hardware Resources:**
- Development workstations with 16GB RAM minimum
- Local PostgreSQL instances for development
- Git repositories for version control

**Software Resources:**
- VS Code / PyCharm for development
- Postman for API testing
- GitHub for source control
- Supabase for database and auth
- AWS account for deployment

**Cloud Resources:**
- Supabase Free/Pro tier
- AWS Lambda (serverless compute)
- AWS API Gateway
- AWS S3 (via Supabase Storage)

---

# 3. SOFTWARE REQUIREMENT SPECIFICATION

## 3.1 Introduction

### 3.1.1 Purpose
This Software Requirements Specification (SRS) document describes the functional and non-functional requirements for the CareerAutomate platform. It serves as a comprehensive guide for developers, testers, and stakeholders.

### 3.1.2 Scope
The CareerAutomate system is a web-based career automation platform that provides job seekers with tools to streamline their job search process through automation and AI-powered features.

### 3.1.3 Definitions and Acronyms

| Term | Definition |
|------|------------|
| JWT | JSON Web Token - Used for secure authentication |
| OAuth | Open Authorization - Standard for token-based authentication |
| RLS | Row-Level Security - Database security feature |
| BYOK | Bring Your Own Key - Users provide their own API keys |
| SPA | Single Page Application |
| REST | Representational State Transfer |
| CRUD | Create, Read, Update, Delete operations |

## 3.2 Overall Description

### 3.2.1 Product Perspective
CareerAutomate is a standalone web application that integrates with external services including GitHub, Google Gemini AI, and various job portals. It operates as a software-as-a-service (SaaS) platform.

### 3.2.2 Product Functions
The major functions of the system include:
- User authentication and authorization
- GitHub project synchronization
- AI-powered content generation
- Resume creation and management
- Job fetching and aggregation
- Automated job applications
- Certificate management and verification
- Analytics and reporting
- Administrative controls

### 3.2.3 User Classes and Characteristics

**Regular Users (Job Seekers):**
- Primary users of the platform
- Access to all user-facing features
- Can manage their profiles, projects, resumes, and job applications

**Administrators:**
- Platform operators with elevated privileges
- Access to admin dashboard
- Can verify certificates, manage users, and configure platform settings

### 3.2.4 Operating Environment
- **Client:** Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Server:** AWS Lambda with Node.js/Python runtime
- **Database:** PostgreSQL (Supabase)
- **Frontend Hosting:** Vercel or AWS CloudFront

### 3.2.5 Design and Implementation Constraints
- Must use Supabase for database and authentication
- Backend services must be compatible with AWS Lambda
- Frontend must be server-side renderable (Next.js)
- AI features require Google Gemini API access

## 3.3 Functional Requirements

### 3.3.1 Authentication Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-01 | System shall support email/password registration | High |
| FR-AUTH-02 | System shall support Google OAuth login | High |
| FR-AUTH-03 | System shall support GitHub OAuth login | High |
| FR-AUTH-04 | System shall issue JWT tokens upon successful authentication | High |
| FR-AUTH-05 | System shall validate JWT tokens on all protected endpoints | High |
| FR-AUTH-06 | System shall support role-based access control (user/admin) | High |
| FR-AUTH-07 | System shall allow password reset via email | Medium |
| FR-AUTH-08 | System shall enforce session expiration policies | Medium |

### 3.3.2 Onboarding Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ONB-01 | System shall collect user profile information during onboarding | High |
| FR-ONB-02 | System shall collect career preferences (roles, salary, locations) | High |
| FR-ONB-03 | System shall allow GitHub username configuration | High |
| FR-ONB-04 | System shall allow API key entry (Gemini) | Medium |
| FR-ONB-05 | System shall mark onboarding as complete upon finish | High |

### 3.3.3 GitHub Integration Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-GIT-01 | System shall support GitHub OAuth for repository access | High |
| FR-GIT-02 | System shall sync public repositories from user's GitHub | High |
| FR-GIT-03 | System shall fetch README content for each repository | High |
| FR-GIT-04 | System shall store repository metadata in database | High |
| FR-GIT-05 | System shall generate AI descriptions for repositories | High |
| FR-GIT-06 | System shall support webhook events for real-time updates | Medium |
| FR-GIT-07 | System shall avoid duplicate repository entries | High |
| FR-GIT-08 | System shall allow manual sync trigger | Medium |

### 3.3.4 Resume Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-RES-01 | System shall allow creation of multiple resumes | High |
| FR-RES-02 | System shall generate resume content using AI | High |
| FR-RES-03 | System shall support multiple resume versions | Medium |
| FR-RES-04 | System shall generate downloadable PDF resumes | High |
| FR-RES-05 | System shall auto-update resumes when projects change | Low |
| FR-RES-06 | System shall limit users to 5-10 active resumes | Medium |

### 3.3.5 Job Management Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-JOB-01 | System shall fetch jobs from multiple portals | High |
| FR-JOB-02 | System shall filter jobs based on user preferences | High |
| FR-JOB-03 | System shall calculate match scores for jobs | Medium |
| FR-JOB-04 | System shall support manual and automated applications | High |
| FR-JOB-05 | System shall track application statuses | High |
| FR-JOB-06 | System shall support scheduled job fetching | Medium |

### 3.3.6 Notification Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-NOT-01 | System shall send in-app notifications | High |
| FR-NOT-02 | System shall support email notifications | Medium |
| FR-NOT-03 | System shall mark notifications as read/unread | High |
| FR-NOT-04 | System shall provide notification preferences | Medium |

## 3.4 Non-Functional Requirements

### 3.4.1 Performance Requirements

| ID | Requirement |
|----|-------------|
| NFR-PERF-01 | API response time shall be under 500ms for 95% of requests |
| NFR-PERF-02 | System shall support minimum 1000 concurrent users |
| NFR-PERF-03 | Database queries shall complete within 100ms |
| NFR-PERF-04 | Frontend pages shall load within 3 seconds |

### 3.4.2 Security Requirements

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | All API communications shall use HTTPS |
| NFR-SEC-02 | Sensitive data shall be encrypted at rest |
| NFR-SEC-03 | JWT tokens shall expire within 24 hours |
| NFR-SEC-04 | Row-Level Security shall be enabled on all user tables |
| NFR-SEC-05 | API keys shall be stored in encrypted format |

### 3.4.3 Reliability Requirements

| ID | Requirement |
|----|-------------|
| NFR-REL-01 | System shall maintain 99.5% uptime |
| NFR-REL-02 | System shall perform daily database backups |
| NFR-REL-03 | System shall gracefully handle third-party service failures |

### 3.4.4 Scalability Requirements

| ID | Requirement |
|----|-------------|
| NFR-SCA-01 | System shall auto-scale based on demand (Lambda) |
| NFR-SCA-02 | Database shall support horizontal scaling |
| NFR-SCA-03 | System shall support multi-region deployment |

---
