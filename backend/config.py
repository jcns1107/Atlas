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
    ollama_default_model: str = "qwen3:1.7b"
    ollama_embed_model: str = "embeddinggemma"
    # Ollama's default window is small and overflow is cut silently, so we
    # always send num_ctx explicitly (see core/context/ for the budget logic).
    ollama_num_ctx: int = 8192
    # A Jev-style decision model for yes/no, pick-one and score questions (Phase 8).
    ollama_decision_model: str = "nimble"

    # Optional API providers
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    jev_api_key: str = ""  # hosted Jev decision model (TypeSafe)


settings = Settings()
