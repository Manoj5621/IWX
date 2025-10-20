import os
from pydantic_settings import BaseSettings
from typing import List
from dotenv import load_dotenv

class Settings(BaseSettings):
    # Database Configuration
    mongodb_url: str = "mongodb://localhost:27017/iwx_ecommerce"
    mysql_host: str = "localhost"
    mysql_port: int = 3306
    mysql_user: str = "root"
    mysql_password: str = "root"
    mysql_database: str = "iwx"

    # JWT Configuration
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Redis Configuration
    redis_url: str = "redis://localhost:6379"

    # OpenAI Configuration
    openai_api_key: str = ""

    # Email Configuration
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""

    # Application Settings
    debug: str = "true"
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Google OAuth Configuration
    google_client_id: str = "1068779575227-03k4ej3orh45e3q2u9rhnb7ea4afilrg.apps.googleusercontent.com"
    google_client_secret: str = "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"
    google_redirect_uri: str = "http://localhost:8000/auth/google/callback"

    # Admin Configuration
    admin_email: str = "admin@iwx.com"
    admin_password: str = "admin123"

    class Config:
        env_file = ".env"
        case_sensitive = False
        env_ignore_empty = True
        extra = "ignore"

# Load environment variables from .env file
load_dotenv()

settings = Settings()