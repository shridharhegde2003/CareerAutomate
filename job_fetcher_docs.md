# Job Fetcher Stack - API Documentation

**Base URL (Production):** `https://us91gapn47.execute-api.ap-south-1.amazonaws.com/Prod/v1`  
**Base URL (Local):** `http://localhost:8000/v1`

**Authentication:** JWT token optional. If not provided, requests use a default test user.

---

## 1. Start Live Job Sync

**Endpoint:** `POST /job-fetcher/sync`  
**Purpose:** Triggers parallel scrapers (LinkedIn + Indeed + Naukri) to fetch fresh jobs. This consumes Apify credits.

**Request Body (JSON):**
| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `title` | string | Yes | Job title keywords | `"Software Engineer"` |
| `location` | string | Yes | Target location | `"Bangalore"` |
| `rows` | integer | No | Number of jobs per portal (default: 50, max: 100) | `10` |
| `country` | string | No | Country code for Indeed (default: "US") | `"IN"` |
| `companyName` | array[str] | No | Filter by company names | `["Google", "Microsoft"]` |
| `companyId` | array[str] | No | LinkedIn Company IDs | `["12345"]` |
| `publishedAt` | string | No | Time filter code | `"r604800"` (Past Week) |

**Response (200 OK):**
```json
{
  "run_id": "2a8f7dbc-dc55-4002-94eb-1ee1fb1aeb4e",
  "status": "started",
  "message": "Job fetch started for unified (LinkedIn + Indeed). Check /v1/job-fetcher/runs for status."
}
```

> **Note:** The job fetch runs asynchronously. Poll `/job-fetcher/runs` to check completion status.

---

## 2. Sync from Existing Dataset

**Endpoint:** `POST /job-fetcher/sync-from-dataset`  
**Purpose:** Imports jobs from a previously completed Apify dataset. Useful for testing without spending credits.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `dataset_id` | string | Yes | Apify dataset ID (e.g., `LKHZTbW2M1zJ2pggn`) |

**Response (200 OK):**
```json
{
  "run_id": "3fa85f64...",
  "jobs_found": 50,
  "new_jobs_added": 12,
  "status": "completed"
}
```

---

## 3. List Fetch Runs

**Endpoint:** `GET /job-fetcher/runs`  
**Purpose:** View history of job fetch operations.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `page_size` | int | 20 | Items per page (max: 100) |
| `portal` | string | - | Filter by portal (`linkedin`, `indeed`, `naukri`, `unified`) |
| `status` | string | - | Filter by status (`running`, `completed`, `failed`) |

**Response (200 OK):**
```json
{
  "runs": [
    {
      "id": "2a8f7dbc-dc55-4002-94eb-1ee1fb1aeb4e",
      "portal": "unified",
      "status": "completed",
      "started_at": "2026-01-30T14:40:07.135219Z",
      "finished_at": "2026-01-30T14:41:26.869048Z",
      "jobs_found": 15,
      "new_jobs_added": 15,
      "errors_json": null
    }
  ],
  "total": 6,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

---

## 4. List Jobs (Job Feed)

**Endpoint:** `GET /jobs`  
**Purpose:** View fetched jobs with filtering, sorting, and pagination.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `page_size` | int | 20 | Items per page (max: 100) |
| `portal` | array[str] | - | Filter by portal(s): `linkedin`, `indeed`, `naukri` |
| `status` | array[str] | - | Filter by status(es): `new`, `reviewed`, `queued`, `skipped`, `applied`, `expired` |
| `q` | string | - | Search query (matches title or company) |
| `location` | string | - | Filter by location (partial match) |
| `company` | string | - | Filter by company name (partial match) |
| `min_lpa` | float | - | Minimum salary in LPA |
| `fetched_after` | string | - | **ISO timestamp. Returns only jobs fetched after this time.** (For real-time polling) |
| `sort` | string | `fetched_at` | Sort field: `fetched_at`, `posted_at`, `match_score`, `title`, `company` |
| `sort_desc` | bool | true | Sort descending |

**Example - Get newly fetched jobs (for polling):**
```
GET /jobs?fetched_after=2026-01-30T14:40:00Z
```

**Response (200 OK):**
```json
{
  "jobs": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "portal": "linkedin",
      "external_job_id": "3812345678",
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "company_url": "https://linkedin.com/company/...",
      "location": "Bangalore, India",
      "salary_text": "₹20-30 LPA",
      "job_url": "https://linkedin.com/jobs/view/...",
      "apply_url": "https://...",
      "apply_type": "external",
      "description": "Full job description...",
      "contract_type": "Full-time",
      "experience_level": "Mid-Senior level",
      "work_type": "Remote",
      "sector": "IT Services",
      "applications_count": "25 applicants",
      "posted_at": "2026-01-28",
      "posted_time_text": "2 days ago",
      "fetched_at": "2026-01-30T14:41:25.551493Z",
      "match_score": 0,
      "status": "new",
      "created_at": "2026-01-30T14:41:25.551493Z",
      "updated_at": "2026-01-30T14:41:25.551493Z"
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

---

## 5. Get Job Details

**Endpoint:** `GET /jobs/{job_id}`  
**Purpose:** Get full details for a single job.

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `job_id` | UUID | Job ID |

**Response (200 OK):** Same structure as single job in List Jobs response.

**Response (404 Not Found):**
```json
{
  "detail": "Job not found"
}
```

---

## 6. Update Job Status

**Endpoint:** `PUT /jobs/{job_id}/status`  
**Purpose:** Move a job through your workflow.

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `job_id` | UUID | Job ID |

**Request Body (JSON):**
```json
{
  "status": "reviewed"
}
```

**Allowed statuses:** `reviewed`, `queued`, `skipped`

**Response (200 OK):**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "status": "reviewed",
  "message": "Status updated successfully"
}
```

---

## 7. Health Check

**Endpoint:** `GET /health`  
**Purpose:** Verify service is running.  
**Auth:** Not required.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "job-fetcher-stack"
}
```

---

## Frontend Polling Pattern (Real-Time Updates)

To show newly fetched jobs in real-time without WebSockets:

```javascript
// 1. Start job fetch and save timestamp
const startTime = new Date().toISOString();
await fetch('/v1/job-fetcher/sync', { method: 'POST', body: JSON.stringify({...}) });

// 2. Poll for new jobs every 5 seconds
const pollInterval = setInterval(async () => {
  // Get only jobs fetched after start time
  const jobsResponse = await fetch(`/v1/jobs?fetched_after=${startTime}`);
  const { jobs } = await jobsResponse.json();
  
  if (jobs.length > 0) {
    displayNewJobs(jobs); // Show with "Just Fetched" badge
  }
  
  // Check if run completed
  const runsResponse = await fetch('/v1/job-fetcher/runs?page_size=1');
  const { runs } = await runsResponse.json();
  
  if (runs[0].status === 'completed' || runs[0].status === 'failed') {
    clearInterval(pollInterval); // Stop polling
  }
}, 5000);
```

---

## Supported Portals

| Portal | Status | Notes |
|--------|--------|-------|
| LinkedIn | ✅ Active | Primary scraper |
| Indeed | ✅ Active | Requires `country` param |
| Naukri | ⚠️ Requires paid actor | Returns 402 if credits insufficient |
