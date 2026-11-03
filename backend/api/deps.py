"""Shared objects the API routes depend on."""

from __future__ import annotations
from functools import lru_cache

from backend.core.llm.base import ChatProvider
from backend.core.llm.ollama_provider import OllamaProvider

from backend.core.conversations.store import ConversationStore
from backend.config import DATA_DIR

# The one provider the whole app uses. Typed as the Protocol, so routes only see the interface.
provider: ChatProvider = OllamaProvider()


@lru_cache
def get_store() -> ConversationStore:
    """Return the one shared ConversationStore."""

    return ConversationStore(DATA_DIR / "conversations")
