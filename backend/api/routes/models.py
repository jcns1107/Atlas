"""Model discovery + hardware-aware recommendations."""

from __future__ import annotations

from fastapi import APIRouter

from backend.core.llm import OllamaProvider
from backend.services.hardware.recommend import recommend_models, system_profile

router = APIRouter(tags=["models"])
_provider = OllamaProvider()


@router.get("/models")
async def list_models() -> dict:
    """Models the user has already pulled into Ollama."""
    try:
        installed = await _provider.list_models()
    except Exception:
        installed = []  # Ollama not running yet
    return {"installed": installed}


@router.get("/models/recommend")
async def recommend() -> dict:
    """Suggest models that fit this machine's RAM/VRAM."""
    profile = system_profile()
    return {"system": profile, "recommendations": recommend_models(profile)}
