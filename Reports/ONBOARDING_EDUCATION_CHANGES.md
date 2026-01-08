# Frontend Education Changes - Backend Integration Guide

## Overview

This document details the changes made to the **Frontend Onboarding Form** education section. These changes require corresponding updates to the **Onboarding Backend** running on AWS Lambda.

**Date:** 2026-01-04  
**Frontend Repository:** `frontend/`  
**Backend Repository:** `Onboarding-backend/`  
**AWS Lambda Function:** `MINI-ONBOARDING-OnboardingFunction-JcmZrMzYQZj1`  
**API Endpoint:** `https://c3a24cwqti.execute-api.ap-south-1.amazonaws.com/Prod/`

---

## Summary of Changes

### Before (Old Structure)
The education field was a simple JSON with these fields:
```json
{
  "degree": "B.Tech",
  "field": "Computer Science",
  "institution": "Some University",
  "year": 2024
}
```

### After (New Structure)
The education field is now an **array** of education entries with enhanced fields:
```json
[
  {
    "degree_type": "bachelor",
    "degree_name": "B.Tech",
    "institution": "Some University",
    "grade_type": "cgpa",
    "obtained_cgpa": "8.5",
    "max_cgpa": "10",
    "obtained_marks": null,
    "total_marks": null,
    "year_of_completion": "2024",
    "percentage": null
  },
  {
    "degree_type": "12th",
    "degree_name": "PUC Science",
    "institution": "Some PU College",
    "grade_type": "percentage",
    "obtained_marks": "450",
    "total_marks": "500",
    "obtained_cgpa": null,
    "max_cgpa": null,
    "year_of_completion": "2020",
    "percentage": "90.00"
  }
]
```

---

## New Education Entry Fields

| Field | Type | Description | Example Values |
|-------|------|-------------|----------------|
| `degree_type` | string | Level of education | `10th`, `12th`, `diploma`, `bachelor`, `master`, `phd` |
| `degree_name` | string | Specific degree name | `B.Tech`, `MBA`, `SSLC`, `PUC Science`, `M.Tech` |
| `institution` | string | College/University/School name | `"Some University"` |
| `grade_type` | string | Type of grading system | `percentage` or `cgpa` |
| `obtained_marks` | string \| null | Marks obtained (if percentage) | `"450"` |
| `total_marks` | string \| null | Total marks (if percentage) | `"500"` |
| `obtained_cgpa` | string \| null | CGPA obtained (if cgpa) | `"8.5"` |
| `max_cgpa` | string \| null | Maximum CGPA scale (if cgpa) | `"10"` |
| `year_of_completion` | string | Year of graduation/completion | `"2024"` |
| `percentage` | string \| null | Calculated percentage (frontend calculated) | `"90.00"` |

---

## Degree Type Options

The frontend provides these degree type options:

| Value | Display Label |
|-------|---------------|
| `10th` | 10th Standard / SSLC |
| `12th` | 12th Standard / PUC / HSC |
| `diploma` | Diploma |
| `bachelor` | Bachelor's Degree |
| `master` | Master's Degree |
| `phd` | PhD / Doctorate |

---

## Degree Name Options (by Type)

### 10th Standard
- `SSLC`, `CBSE`, `ICSE`, `State Board`

### 12th Standard
- `PUC Science`, `PUC Commerce`, `PUC Arts`
- `CBSE Science`, `CBSE Commerce`, `CBSE Arts`
- `ISC`

### Diploma
- `Diploma in Computer Science`, `Diploma in Mechanical Engineering`
- `Diploma in Electronics`, `Diploma in Civil Engineering`
- `Other Diploma`

### Bachelor's
- `B.Tech`, `B.E.`, `BCA`, `B.Sc`, `B.Com`, `BBA`, `BA`, `B.Arch`
- `Other Bachelor`

### Master's
- `M.Tech`, `MCA`, `MBA`, `M.Sc`, `M.Com`, `MA`, `M.E.`
- `Other Master`

### PhD
- `PhD in Computer Science`, `PhD in Engineering`
- `PhD in Management`, `PhD in Science`
- `Other PhD`

---

## Additional Fields Added to API

### 1. `api_keys` Field
The frontend now sends API keys in this structure:
```json
{
  "gemini_ai_key": "AIza...",
  "linkedin_api_key": null,
  "naukri_api_key": null,
  "indeed_api_key": null,
  "gmail_api_key": null
}
```

