# Roadmap

A living checklist. Tick items as you finish them. Each phase maps to a section
in [GUIDE.md](../GUIDE.md).

## 🔄 Oct 2026 refresh — what changed

The plan was first written in March 2026. Before any feature was built, it was
updated to current practice:

- **Context first, RAG last.** Phase 6 now teaches three strategies — *stuff* the
  docs into the prompt, let the agent *search* them with tools, or *retrieve*
  with RAG — and has you measure which wins. New stub: `backend/core/context/`
  (token budget, prompt assembly, strategy router, compaction). It's internal —
  no API route or UI of its own.
- **The harness is explicit.** Phase 4 adds permissions (allow / ask / deny),
  limits, and typed stream events; Phase 5 adds context assembly and compaction;
  Phase 9 uses sub-agents with isolated context; Phase 10 uses progressive
  disclosure.
- **Models:** `llama3.2` → `qwen3` (tools + thinking); embeddings
  `nomic-embed-text` → `embeddinggemma` via `/api/embed`; always set `num_ctx`.
- **Packages:** pip + `requirements.txt` → **uv** + `pyproject.toml` extras;
  `duckduckgo-search` → `ddgs`; MCP SDK v2 (2026-07-28 spec, Streamable HTTP).
- **Skills** use the open Agent Skills format (`SKILL.md`).
- **Phase 13** starts with hybrid search inside SQLite (sqlite-vec + FTS5);
  Chroma and frameworks are an optional comparison.
- **Decision models:** Phase 8 adds Jev-style decision models (yes/no, choice,
  score + confidence) behind a `DecisionProvider`, compared with structured outputs.
- **httpx → httpx2** (the maintained fork, same API).
- **Safety:** prompt-injection guidance for web and email content.

## 🎨 Nov 2026 — the UI becomes a product

The HUD was rebuilt as an app (by Claude, see `DESIGN.md`): your chats in a
sidebar on the left, the conversation in the middle, and Atlas itself — the
living Earth, its state and a few real vitals — on the right. The module list
and the Systems drawer are gone; the screen shows what Atlas is, not what's left
to build (that lives here). The Earth now reacts to you: drag it to spin it,
hover to read coordinates, and watch signal arcs fly while it thinks. The expand
button turns it into a full-screen **presence view**, the groundwork for voice
mode (Phase 15).

## ✅ Phase 0 — Scaffold (done for you)
- [x] Project structure, git, `.gitignore`, `.env.example`
- [x] Docs: README, CLAUDE.md, ARCHITECTURE, ROADMAP, GUIDE
- [x] Runnable app shell: boots, serves the frontend, `/api/health`, `/docs`
- [x] A guided stub for every feature (what to build + why, no implementation)
- [x] uv project: `pyproject.toml` + `uv.lock`, optional extras per phase

Everything below is **yours to implement**.

## ✅ Phase 1 — Your first chat (the skeleton)
- [x] Install Ollama, pull a model (`qwen3:4b`)
- [x] Design the request schema (`backend/schemas/chat.py`)
- [x] Define the provider interface (`backend/core/llm/base.py`)
- [x] Implement the Ollama provider (`backend/core/llm/ollama_provider.py`), sending `num_ctx`
- [x] Implement `POST /api/chat` (stream the reply) + `GET /api/models`
- [x] Build the minimal chat UI and wire it up — done by Claude: the JARVIS-style HUD in
      `frontend/` (chat with streaming, module ring that lights up per route, real
      telemetry, boot sequence). Reads SSE frames as `{"kind": ...}` JSON.

## ⬜ Phase 2 — Better chat
- [x] Conversation store + routes (`/api/conversations`): create / list / get / rename / delete
- [x] Frontend (Claude): chat list in the sidebar (new, open, rename, delete; `#/c/<id>`
      links survive a reload), per-chat model, thinking and instructions fields
- [ ] Save the messages: `ChatRequest.conversation_id`, then store the request's
      messages + the reply after streaming (GUIDE Phase 2, step 8)
- [ ] Apply the chat's system prompt in `/api/chat` (the UI already saves it on the chat)
- [x] Markdown rendering in the UI — done by Claude with the HUD (`frontend/js/markdown.js`)
- [x] Collapsible "thinking" block + think on/off toggle — backend: `think` through
      schema → route → provider, typed `StreamChunk`s; frontend (Claude): Thinking
      select (Default / On / Off) next to the model picker
- [x] Token usage / "context used" display — backend: `done` chunk with
      `prompt_tokens` / `output_tokens`; frontend (Claude): reply meta, Stream panel,
      Session meter + core arc (amber past 75%)
- [ ] (Backend) Send `context_window` on the `done` chunk so the UI stops mirroring
      `num_ctx` in `frontend/js/telemetry.js`
- [ ] (Backend) Check whether `prompt_eval_count` excludes cached tokens
      (`prompt_eval_cached_count`) — send two messages and compare

