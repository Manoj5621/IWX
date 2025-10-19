import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database Configuration
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017/iwx_ecommerce")
    mysql_host: str = os.getenv("MYSQL_HOST", "localhost")
    mysql_port: int = int(os.getenv("MYSQL_PORT", "3306"))
    mysql_user: str = os.getenv("MYSQL_USER", "root")
    mysql_password: str = os.getenv("MYSQL_PASSWORD", "root")
    mysql_database: str = os.getenv("MYSQL_DATABASE", "iwx")

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

    # Admin Configuration
    admin_email: str = "admin@iwx.com"
    admin_password: str = "admin123"

    class Config:
        env_file = ".env"
        case_sensitive = False
        env_ignore_empty = True
        extra = "ignore"

settings = Settings()