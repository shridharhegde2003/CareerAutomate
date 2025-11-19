# profiles.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, HttpUrl
from typing import List, Optional
from datetime import date
from database import supabase
from deps import get_current_user

router = APIRouter(prefix="/profiles", tags=["profiles"])

class CareerPreferences(BaseModel):
    preferred_roles: List[str]
    target_lpa: Optional[int] = None
    preferred_locations: List[str]
    work_preference: List[str]
    other_preferences: List[str]

class ProfileCreate(BaseModel):
    full_name: str
    date_of_birth: date
    secondary_email: Optional[EmailStr] = None
    address: str
    linkedin_url: Optional[HttpUrl] = None
    github_username: Optional[str] = None
    skills: List[str]
    career_preferences: CareerPreferences

@router.post("/onboarding", status_code=status.HTTP_201_CREATED)
def create_user_profile(payload: ProfileCreate, current_user = Depends(get_current_user)):
    user_id = current_user['id']

    profile_data = {
        'id': user_id,
        'full_name': payload.full_name,
        'date_of_birth': str(payload.date_of_birth),
        'secondary_email': payload.secondary_email,
        'address': payload.address,
        'linkedin_url': str(payload.linkedin_url) if payload.linkedin_url else None,
        'github_username': payload.github_username,
        'skills': payload.skills,
        'career_preferences': payload.career_preferences.dict(),
        'onboarding_completed': True
    }

    try:
        # Use upsert to either insert a new profile or update an existing one
        resp = supabase.table("profiles").upsert(profile_data).execute()
        if not resp.data:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create or update profile")
        
        return resp.data[0]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