## ⬜ Phase 3 — Model management
- [ ] Implement the hardware recommender + `/api/models/recommend`
- [ ] Capability badges from `/api/show` (tools / thinking / vision)
- [ ] Surface recommendations in the UI
- [ ] Pull/delete models from the UI (`/api/pull` proxy to Ollama)

## ⬜ Phase 4 — Built-in tools & the harness loop
- [ ] Tool interface + registry (name, schema, function, permission)
- [ ] Typed stream events (text / thinking / tool_call / done)
- [ ] `files`, `docs` (list/grep/read), `web`, `memory`, `bash` (sandboxed) tools
- [ ] Harness loop with parallel calls, max iterations, errors-as-results, size caps
- [ ] Permissions (allow / ask / deny) with approve/deny in the UI
- [ ] (Stretch, after Phase 8) decision-model guard that can only escalate allow → ask

## ⬜ Phase 5 — Agents
- [ ] Agent schema (`agent.json` + `AGENTS.md` instructions)
- [ ] Create/edit/save agents from the UI (tool-capable models only)
- [ ] Agent run loop wired into chat
- [ ] Context assembly in `core/context/` (stable prefix)
- [ ] Compaction when the context passes ~75%

## ⬜ Phase 6 — Memory & context (stuff → search → retrieve)
- [ ] SQLite store (key, value, source, time) + memory tool
- [ ] Core memories always in context; recall on demand
- [ ] Strategy 1: stuff small docs into the prompt
- [ ] Strategy 2: agentic search with the `docs` tools
- [ ] Strategy 3: RAG by hand (`/api/embed` + cosine similarity)
- [ ] Router picks the strategy from size vs budget
- [ ] Mini-eval: ~10 Q&A pairs, compare the three strategies

## ⬜ Phase 7 — MCP
- [ ] Connect an MCP server (stdio / Streamable HTTP) with the SDK v2 `Client`
- [ ] Expose its tools through the tool registry (with permissions)
- [ ] Per-tool enable/disable toggles in the UI
- [ ] (Stretch) expose Atlas as an MCP server

## ⬜ Phase 8 — Email assistant
- [ ] IMAP fetch + SMTP send (app password)
- [ ] Summaries, style-matched drafts
- [ ] Auto-tagging + spam/priority triage (structured outputs)
- [ ] `DecisionProvider` (local Ollama `nimble`; optional hosted Jev)
- [ ] Triage as decisions (noul / choice / score) with confidence thresholds
- [ ] Compare both on ~20 labelled emails
- [ ] Prompt-injection guardrails (no web tool, send on *ask*)

## ⬜ Phase 9 — Deep Research
- [ ] Structured-output planner
- [ ] Search (`ddgs`) + read (readable text extraction)
- [ ] Sub-agents with isolated context per sub-question
- [ ] Cited report written to `data/`
- [ ] A small research eval set

## ⬜ Phase 10 — Self-evolving Skills
- [ ] `SKILL.md` folders (Agent Skills format) + registry/index
- [ ] `load_skill` tool (progressive disclosure)
- [ ] Author a skill from a successful task; refine after use (with approval)

## ⬜ Phase 11 — Characters
- [ ] Persona schema (voice, backstory, avatar, sampling)
- [ ] Character builder UI
- [ ] (Stretch) a TTS voice per character (after Phase 15)

## ⬜ Phase 12 — API models + polish
- [ ] Anthropic + OpenAI(-compatible) providers behind the same interface
- [ ] Provider/model switcher; model ids from settings; cost & token display
- [ ] Prompt caching on the Anthropic provider
- [ ] Provider-neutral errors: move `ConnectError` handling out of `api/routes/models.py`, and handle Ollama error responses (not just "not running") — see TODOs there
- [ ] Polish pass

## ⬜ Phase 13 — Retrieval at scale
- [ ] Vectors in sqlite-vec (same interface)
- [ ] FTS5 / BM25 keyword index
- [ ] Hybrid search with Reciprocal Rank Fusion
- [ ] Contextual chunk headers; rerun the eval
- [ ] (Optional) Chroma + LlamaIndex/LangChain comparison

## ⬜ Phase 14 — Orchestrate with LangGraph
- [ ] Agent loop as a LangGraph graph (nodes / edges / state)
- [ ] Deep Research as a graph with source-tracking state
- [ ] Checkpoint + human-in-the-loop interrupt
- [ ] (Optional) compare with Pydantic AI

## ⬜ Phase 15 — Voice mode
- [ ] `voice` extra + settings (STT model, TTS voice, sample rate)
- [ ] STT: `core/voice/stt.py` (faster-whisper) + `POST /api/voice/transcribe`
- [ ] TTS: `core/voice/tts.py` (Piper or Kokoro) + `POST /api/voice/speak`
- [ ] Speak sentence by sentence while the reply streams
- [ ] (Stretch) `WebSocket /api/voice` with VAD and barge-in
- [ ] Frontend (Claude): voice mode — the presence view without the text box:
      full-screen Earth, mic button, captions, voice bars driven by the real audio
