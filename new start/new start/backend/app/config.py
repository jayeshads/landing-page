"""
LeadPilot Backend — Configuration.

Loads environment variables via pydantic-settings. Every setting has a
sensible default for local development so `uvicorn app.main:app --reload`
works out of the box with just a running MongoDB on localhost.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ─── MongoDB ───
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "leadpilot"

    # ─── JWT ───
    JWT_SECRET: str = "dev-secret-change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ─── CORS ───
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    # ─── Rate Limiting ───
    RATE_LIMIT_REQUESTS: int = 30
    RATE_LIMIT_WINDOW_SECONDS: int = 60

    # ─── Meta OAuth (Phase 2) ───
    META_APP_ID: str = ""
    META_APP_SECRET: str = ""
    META_REDIRECT_URI: str = "http://localhost:8000/api/meta/oauth/callback"

    # ─── LLM Providers (Phase 3) ───
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    GOOGLE_API_KEY: str = ""

    # ─── Razorpay (Phase 9) ───
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # ─── Encryption ───
    ENCRYPTION_KEY: str = ""

    # ─── General ───
    ENV: str = "development"
    DEBUG: bool = True

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
