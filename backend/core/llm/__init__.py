"""LLM provider layer.

The idea: define ONE interface for "chat with a model", then write a small
provider per backend. The rest of Atlas talks to the interface and never cares
which model actually answers — that's what lets you swap a local model for an
API model later without touching anything else.

Files to build (GUIDE.md, Phases 1 & 12):
  - base.py            : the provider interface (the seam).
  - ollama_provider.py : talk to a local Ollama server.
  - (later) anthropic_provider.py / openai_provider.py for API models.

Tip: once you write these, you can re-export them here, e.g.
    from backend.core.llm.ollama_provider import OllamaProvider
so other modules can `from backend.core.llm import OllamaProvider`.
"""
