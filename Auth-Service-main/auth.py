# auth.py
from fastapi import APIRouter, HTTPException, status, Depends
from schemas import UserCreate, UserLogin, Token, UserResponse, VerifyOTP
from database import supabase
from deps import get_current_user
from fastapi import Request
from starlette.responses import RedirectResponse
from email_service import send_otp_email
import random
import string
from datetime import datetime, timedelta, timezone
import os

router = APIRouter(prefix="/auth", tags=["auth"])
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate):
    try:
        # 1. Create user in Supabase Auth (Identity)
        # We use sign_up. If "Confirm Email" is OFF in Supabase, this returns a session.
        # If ON, it sends an email (which we might ignore if we want our own flow).
        # Ideally, turn OFF Supabase email confirmation for this hybrid flow.
        auth_res = supabase.auth.sign_up({
            "email": payload.email,
            "password": payload.password,
        })
        
        if not auth_res.user:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Registration failed")
        
        user_id = auth_res.user.id
        
        # 2. Generate Custom OTP
        otp = generate_otp()
        otp_expiry = (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat()

        # 3. Store in public.users (or update if exists)
        # We use upsert to handle cases where auth user exists but public user might not
        data = {
            "id": user_id,
            "email": payload.email,
            "otp": otp,
            "otp_expiry": otp_expiry,
            "is_verified": False
        }
        
        # Check if row exists to decide insert vs update, or just upsert
        supabase.table("users").upsert(data).execute()

        # 4. Send Custom Email
        email_sent = send_otp_email(payload.email, otp)
        
        return {"message": "User created. Please verify your email with the OTP sent.", "email_sent": email_sent}

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/verify-otp")
def verify_otp(payload: VerifyOTP):
    # Check our public.users table
    resp = supabase.table("users").select("*").eq("email", payload.email).limit(1).execute()
    if not resp.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    user = resp.data[0]
    
    if user.get("is_verified"):
        return {"message": "User already verified"}

    # Check OTP
    if user.get("otp") != payload.otp:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP")
    
    # Check Expiry
    if user.get("otp_expiry"):
        expiry_time = datetime.fromisoformat(user["otp_expiry"])
        # Make current time timezone-aware for comparison
        if expiry_time < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired")

    # Verify User
    supabase.table("users").update({
        "is_verified": True,
        "otp": None,
        "otp_expiry": None
    }).eq("id", user["id"]).execute()

    # Sign in the user to get a session token
    # We can't use sign_in_with_password here because we don't have the password.
    # Instead, we can use Supabase's admin API to create a session.
    # For simplicity and security, we'll use the user's ID to generate a custom JWT.
    # Actually, Supabase wants us to use their session management.
    # The best approach: return a message asking them to login, OR we can generate our own JWT.
    # Let's generate a JWT using the same utility Supabase uses internally.
    
    # Actually, the cleanest approach: use Supabase admin auth to generate a session
    # But the Python SDK doesn't expose that easily.
    # Let's use our utility function to create an access token.
    from utils import create_access_token
    access_token = create_access_token(subject=user["id"])
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "message": "Email verified successfully"
    }

@router.post("/login", response_model=Token)
def login(payload: UserLogin):
    try:
        # 1. Authenticate with Supabase
        res = supabase.auth.sign_in_with_password({
            "email": payload.email,
            "password": payload.password
        })
        
        if not res.session:
             raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        
        user_id = res.user.id

        # 2. Check Verification Status in public.users
        # We enforce this check!
        user_data = supabase.table("users").select("is_verified").eq("id", user_id).single().execute()
        
        if not user_data.data or not user_data.data.get("is_verified"):
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified. Please verify your OTP.")

        return {
            "access_token": res.session.access_token,
            "token_type": "bearer"
        }

    except Exception as e:
        # If it's our 403, re-raise it
        if "Email not verified" in str(e):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified. Please verify your OTP.")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/me", response_model=UserResponse)
def me(current_user = Depends(get_current_user)):
    return current_user


@router.get("/google/login")
def google_login():
    """Generate a URL to login with Google."""
    response = supabase.auth.sign_in_with_oauth(
        {
            "provider": "google",
            "options": {
                "redirect_to": "http://127.0.0.1:8000/auth/google/callback",
            }
        }
    )
    return RedirectResponse(response.url)


@router.get("/google/callback")
def google_callback(request: Request):
    """
    Callback endpoint for Google OAuth. 
    """
    try:
        code = request.query_params.get("code")
        if not code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Authorization code not found")
        
        session_data = supabase.auth.exchange_code_for_session({"auth_code": code})
        user = session_data.user
        
        # Check if profile exists (Logic moved to frontend/onboarding service, but we still redirect)
        # Since we removed profiles.py, we just redirect to dashboard. 
        # Frontend will handle "if profile missing -> go to onboarding" logic via its own check if needed.
        # OR we redirect to onboarding by default for new users?
        # User said: "Remove those [backend technologies]... logic moved to teammate's service"
        # So we just redirect to dashboard, and let frontend decide.
        
        return RedirectResponse(f"{FRONTEND_URL}/dashboard")

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/github/login")
def github_login():
    """Generate a URL to login with GitHub."""
    response = supabase.auth.sign_in_with_oauth(
        {
            "provider": "github",
            "options": {
                "redirect_to": "http://127.0.0.1:8000/auth/github/callback",
            }
        }
    )
    return RedirectResponse(response.url)


@router.get("/github/callback")
def github_callback(request: Request):
    try:
        code = request.query_params.get("code")
        if not code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Authorization code not found")
        
        session_data = supabase.auth.exchange_code_for_session({"auth_code": code})
        
        return RedirectResponse(f"{FRONTEND_URL}/dashboard")

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
