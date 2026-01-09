# Resume Generator API - Frontend Integration Guide

## 🌐 Base URL
**Production**: `https://eei2l71joe.execute-api.ap-south-1.amazonaws.com/Prod`

---

## 🔐 Authentication
All protected endpoints require a valid Supabase JWT token in the `Authorization` header.

**Header Format:**
```http
Authorization: Bearer <YOUR_ACCESS_TOKEN>
```

---

## 📡 Endpoints

### 1. Health Check
Verify the service is running.

- **URL**: `/`
- **Method**: `GET`
- **Auth**: Not required (Public)

**Response (200 OK):**
```json
{
  "status": "ok",
  "service": "resume-generator",
  "dev_mode": false
}
```

---

### 2. Get Resume Options
Fetch available target roles ("genres") and resume templates. This should be called to populate the frontend selection form.

- **URL**: `/v1/resumes/options`
- **Method**: `GET`
- **Auth**: Required

**Response (200 OK):**
```json
{
  "genres": [
    "Software Engineer",
    "Full Stack Developer",
    "Data Scientist"
  ],
  "templates": [
    {
      "id": "modern",
      "name": "Modern Minimal",
      "has_photo": true,
      "description": "Clean sidebar layout with profile photo"
    },
    {
      "id": "classic",
      "name": "Classic Corporate",
      "has_photo": false,
      "description": "Traditional serif layout"
    },
    {
      "id": "creative",
      "name": "Creative Tech",
      "has_photo": false,
      "description": "Two-column vibrant layout"
    }
  ]
}
```

**Errors:**
- `401 Unauthorized`: Invalid or missing token.

---

### 3. Generate Resume
Generate a PDF resume based on the selected genre and template.

- **URL**: `/v1/resumes/generate`
- **Method**: `POST`
- **Auth**: Required
- **Content-Type**: `application/json`

**Request Body:**
```json
{
  "genre": "Software Engineer",   // Must be one of the strings returned in 'genres' from /options
  "template_id": "modern"         // Must be one of the 'id's returned in 'templates' from /options (e.g., 'modern', 'classic', 'creative')
}
```

**Response (200 OK):**
```json
{
  "message": "Resume generated successfully",
  "pdf_url": "https://sapmqweflhqfprkjoikk.supabase.co/storage/v1/object/sign/certificates/documents/resumes/...", // Signed URL valid for 60 minutes
  "document_id": "a1b2c3d4-e5f6-7890-..."
}
```

**Processing Logic:**
1.  **Profiles**: Fetches user details (Name, Contact, Education, etc.).
2.  **Projects**: Fetches repositories. **Filters** to only include projects with a generated AI description (`description_ai`).
3.  **PDF**: Renders HTML template and converts to PDF.
4.  **Storage**: Uploads to Supabase Storage bucket `certificates` (path: `documents/resumes/`).

**Errors:**
- `400 Bad Request`: Invalid template ID or missing data.
- `401 Unauthorized`: Invalid token.
- `500 Internal Server Error`: Generation failure (check logs).
