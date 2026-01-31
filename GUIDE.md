# Frontend Integration Guide: Reports & Notifications Service

## Base URL
```
https://anorfht031.execute-api.us-east-1.amazonaws.com/Prod
```

---

## 🎯 Service Overview

This service handles:
1. **Job Matching** - Sends personalized PDF emails with matched jobs based on user preferences
2. **Video Reminders** - Reminds users to upload intro videos for their repositories
3. **Notification Frequency** - Respects each user's frequency preference (daily, weekly, etc.)

---

## 🔐 Admin Endpoints

> For admin dashboard only. These affect ALL users.

### 1. Send Job Matches to ALL Users
```http
POST /admin/send-job-matches-all
```
**Response:**
```json
{
  "total_users": 5,
  "sent_count": 3,
  "failed_count": 1,
  "skipped_count": 1,
  "details": [
    {"user_id": "...", "user_name": "John", "success": true, "matched_jobs": 25}
  ],
  "message": "Processed 5 users: 3 sent, 1 skipped, 1 failed"
}
```

---

### 2. Send Video Reminders to ALL Users
```http
POST /admin/send-video-reminders-all
```
**Response:**
```json
{
  "total_users_with_missing_videos": 4,
  "sent_count": 3,
  "failed_count": 1,
  "total_repos_missing": 15,
  "details": [...]
}
```

---

## 👤 User Endpoints

> For user-facing functionality. Requires user ID.

### 3. Trigger Job Matching for a User
```http
POST /trigger/job-matching/{user_id}
```
**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `user_id` | UUID | User's Supabase ID |

**Response:**
```json
{
  "success": true,
  "user_id": "cc5f48ef-17fa-428a-b639-20089a7194d8",
  "user_name": "Yashwanth C H",
  "email": "kaiser200318@gmail.com",
  "matched_jobs_count": 12,
  "total_jobs_available": 850,
  "top_match_score": 83,
  "storage_url": "https://sapmqweflhqfprkjoikk.supabase.co/storage/v1/object/public/certificates-documents/cc5f48.../JobMatch_2026.pdf",
  "message": "Email sent to kaiser200318@gmail.com with 12 matched jobs"
}
```

---

### 4. Trigger Video Reminder for a User
```http
POST /trigger/video-reminder/{user_id}
```
**Response:**
```json
{
  "success": true,
  "user_id": "...",
  "user_name": "John Doe",
  "email": "john@example.com",
  "repos_missing_count": 5,
  "repos_names": ["repo1", "repo2", "..."],
  "message": "Email sent with reminder for 5 repositories"
}
```

---

### 5. Get Matched Jobs (Debug/Preview)
```http
GET /jobs/{user_id}
```
**Use Case:** Preview what jobs would match for a user without sending email.

**Response:**
```json
{
  "user_id": "...",
  "user_name": "John",
  "total_jobs": 50,
  "matching_criteria": {
    "preferred_locations": ["Bangalore"],
    "skills": ["Python", "React"],
    "roles_targeted": ["Software Engineer"]
  },
  "jobs": [
    {
      "title": "Software Engineer",
      "company": "Google",
      "location": "Bangalore, India",
      "match_score": 85,
      "apply_url": "https://linkedin.com/jobs/..."
    }
  ]
}
```

---

## 🔧 Health Check
```http
GET /
```
**Response:**
```json
{
  "status": "healthy",
  "service": "Reports & Notifications",
  "features": ["video_reminder", "job_matching"]
}
```

---

## 📊 Database Fields (Frontend Sets These)

### In `profiles` table:

| Field | Type | Options | Description |
|-------|------|---------|-------------|
| `job_notification_frequency` | TEXT | `daily`, `every_2_days`, `every_3_days`, `weekly`, `monthly`, `never` | Frequency for Job Matching Emails |
| `video_notification_frequency` | TEXT | `daily`, `every_2_days`, `every_3_days`, `weekly`, `monthly`, `never` | Frequency for Video Reminder Emails |
| `preferred_locations` | JSON Array | e.g., `["Bangalore", "Remote"]` | Set via `career_preferences.preferred_locations` |
| `roles_targeted` | JSON Array | e.g., `["Software Engineer"]` | Set via `career_preferences.roles_targeted` |
| `skills` | JSON Array | e.g., `["Python", "React"]` | User's skills for matching |

---

## 📅 Automatic Scheduled Tasks

These run automatically via AWS EventBridge (no frontend action needed):

| Task | Frequency | Lambda Handler |
|------|-----------|----------------|
| Video Reminders | Daily | `lambda_video_reminder` |
| Job Matching | Daily | `lambda_job_matching` |

---

## 🔗 Quick Reference

| Endpoint | Method | Side | Purpose |
|----------|--------|------|---------|
| `/` | GET | Both | Health check |
| `/admin/send-job-matches-all` | POST | Admin | Send jobs to all users |
| `/admin/send-video-reminders-all` | POST | Admin | Send reminders to all |
| `/trigger/job-matching/{user_id}` | POST | User | Send jobs to one user |
| `/trigger/video-reminder/{user_id}` | POST | User | Send reminder to one user |
| `/jobs/{user_id}` | GET | User | Preview matched jobs |
