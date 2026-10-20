"""LLM provider layer.

The idea: define ONE interface for "chat with a model", then write a small
provider per backend. The rest of Atlas talks to the interface and never cares
which model actually answers — that's what lets you swap a local model for an
API model later without touching anything else.

Files to build (GUIDE.md, Phases 1 & 12):
  - base.py            : the provider interface (the seam).
  - ollama_provider.py : talk to a local Ollama server.
  - (later) anthropic_provider.py / openai_provider.py for API models.
    Fun fact: Ollama also speaks the OpenAI API at /v1, so one
    "OpenAI-compatible" provider can talk to Ollama, OpenAI, and many others.
  - (later) decide.py : a second, smaller seam — a `DecisionProvider` for
    *decision models* (Phase 8). Instead of free text, you send a `state` plus
    typed questions — yes/no ("noul"), pick-one ("choice"), or a rubric level
    ("score") — and get each answer back with a probability/confidence. The
    format comes from TypeSafe's hosted **Jev** model; recent Ollama versions
    serve Jev-style models locally (e.g. `nimble`) at `/v1/systemone`. Two
    implementations, same shape: local Ollama and hosted Jev (key in `.env`).
    Check Ollama's release notes for the exact request/response fields.

Tip: once you write these, you can re-export them here, e.g.
    from backend.core.llm.ollama_provider import OllamaProvider
so other modules can `from backend.core.llm import OllamaProvider`.
"""