### 2. Enhanced `career_preferences` Field
```json
{
  "roles_targeted": ["Software Engineer", "Backend Developer"],
  "min_target_lpa": 12,
  "preferred_locations": ["Bangalore", "Hyderabad"],
  "work_preference": ["Remote", "Hybrid"],
  "other_preferences": ["Work-life balance"]
}
```

---

## Complete API Payload Example

Here's a complete example of what the frontend sends to `PUT /v1/onboarding`:

```json
{
  "full_name": "John Doe",
  "date_of_birth": "2000-05-15",
  "secondary_email": "john.alt@example.com",
  "address": "123 Main St, Bangalore",
  "profile_photo_url": "https://storage.supabase.com/...",
  "govt_id_url": "https://storage.supabase.com/...",
  "linkedin_url": "https://linkedin.com/in/johndoe",
  "github_username": "johndoe",
  "skills": ["Python", "JavaScript", "React", "Node.js"],
  "education": [
    {
      "degree_type": "bachelor",
      "degree_name": "B.Tech",
      "institution": "VTU University",
      "grade_type": "cgpa",
      "obtained_cgpa": "8.5",
      "max_cgpa": "10",
      "obtained_marks": null,
      "total_marks": null,
      "year_of_completion": "2024",
      "percentage": null
    },
    {
      "degree_type": "12th",
      "degree_name": "PUC Science",
      "institution": "Some PU College",
      "grade_type": "percentage",
      "obtained_marks": "550",
      "total_marks": "600",
      "obtained_cgpa": null,
      "max_cgpa": null,
      "year_of_completion": "2020",
      "percentage": "91.67"
    },
    {
      "degree_type": "10th",
      "degree_name": "SSLC",
      "institution": "Some High School",
      "grade_type": "percentage",
      "obtained_marks": "580",
      "total_marks": "625",
      "obtained_cgpa": null,
      "max_cgpa": null,
      "year_of_completion": "2018",
      "percentage": "92.80"
    }
  ],
  "career_preferences": {
    "roles_targeted": ["Software Engineer", "Full Stack Developer"],
    "min_target_lpa": 15,
    "preferred_locations": ["Bangalore", "Hyderabad", "Remote"],
    "work_preference": ["Hybrid", "Remote"],
    "other_preferences": ["Flexible hours"]
  },
  "api_keys": {
    "gemini_ai_key": "AIzaSy...",
    "linkedin_api_key": null,
    "naukri_api_key": null,
    "indeed_api_key": null,
    "gmail_api_key": null
  },
  "onboarding_completed": true
}
```

---

## Backend Changes Required

### File: `src/app/models.py`

I have already updated this file in the `Onboarding-backend` folder. The changes include:

1. **Added `EducationEntry` model** with all new fields
2. **Added `ApiKeys` model** for API key structure
3. **Enhanced `CareerPreferences` model** with `work_preference` and `other_preferences`
4. **Updated `OnboardingProfileUpdate`** to document the new structure
5. **Updated `OnboardingProfileResponse`** to include `api_keys`

### No Changes Needed to:
- `routers/onboarding.py` - The router uses `Any` type for JSONB fields, so it will accept any structure
- `main.py` - No changes needed
- `auth.py` - No changes needed

---

## Database Considerations

The `profiles` table in Supabase stores `education`, `career_preferences`, and `api_keys` as **JSONB** columns. No database schema changes are required since JSONB accepts any valid JSON structure.

However, if you want to validate the structure at database level, you can add a check constraint (optional):

```sql
-- Optional: Add validation for education array structure
-- This is NOT required, just for stricter validation
ALTER TABLE profiles 
ADD CONSTRAINT check_education_structure 
CHECK (
  education IS NULL OR 
  jsonb_typeof(education) = 'array'
);
```

---

## Testing the Changes

### 1. Test with Postman/curl

```bash
curl -X PUT \
  https://c3a24cwqti.execute-api.ap-south-1.amazonaws.com/Prod/v1/onboarding \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "education": [
      {
        "degree_type": "bachelor",
        "degree_name": "B.Tech",
        "institution": "Test University",
        "grade_type": "cgpa",
        "obtained_cgpa": "9.0",
        "max_cgpa": "10",
        "year_of_completion": "2024"
      }
    ],
    "onboarding_completed": false
  }'
```

### 2. Verify in Supabase

Check the `profiles` table to ensure the `education` column contains the new structure.

---

## Backward Compatibility

The new structure is **backward compatible**. The old fields (`degree`, `field`, `year`) are still accepted but will be ignored if new fields are present. The backend will store whatever is sent without strict validation.

---

## Contact

For any questions about these changes, please reach out to the frontend team.
