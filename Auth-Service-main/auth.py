# auth.py
from fastapi import APIRouter, HTTPException, status, Depends
from schemas import UserCreate, UserLogin, Token, UserResponse
from database import supabase
from utils import hash_password, verify_password, create_access_token
from deps import get_current_user
from fastapi import Request
from starlette.responses import RedirectResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate):
    # check existing email
    check = supabase.table("users").select("*").eq("email", payload.email).execute()
    if check.data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    pw = hash_password(payload.password)
    resp = supabase.table("users").insert({
        "email": payload.email,
        "password": pw
    }).execute()

    if not resp.data:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create user")

    user = resp.data[0]
    user.pop("password", None)
    return user

@router.post("/login", response_model=Token)
def login(payload: UserLogin):
    resp = supabase.table("users").select("*").eq("email", payload.email).limit(1).execute()
    if not resp.data:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    user = resp.data[0]
    if not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    user_id = user["id"]
    access = create_access_token(subject=user_id)
    return {"access_token": access, "token_type": "bearer"}

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
    Callback endpoint for Google OAuth. This endpoint is called by Supabase after a successful login.
    It exchanges the code for a session and returns the user's details.
    """
    try:
        code = request.query_params.get("code")
        if not code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Authorization code not found")
        
        session_data = supabase.auth.exchange_code_for_session({"auth_code": code})
        user = session_data.user
        
        # You can now use the user object for your application's logic
        # For example, you could return the user's details or a JWT token

        return {
            "message": "Successfully logged in with Google!",
            "user": {
                "id": user.id,
                "email": user.email,
                "aud": user.aud,
                "created_at": user.created_at
            }
        }

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
    """
    Callback endpoint for GitHub OAuth. Exchanges the code for a session.
    """
    try:
        code = request.query_params.get("code")
        if not code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Authorization code not found")
        
        session_data = supabase.auth.exchange_code_for_session({"auth_code": code})
        user = session_data.user

        return {
            "message": "Successfully logged in with GitHub!",
            "user": {
                "id": user.id,
                "email": user.email,
                "aud": user.aud,
                "created_at": user.created_at
            }
        }

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
