# Auth Service Deployment Guide with SAM

## Prerequisites

1. **Install AWS SAM CLI**:
   ```bash
   # Windows (with Chocolatey)
   choco install aws-sam-cli
   
   # Or download from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
   ```

2. **Install Docker Desktop** (required for SAM to build Linux dependencies):
   - Download from: https://www.docker.com/products/docker-desktop/

3. **Configure AWS CLI**:
   ```bash
   aws configure
   # Enter your AWS Access Key ID, Secret Access Key, and region (eu-north-1)
   ```

---

## Local Development

### Run Locally:
```bash
cd Auth-Service-main
python -m uvicorn main:app --reload --port 8000
```

### Test Endpoints:
- Root: `http://127.0.0.1:8000/`
- Google Login: `http://127.0.0.1:8000/auth/google/login`
- GitHub Login: `http://127.0.0.1:8000/auth/github/login`
- Register: `POST http://127.0.0.1:8000/auth/register`
- Login: `POST http://127.0.0.1:8000/auth/login`

---

## Deploy to AWS with SAM

### Step 1: Build the Application
```bash
cd Auth-Service-main
sam build --use-container
```
This builds your code with Linux-compatible dependencies inside a Docker container.

### Step 2: Deploy to AWS
```bash
sam deploy --guided
```

During the first deployment, you'll be prompted for:
- **Stack Name**: `auth-service` (default)
- **AWS Region**: `eu-north-1` (default)
- **SupabaseKey**: Enter your Supabase Service Role Key
- **MailPassword**: Enter your Gmail App Password
- Other parameters have defaults

### Step 3: Get the API URL
After deployment, SAM will output:
```
Outputs:
AuthServiceApi: https://XXXXX.execute-api.eu-north-1.amazonaws.com/Prod/
```

**Copy this URL** - this is your new Auth Service endpoint!

---

## Update Frontend

1. Go to **Vercel Dashboard** → Your Frontend → **Settings** → **Environment Variables**
2. Update `NEXT_PUBLIC_AUTH_SERVICE_URL` with the new SAM API URL
3. **Redeploy** your frontend

---

## Update Supabase Redirect URLs

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   https://XXXXX.execute-api.eu-north-1.amazonaws.com/Prod/auth/google/callback
   https://XXXXX.execute-api.eu-north-1.amazonaws.com/Prod/auth/github/callback
   ```

---

## Useful SAM Commands

| Command | Description |
|---------|-------------|
| `sam build` | Build the application |
| `sam build --use-container` | Build with Docker (Linux deps) |
| `sam deploy` | Deploy to AWS |
| `sam deploy --guided` | Interactive deployment |
| `sam logs -n AuthServiceFunction --tail` | View Lambda logs |
| `sam delete` | Delete the deployed stack |

---

## Troubleshooting

### "No module named X" Error
Run `sam build --use-container` to ensure Linux-compatible dependencies.

### 500 Internal Server Error
Check CloudWatch logs: `sam logs -n AuthServiceFunction --tail`

### CORS Issues
Ensure `allow_origins=["*"]` in `main.py` CORS middleware.
