"""
Application configuration using Pydantic BaseSettings.
Reads from .env file and environment variables.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    # Security
    internal_token: str = Field(
        default="dev_token_for_testing",
        description="Secret token for internal service-to-service auth",
    )

    # LLM Provider Keys
    groq_api_key: str = Field(
        default="",
        description="Groq API key for primary LLM provider",
    )
    gemini_api_key: str = Field(
        default="",
        description="Google Gemini API key for fallback LLM provider",
    )

    # Embedding Model
    embedding_model_name: str = Field(
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        description="HuggingFace model name for semantic embeddings",
    )

    # Logging
    log_level: str = Field(
        default="INFO",
        description="Logging level (DEBUG, INFO, WARNING, ERROR)",
    )

    # Rate Limiting
    rate_limit: str = Field(
        default="5/minute",
        description="Rate limit per student_id",
    )

    # LLM Settings
    llm_timeout: int = Field(
        default=45,
        description="Timeout in seconds for LLM API calls",
    )
    llm_max_retries: int = Field(
        default=2,
        description="Max retries on schema validation failure",
    )
    groq_model: str = Field(
        default="llama-3.1-8b-instant",
        description="Groq model name",
    )
    gemini_model: str = Field(
        default="gemini-2.0-flash",
        description="Gemini model name",
    )

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": False,
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton."""
    return Settings()
