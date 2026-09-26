"""
Application settings — read from environment variables only.
Never log the API key or allow it to be returned via the API.
"""

import os
from functools import lru_cache

from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env if present (local dev only; in prod, set env vars directly)
load_dotenv()


class Settings(BaseSettings):
    gemini_api_key: str = ""
    max_upload_bytes: int = 10 * 1024 * 1024  # 10 MB
    classification_confidence_threshold: float = 0.75
    # Gemini model to use for all LLM calls
    gemini_model: str = "gemini-3.6-flash"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    def has_api_key(self) -> bool:
        return bool(self.gemini_api_key)


@lru_cache
def get_settings() -> Settings:
    """Cached singleton — avoids repeated env-var reads."""
    return Settings()
