# main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from auth import router as auth_router
from mangum import Mangum

# Load .env file for local development
load_dotenv()

app = FastAPI(title="Auth Microservice (email/password)")

# CORS — allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth routes
app.include_router(auth_router)

@app.get("/")
def root():
    return {"message": "Auth Service running"}

# Mangum handler for AWS Lambda
# SAM deploys directly to root, no prefix stripping needed
handler = Mangum(app, lifespan="off")

# For local development with uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
