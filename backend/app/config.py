from pydantic_settings import BaseSettings
from typing import List, Union
import json

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://postgres:Ubo%401234@localhost/clipforge"
    
    # JWT
    SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_BUCKET_NAME: str = "clipforge-ai"
    AWS_REGION: str = "us-east-1"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # OpenAI
    OPENAI_API_KEY: str = ""
    
    # CORS - handle multiple formats: JSON array, comma-separated, or single string
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000"
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 500 * 1024 * 1024  # 500MB
    ALLOWED_VIDEO_TYPES: List[str] = ["video/mp4", "video/quicktime", "video/mpeg", "video/webm"]
    
    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore extra fields from env
    
    def get_cors_origins(self) -> List[str]:
        """Parse CORS origins from various formats into a list"""
        if isinstance(self.CORS_ORIGINS, list):
            return self.CORS_ORIGINS
        
        if isinstance(self.CORS_ORIGINS, str):
            # Try to parse as JSON array first
            if self.CORS_ORIGINS.strip().startswith('['):
                try:
                    return json.loads(self.CORS_ORIGINS)
                except json.JSONDecodeError:
                    pass
            
            # Fallback to comma-separated
            return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        
        return ["http://localhost:3000"]  # Default fallback

settings = Settings()