# Deployment Guide

This guide covers how to deploy the CareerAutomate application to Vercel.

## 1. Prerequisites

- A [Vercel](https://vercel.com) account.
- A [Supabase](https://supabase.com) project.
- A [GitHub](https://github.com) account.
- Google App Password for Email Service.

## 2. Deploying the Auth Service (Backend)

The Auth Service is a FastAPI application.

1.  **Push to GitHub**: Push the `Auth-Service-main` code to a GitHub repository.
2.  **Import in Vercel**:
    *   Go to Vercel Dashboard > "Add New..." > "Project".
    *   Import the `Auth-Service-main` repository.
3.  **Configure Project**:
    *   **Framework Preset**: Select "Other".
    *   **Root Directory**: Select `Auth-Service-main` (or root if it's the only thing in repo).
    *   **Build Command**: Leave empty (Vercel handles Python).
    *   **Output Directory**: Leave empty.
4.  **Environment Variables**: Add the following variables in Vercel:
    *   `SUPABASE_URL`: Your Supabase URL.
    *   `SUPABASE_KEY`: Your Supabase Service Role Key (or Anon Key if only client-side, but Service Role is better for backend).
    *   `MAIL_USERNAME`: Your Gmail address.
    *   `MAIL_PASSWORD`: Your Google App Password.
    *   `SECRET_KEY`: A random secret string.
    *   `ALGORITHM`: `HS256`
    *   `ACCESS_TOKEN_EXPIRE_MINUTES`: `60`
5.  **Deploy**: Click "Deploy".
6.  **Get URL**: Once deployed, copy the domain (e.g., `https://auth-service-xyz.vercel.app`).

## 3. Deploying the Frontend

The Frontend is a Next.js application.

1.  **Push to GitHub**: Push the `frontend` code to a GitHub repository.
2.  **Import in Vercel**:
    *   Go to Vercel Dashboard > "Add New..." > "Project".
    *   Import the `frontend` repository.
3.  **Configure Project**:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: Select `frontend`.
4.  **Environment Variables**: Add the following variables in Vercel:
    *   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL.
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
    *   `NEXT_PUBLIC_AUTH_SERVICE_URL`: The URL of your deployed Auth Service (e.g., `https://auth-service-xyz.vercel.app`). **Important**: Do not add a trailing slash.
5.  **Deploy**: Click "Deploy".

## 4. Post-Deployment Configuration

1.  **Update Auth Service Redirects**:
    *   In your `Auth-Service-main` code (or via env vars if you refactor further), the OAuth redirects currently point to `localhost:3000`.
    *   You need to update `auth.py` to use the production frontend URL for redirects.
    *   *Recommendation*: Add `FRONTEND_URL` to `.env` and use it in `auth.py`.

    ```python
    # In auth.py
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    # ...
    return RedirectResponse(f"{FRONTEND_URL}/dashboard")
    ```

2.  **Supabase Auth Settings (Native OTP Flow)**:
    *   Go to Supabase Dashboard > Authentication > URL Configuration.
    *   Add your Vercel Frontend URL to "Site URL" and "Redirect URLs".
    *   **Enable Email Confirmation**:
        *   Go to Authentication > Providers > Email.
        *   **Enable "Confirm email"**.
        *   **Enable "Send email as OTP"** (This is CRITICAL. If missing, check Email Templates).
    *   **Email Template**:
        *   Go to Authentication > Email Templates > Confirm Your Signup.
        *   Ensure the body contains `{{ .Token }}` to display the OTP code.

## 5. Hosting on Vercel (Microservices)

Since you have two separate services (`frontend` and `Auth-Service-main`), you will deploy them as two separate Vercel projects.

### A. Deploying the Auth Service (Backend)

1.  **Push to GitHub**: Ensure `Auth-Service-main` is in its own GitHub repository (or a folder in a monorepo).
2.  **Create Project in Vercel**:
    *   Import the repo.
    *   **Root Directory**: `Auth-Service-main` (if in a subfolder).
    *   **Framework Preset**: Select **Other**.
    *   **Build Command**: Leave empty.
    *   **Output Directory**: Leave empty.
    *   **Install Command**: `pip install -r requirements.txt` (Vercel usually detects this).
3.  **Environment Variables**:
    *   `SUPABASE_URL`: ...
    *   `SUPABASE_KEY`: ...
    *   `MAIL_USERNAME`: `friendzone108108@gmail.com`
    *   `MAIL_PASSWORD`: `aufz ezsa enhx prur`
    *   `FRONTEND_URL`: `https://your-frontend-url.vercel.app` (Add this AFTER deploying frontend).
4.  **Deploy**.

### B. Deploying the Frontend

1.  **Push to GitHub**: Ensure `frontend` is in the repo.
2.  **Create Project in Vercel**:
    *   Import the repo.
    *   **Root Directory**: `frontend`.
    *   **Framework Preset**: **Next.js**.
3.  **Environment Variables**:
    *   `NEXT_PUBLIC_SUPABASE_URL`: ...
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: ...
    *   `NEXT_PUBLIC_AUTH_SERVICE_URL`: `https://your-auth-service.vercel.app` (The URL from Step A).
4.  **Deploy**.

### C. Final Wiring

1.  Go back to **Auth Service** in Vercel settings.
2.  Update `FRONTEND_URL` to match the actual deployed Frontend URL.
3.  Redeploy Auth Service.
4.  Go to **Supabase Dashboard** and update "Site URL" to the deployed Frontend URL.

## 6. Verification

1.  Open your deployed Frontend URL.
2.  Try to Sign Up. You should receive an email from `friendzone108108@gmail.com`.
3.  Enter OTP.
4.  Login.

