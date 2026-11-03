"""Ollama provider: talks to a local Ollama server (default http://localhost:11434).

Implements the ChatProvider interface from base.py, so routes never need to know
they're talking to Ollama.

Endpoints used:
  - GET  /api/tags : the models the user has pulled -> list_models().
  - POST /api/chat : a chat completion. With {"stream": true} the reply is
                     newline-delimited JSON — one JSON object per line.
                     stream_chat() turns each line into StreamChunks:
                       message.thinking -> "thinking" chunk
                       message.content  -> "text" chunk
                       done: true       -> one "done" chunk with token counts
                                           (prompt_eval_count / eval_count)

Things worth knowing:
  - `num_ctx` is sent on every call. Ollama's default context window is small
    and anything past it is cut off WITHOUT an error — a classic "why did it
    forget the start of the chat?" bug.
  - `think` is only sent when set. Thinking models (qwen3, gpt-oss, ...) think
    by default; sending `"think": true` to a model that can't think is an error.
  - Errors arrive two ways: as an HTTP error before streaming starts (e.g. model
    not found) or as an {"error": ...} line mid-stream. Both raise RuntimeError;
    the route turns that into an "error" frame for the browser.

Fields for later phases (same endpoint):
  - message.tool_calls : the model asking to run a tool (Phase 4).
  - "format": {...}    : a JSON schema in the request forces the reply to match
                         it — "structured outputs" (Phase 8 triage, Phase 9 plans).
"""

from __future__ import annotations

import json
from collections.abc import AsyncIterator

# The package is "httpx2" and so is the module name. `import httpx` only worked
# by accident, because the unused `ollama` package pulls the old httpx in.
import httpx2

from backend.config import settings
from backend.core.llm.base import Message, StreamChunk


class OllamaProvider:
    """Talk to a local Ollama server (default http://localhost:11434).

    Implements the ChatProvider interface from base.py.
    """

    def __init__(self) -> None:
        """Initialize the OllamaProvider."""
        self.base_url = settings.ollama_base_url
        self.default_model = settings.ollama_default_model
        self.num_ctx = settings.ollama_num_ctx

    async def list_models(self) -> list[str]:
        """Return list of models of the provider"""
        url = f"{self.base_url}/api/tags"
        async with httpx2.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            data = response.json()
            return [m["name"] for m in data["models"]]

    async def stream_chat(
        self, messages: list[Message], model: str | None = None, think: bool | None = None
    ) -> AsyncIterator[StreamChunk]:
        """Send the conversation to the model and yields the text as it arrives"""
        model = model or self.default_model
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": model,
            "messages": [message.model_dump() for message in messages],
            "stream": True,
            "options": {"num_ctx": self.num_ctx},
        }
        if think is not None:
            payload["think"] = think

        async with httpx2.AsyncClient(timeout=httpx2.Timeout(10.0, read=300.0)) as client:
            async with client.stream("POST", url, json=payload) as response:
                # Errors like "model not found" come back as an HTTP error *before*
                # streaming starts. A streamed response doesn't load its body
                # automatically, so read it to get the reason.
                if response.is_error:
                    await response.aread()
                    raise RuntimeError(f"Ollama error {response.status_code}: {response.text}")

                async for line in response.aiter_lines():
                    if not line:
                        continue

                    data = json.loads(line)
                    if "error" in data:
                        raise RuntimeError(f"Ollama error: {data['error']}")

                    message = data.get("message", {})
                    thinking = message.get("thinking", "")
                    if thinking:
                        yield StreamChunk(kind="thinking", text=thinking)
                    content = message.get("content", "")
                    if content:
                        yield StreamChunk(kind="text", text=content)

                    if data.get("done"):
                        yield StreamChunk(
                            kind="done",
                            prompt_tokens=data.get("prompt_eval_count"),
                            output_tokens=data.get("eval_count"),
                        )
                        break
