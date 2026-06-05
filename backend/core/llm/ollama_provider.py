"""Talk to a locally running Ollama server over its REST API.

Ollama exposes a simple HTTP API on http://localhost:11434. We use httpx
directly (rather than the `ollama` python package) so you can see exactly
what request is being made — useful while you're learning.
"""

from __future__ import annotations

import json
from collections.abc import AsyncIterator

import httpx

from backend.config import settings


class OllamaProvider:
    def __init__(self, base_url: str | None = None) -> None:
        self.base_url = (base_url or settings.ollama_base_url).rstrip("/")

    async def list_models(self) -> list[str]:
        """Return the names of models the user has pulled (`ollama pull ...`)."""
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{self.base_url}/api/tags")
            resp.raise_for_status()
            data = resp.json()
        return [m["name"] for m in data.get("models", [])]

    async def stream_chat(
        self,
        messages: list[dict[str, str]],
        model: str | None = None,
    ) -> AsyncIterator[str]:
        """Stream a chat completion from Ollama, one text chunk at a time."""
        payload = {
            "model": model or settings.ollama_default_model,
            "messages": messages,
            "stream": True,
        }
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST", f"{self.base_url}/api/chat", json=payload
            ) as resp:
                resp.raise_for_status()
                async for line in resp.aiter_lines():
                    if not line.strip():
                        continue
                    data = json.loads(line)
                    chunk = data.get("message", {}).get("content", "")
                    if chunk:
                        yield chunk
                    if data.get("done"):
                        break
