"""The provider interface every model backend implements.

Why an interface? So 'chat with a local Ollama model' and 'chat with the
Claude API' look identical to the rest of Atlas. When you add the Anthropic
provider in a later phase, implement this same `stream_chat` method and
nothing else has to change.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Protocol


class ChatProvider(Protocol):
    """Anything that can turn a list of messages into streamed text."""

    async def stream_chat(
        self,
        messages: list[dict[str, str]],
        model: str | None = None,
    ) -> AsyncIterator[str]:
        """Yield response text chunks as they arrive."""
        ...
