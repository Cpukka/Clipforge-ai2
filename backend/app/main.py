from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.database import engine, Base
from app.routers import auth, videos, clips, admin, users
from app.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

app = FastAPI(
    title="ClipForge AI API",
    description="AI-powered video repurposing platform",
    version="1.0.0"
)

# Mount static files for uploads - THIS IS CRITICAL FOR VIDEO PLAYBACK
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS configuration - Allow multiple origins including production frontend
# Use settings.CORS_ORIGINS if available, otherwise use defaults
origins = [
    "https://clipforge-ai2.vercel.app",
    "https://clipforge-ai2.onrender.com",
    "http://localhost:3000",
    "http://localhost:8000",
]

# If CORS_ORIGINS is set in settings, use it
if hasattr(settings, 'CORS_ORIGINS') and settings.CORS_ORIGINS:
    if isinstance(settings.CORS_ORIGINS, str):
        # Parse comma-separated string
        origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
    else:
        origins = settings.CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,  # Cache preflight requests for 24 hours
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(videos.router, prefix="/api/videos", tags=["Videos"])
app.include_router(clips.router, prefix="/api/clips", tags=["Clips"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "Welcome to ClipForge AI API", "status": "healthy"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# OPTIONS handler for CORS preflight (if needed)
@app.options("/{path:path}")
async def options_handler():
    return {}