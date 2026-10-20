# Architecture

How Atlas fits together. Keep this short and current as the design evolves.

## The big picture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (frontend/)  — plain HTML/CSS/JS                    │
│  chat UI · agent builder · tool toggles · approvals · email  │
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
│   THE HARNESS (agents/runner)                                │
│     context ──> assemble prompt: instructions, core          │
│     │           memories, skills index, summary, recent turns│
│     ▼                                                        │
│     llm provider ──> Ollama | Claude | OpenAI-compatible     │
│     │   (tool calls?)                                        │
│     ▼                                                        │
│     permissions (allow / ask / deny) ──> tools               │
│     │                     built-ins · docs search · MCP      │
│     └── results back into context; compact when it's full   │
│                                                              │
│   memory · rag (embed / store / retrieve) · skills (SKILL.md)│
└───────────────┬─────────────────────────────────────────────┘
                │
   services/ (email, research, hardware)  ·  data/ (JSON, markdown, SQLite)
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
  Local vs API is just a different provider; nothing else changes. It streams
  plain text at first, then typed events (text / thinking / tool call / done).
- **`DecisionProvider`** (`core/llm/`, Phase 8) — a second, smaller seam for
  *decision models* (TypeSafe's Jev format): a state + typed questions in
  (yes/no, pick-one, score), answers with probabilities out. Local Ollama or
  hosted Jev. Used for triage, the "enough sources?" check, and tool guards.
- **Agent** = model + instructions (`AGENTS.md`) + allowed tools with permissions
  + memory + context policy, stored as data in `data/agents/<name>/`.
- **Tool** = a function + a JSON schema + a permission. A registry maps name →
  tool so the harness can dispatch a model's tool call.
- **MCP** = external tool servers exposed through the *same* tool interface, so
  built-ins and MCP tools are interchangeable to the agent.
- **Context** (`core/context/`) = the token budget, the order the prompt is
  assembled in, the stuff/search/retrieve router, and compaction.
- **Memory / Skills / Characters** = data the assistant reads, writes, and (for
  skills) improves over time. Skills follow the Agent Skills `SKILL.md` format.

## Request lifecycle (chat)

1. Browser POSTs `{messages, model}` to `/api/chat`.
2. The chat router calls the provider's `stream_chat(...)`.
3. The provider streams chunks from Ollama's `/api/chat`.
4. The router re-emits them as SSE; the browser appends them live.

When agents land (Phases 4–5), step 2 becomes "run the harness":
assemble context → call model → if it asks for tools, check permissions (maybe
pause for the user's approval), run them, add the results → repeat until it
answers in words → compact if the window is getting full. The transport stays
identical; the SSE frames just carry typed events (thinking, tool call, tool
result, text) instead of bare text.

## Why these choices

- **Ollama** — dead-simple local model serving with a clean REST API (and an
  OpenAI-compatible one at `/v1`).
- **FastAPI** — async (good for streaming), typed, tiny learning curve.
- **uv** — one tool for Python versions, the venv, and locked dependencies.
- **No frontend framework** — you wanted to design with HTML/CSS directly, and
  it removes a build step while learning. Swap in React/Svelte later if desired.
- **Data-as-files** — agents/characters/skills are inspectable and shareable.

## Context strategies (stuff → search → retrieve)

The model only knows what's in its context window, so every feature that uses
your data has to decide how to get it there. Atlas picks the **cheapest strategy
that fits** (`core/context/`):

1. **Stuff** — small enough? Put it straight in the prompt. Nothing can be
   "missed", and there's no pipeline to maintain.
2. **Search** — tens-to-hundreds of files? Give the agent `docs` tools (list,
   grep, read) and let it look things up, like a coding agent does.
3. **Retrieve (RAG)** — a large or growing corpus? Embed chunks once and fetch
   the top-k by meaning (`core/rag/`), later with hybrid keyword + vector search.

You build all three by hand (Phase 6) and measure them on your own docs. Phase
13 scales retrieval up *inside SQLite* (sqlite-vec + FTS5 hybrid search) behind
the same `core/rag/` interface. A vector database (Chroma/Qdrant) and frameworks
— **LlamaIndex** / **LangChain** for retrieval, **LangGraph** for multi-step
orchestration (Phase 14) — are an optional, informed comparison later, never a
starting dependency.
