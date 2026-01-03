from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    DATABASE_URL: str = "postgresql://dontkillit:plantcare123@localhost:5432/dontkillit"

    # API Keys
    GOOGLE_SEARCH_API_KEY: str = ""
    GOOGLE_SEARCH_ENGINE_ID: str = ""
    PLANTNET_API_KEY: str = ""
    RESEND_API_KEY: str = ""

    # JWT Authentication
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "capacitor://localhost",
        "ionic://localhost",
        "http://localhost",
        "https://app.dontkillitapp.local",
        "capacitor://app.dontkillitapp.local",
        "http://10.0.0.78:5173",
        "http://10.0.0.78:8000"
    ]

    # App Settings
    DEBUG: bool = True
    APP_NAME: str = "DontKillIt Plant Care API"
    VERSION: str = "1.0.0"

    # File Upload
    UPLOAD_DIR: str = "uploads/photos"
    MAX_UPLOAD_SIZE_MB: int = 10

    # Notifications
    FROM_EMAIL: str = "noreply@dontkillit.com"
    NOTIFICATION_CHECK_INTERVAL_HOURS: int = 1

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
