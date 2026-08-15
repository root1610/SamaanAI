import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SamaanAI API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = ""
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "samaanai-secret-key-super-secure-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 Days
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./samaanai.db")
    
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "uploads")
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]

    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")

    class Config:
        case_sensitive = True

settings = Settings()
