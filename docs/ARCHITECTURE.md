# Architecture

How Atlas fits together. Keep this short and current as the design evolves.

## The big picture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (frontend/)  — plain HTML/CSS/JS                    │
│  chat UI · agent builder · tool toggles · email · research   │
└───────────────┬─────────────────────────────────────────────┘
                │  HTTP + Server-Sent Events  (/api/*)
┌───────────────▼─────────────────────────────────────────────┐
│  FastAPI  (backend/api/)                                     │
│  one router per feature; thin — just translates HTTP <-> core │
└───────────────┬─────────────────────────────────────────────┘
                │  plain function calls (no web types)
┌───────────────▼─────────────────────────────────────────────┐
│  Core domain  (backend/core/)                                │
│                                                              │
│   agents ──uses──> tools ──includes──> MCP servers           │
│     │                 │                                      │
│     ├──uses──> memory  └──> built-ins: bash/files/web/memory │
│     ├──uses──> skills                                        │
│     └──runs on──> llm provider ──> Ollama | Claude | OpenAI  │
└───────────────┬─────────────────────────────────────────────┘
                │
   services/ (email, research, hardware)  ·  data/ (JSON + SQLite)
```

## Layers & the one rule

1. **frontend/** — what the user sees. Talks only to `/api/*`.
2. **api/** — FastAPI routers. Thin: validate input, call core, stream output.
3. **core/** — the actual logic. **Must not import FastAPI.** This keeps it
   testable and reusable from a script or CLI.
4. **services/** — features that compose core (email, research, hardware).
5. **data/** — local persistence (gitignored, per-machine).

The one rule that keeps this clean: **dependencies point downward.** `api`
depends on `core`; `core` never depends on `api`.

## Key abstractions

- **`ChatProvider`** (`core/llm/base.py`) — the seam between Atlas and any model.
  Local vs API is just a different provider; nothing else changes.
- **Agent** = model + system prompt + allowed tools + memory, stored as JSON.
- **Tool** = a function + a JSON schema. A registry maps name → function so an
  agent can dispatch a model's tool call.
- **MCP** = external tool servers exposed through the *same* tool interface, so
  built-ins and MCP tools are interchangeable to the agent.
- **Memory / Skills / Characters** = data the assistant reads, writes, and (for
  skills) improves over time.

## Request lifecycle (chat today)

1. Browser POSTs `{messages, model}` to `/api/chat`.
2. The chat router calls the `OllamaProvider.stream_chat(...)`.
3. The provider streams chunks from Ollama's `/api/chat`.
4. The router re-emits them as SSE; the browser appends them live.

When agents land, step 2 becomes "run the agent loop" (call model → maybe run a
tool → feed the result back → repeat) but the transport stays identical.

## Why these choices

- **Ollama** — dead-simple local model serving with a clean REST API.
- **FastAPI** — async (good for streaming), typed, tiny learning curve.
- **No frontend framework** — you wanted to design with HTML/CSS directly, and
  it removes a build step while learning. Swap in React/Svelte later if desired.
- **Data-as-files** — agents/characters/skills are inspectable and shareable.
