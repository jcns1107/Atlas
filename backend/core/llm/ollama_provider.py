"""Ollama provider — YOUR job to implement (GUIDE.md, Phase 1).

Talk to a locally running Ollama server (default http://localhost:11434) and
implement the interface you defined in base.py.

Ollama's REST API (the two endpoints you need first):
  - POST /api/chat  : a chat completion. With {"stream": true} the response is
                      newline-delimited JSON — each line is a chunk that holds
                      message.content (the next piece of text) and a `done` flag.
  - GET  /api/tags  : the models the user has pulled.

What to implement:
  - list_models()                  -> the installed model names.
  - stream_chat(messages, model)   -> yield each text chunk as it arrives.

Hints:
  - Use `httpx2.AsyncClient` (httpx2 is the maintained fork of httpx — same API,
    so httpx tutorials still apply). For streaming, `client.stream("POST", url, json=...)`
    plus `async for line in resp.aiter_lines()`.
  - Each streamed line is JSON — parse it, pull out the text, `yield` it.
  - Read OLLAMA_BASE_URL / OLLAMA_DEFAULT_MODEL / OLLAMA_NUM_CTX from
    `backend.config.settings`.
  - Always send `"options": {"num_ctx": settings.ollama_num_ctx}`. Ollama's
    default window is small and anything past it is cut off WITHOUT an error —
    a classic "why did it forget the start of the chat?" bug.
  - Before coding, poke the API by hand to see the response shape, e.g.:
      curl http://localhost:11434/api/chat \
        -d '{"model":"qwen3:4b","messages":[{"role":"user","content":"hi"}]}'

Fields you'll meet in later phases (same endpoint, more of the chunk):
  - message.thinking   : "thinking" models (qwen3, gpt-oss, ...) stream their
                         reasoning here, separate from message.content. The
                         request flag `"think": true/false` turns it on/off.
                         (Phase 2: show it in a collapsible block.)
  - message.tool_calls : the model asking to run a tool (Phase 4).
  - "format": {...}    : pass a JSON schema in the request and the reply is
                         forced to match it — "structured outputs" (great for
                         the email triage in Phase 8 and research plans in 9).
  - prompt_eval_count / eval_count (on the final `done` chunk): how many tokens
                         the prompt and the answer used. That's real data for
                         your context budget in core/context/.
"""

from __future__ import annotations

import json
from collections.abc import AsyncIterator

# The package is "httpx2" and so is the module name. `import httpx` only worked
# by accident, because the unused `ollama` package pulls the old httpx in.
import httpx2

from backend.config import settings
from backend.core.llm.base import Message


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
        self, messages: list[Message], model: str | None = None
    ) -> AsyncIterator[str]:
        """Send the conversation to the model and yields the text as it arrives"""
        model = model or self.default_model
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": model,
            "messages": [message.model_dump() for message in messages],
            "stream": True,
            "options": {"num_ctx": self.num_ctx},
        }

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

                    if data.get("done"):
                        break

                    message = data.get("message", {})
                    content = message.get("content", "")
                    if content:
                        yield content
