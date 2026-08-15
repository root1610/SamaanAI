import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Saaman API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = ""

    SECRET_KEY: str = "saaman_secret_jwt_key_2026_super_secure_change_in_prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # SQLite local zero-config database
    DATABASE_URL: str = "sqlite:///./saaman.db"

    # Static file uploads
    UPLOAD_DIR: str = "static/uploads"

    # AI Provider configuration (Optional LLM Vision API Keys)
    GEMINI_API_KEY: str | None = None
    OPENAI_API_KEY: str | None = None

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
