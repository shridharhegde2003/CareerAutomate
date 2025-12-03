# main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from auth import router as auth_router
from auth import router as auth_router

load_dotenv()

app = FastAPI(title="Auth Microservice (email/password)")

# CORS — change allow_origins in prod
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "Auth Service running"}
