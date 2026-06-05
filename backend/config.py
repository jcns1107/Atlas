"""Central configuration, loaded from environment / .env file.

Everything tunable lives here so the rest of the code never reads os.environ
directly. Import the singleton `settings` wherever you need a value.
"""

from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Project root = the folder that contains this `backend/` package's parent.
ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
FRONTEND_DIR = ROOT_DIR / "frontend"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Server
    atlas_host: str = "127.0.0.1"
    atlas_port: int = 8000
    atlas_reload: bool = True

    # Ollama
    ollama_base_url: str = "http://localhost:11434"
    ollama_default_model: str = "llama3.2"

    # Optional API providers
    anthropic_api_key: str = ""
    openai_api_key: str = ""


settings = Settings()
