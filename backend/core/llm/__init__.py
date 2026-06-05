"""LLM provider layer.

`base.py` defines the common interface; each provider (Ollama, Anthropic,
OpenAI, ...) implements it so the rest of Atlas never cares which model
is answering. Add new providers here and register them.
"""

from backend.core.llm.base import ChatProvider
from backend.core.llm.ollama_provider import OllamaProvider

__all__ = ["ChatProvider", "OllamaProvider"]
