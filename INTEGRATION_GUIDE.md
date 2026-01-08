# Onboarding Service Integration Guide

This guide details how to integrate the **Onboarding Profile Microservice** with the frontend application.

## 🔗 Base URL
**Production Endpoint:**  
`https://c3a24cwqti.execute-api.ap-south-1.amazonaws.com/Prod/`

## 🔐 Authentication
All endpoints require a valid Supabase JWT token in the Authorization header.

**Header Format:**
```http
Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
```
*   **Token Source:** Get this token from `supabase.auth.session().access_token` on the frontend.
*   **Audience:** The token must have `aud: "authenticated"`.

---

## 👤 Endpoints

### 1. Get User Profile
Retrieves the logged-in user's profile.

*   **Endpoint:** `GET /v1/onboarding`
*   **Response (200 OK):**
    ```json
    {
      "id": "user-uuid-from-token",
      "full_name": "John Doe",
      "date_of_birth": "1995-05-15",
      "phone_number": "+91 9876543210",
      "secondary_email": "john@example.com",
      "address": "Bangalore, India",
      "linkedin_url": "https://linkedin.com/in/johndoe",
      "github_username": "johndoe",
      "skills": ["Python", "React", "AWS"],
      "summary": "Experienced Full Stack Developer...",
      "onboarding_completed": true, 
      "profile_photo_url": "https://...",
      "govt_id_url": "https://...",
      
      "career_preferences": {
        "roles_targeted": ["Backend Developer"],
        "min_target_lpa": 12,
        "preferred_locations": ["Remote", "Bangalore"],
        "work_preference": ["Remote", "Hybrid"],
        "other_preferences": ["Startup"]
      },
      
      "education": [
        {
          "degree_type": "bachelor",
          "degree_name": "B.Tech",
          "institution": "IIT Bombay",
          "grade_type": "cgpa",
          "obtained_cgpa": "8.5",
          "max_cgpa": "10",
          "year_of_completion": "2018"
        }
      ],
      
      "experience": [
        {
          "job_title": "Software Engineer",
          "company_name": "Google",
          "location": "Bangalore",
          "employment_type": "full-time",
          "start_date": "2020-01",
          "end_date": "Present",
          "is_current": true,
          "description": "Working on Google Cloud...",
          "skills_used": ["Go", "Kubernetes"]
        }
      ],
      
      "achievements": [
        {
          "title": "Best Hackathon Project",
          "issuer": "TechCrunch",
          "date": "2021-11",
          "description": "Won 1st place in AI track"
        }
      ],

      "certifications": [
        {
          "name": "AWS Certified Solutions Architect",
          "issuing_organization": "Amazon Web Services",
          "issue_date": "2022-05",
          "expiry_date": "2025-05",
          "credential_id": "AWS-12345",
          "credential_url": "https://aws.amazon.com/verify/..."
        }
      ],

      "api_keys": {
        "gemini_ai_key": "AIzaSy...",
        "linkedin_api_key": "...",
        "naukri_api_key": "...",
        "indeed_api_key": "...",
        "gmail_api_key": "..."
      }
    }
    ```
*   **Error (404 Not Found):** If the user has not completed onboarding yet.

---

### 2. Create or Update Profile (Upsert)
This single endpoint handles **both** creating a new profile and updating an existing one.

*   **Endpoint:** `PUT /v1/onboarding`
*   **Logic:**
    *   **New User:** If no profile exists for the User ID in user's token, a **new** record is inserted.
    *   **Existing User:** If a profile already exists, the provided fields are **updated**.
*   **Request Body:** (Send only fields you want to update)
    ```json
    {
      "full_name": "John Doe",
      "summary": "Passionate developer...",
      "skills": ["Python", "FastAPI"],
      
      "career_preferences": {
        "roles_targeted": ["Backend Developer"],
        "min_target_lpa": 15
      },
      
      "education": [
        {
           "degree_type": "master",
           "degree_name": "MS Computer Science",
           "institution": "Stanford",
           "grade_type": "cgpa",
           "obtained_cgpa": "3.8",
           "max_cgpa": "4.0",
           "year_of_completion": "2020"
        }
      ],
      
      "experience": [
         {
            "job_title": "Senior Engineer",
            "company_name": "Netflix",
            "start_date": "2022-01",
            "is_current": true
         }
      ],
      
      "achievements": [],
      "certifications": [],
      
      "api_keys": {
          "gemini_ai_key": "new-key-value"
      },
      
      "onboarding_completed": true
    }
    ```
*   **Response (200 OK):** Returns the full updated profile object.

---

## 💡 Frontend Integration Logic

### Scenario A: New User Sign-Up
1.  User signs up via Supabase Auth.
2.  Frontend redirects to "Complete Profile" form.
3.  User fills details -> Frontend sends `PUT /v1/onboarding`.
4.  Backend creates the row in `profiles` table.

### Scenario B: Existing User Login
1.  User logs in.
2.  Frontend calls `GET /v1/onboarding`.
3.  **If 200 OK:** User is fully onboarded. Save profile data to state/context. Redirect to Dashboard.
4.  **If 404 Not Found:** Redirect to "Complete Profile" form (See Scenario A).

### Scenario C: Updating Specific Section
1.  User updates just their API Keys in Settings.
2.  Frontend sends `PUT /v1/onboarding` with **only** the `api_keys` object.
    ```json
    {
      "api_keys": { "gemini_ai_key": "..." }
    }
    ```
3.  Backend updates just that column, preserving other data.

### ⚠️ Important: Handling Profile Photos
The backend expects a **URL String**, not a file upload.
1.  **Frontend:** Upload the user's image file directly to **Supabase Storage** (e.g., 'avatars' bucket) using the Supabase Client.
2.  **Frontend:** Get the **Public URL** of the uploaded file.
3.  **Frontend:** Send this URL to the backend:
    ```json
    {
      "profile_photo_url": "https://your-supabase-project.supabase.co/storage/v1/object/public/avatars/image.jpg"
    }
    ```
