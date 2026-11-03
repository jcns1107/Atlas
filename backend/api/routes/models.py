"""Model endpoints — YOUR job to implement (GUIDE.md, Phases 1 & 3).

Two things live here eventually:
  - GET /api/models           -> which models the user has pulled into Ollama.
  - GET /api/models/recommend -> models that fit this machine (use
                                 backend/services/hardware/).

Why: the UI needs to know what models exist (to populate the picker) and which
ones are safe to run on the user's hardware.

Hints:
  - Ollama lists installed models at  GET {OLLAMA_BASE_URL}/api/tags.
  - Handle Ollama not running yet — return an empty list, don't crash the page.

Both routes return 501 for now so the app boots and they appear in /docs.
"""

from __future__ import annotations

import httpx2
from fastapi import APIRouter, HTTPException

from backend.api.deps import provider

router = APIRouter(tags=["models"])


@router.get("/models")
async def list_models() -> list[str]:
    """Return the names of the models the user has pulled into Ollama."""
    try:
        return await provider.list_models()
    except httpx2.ConnectError as exc:
        print(f"Ollama not reachable: {exc}")
        # Ollama not running yet — return an empty list, don't crash the page.
        return []


@router.get("/models/recommend")
async def recommend():
    raise HTTPException(status_code=501, detail="Not implemented yet — see GUIDE.md Phase 3.")
