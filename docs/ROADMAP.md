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

## ✅ Phase 0 — Scaffold (done for you)
- [x] Project structure, git, `.gitignore`, `.env.example`
- [x] Docs: README, CLAUDE.md, ARCHITECTURE, ROADMAP, GUIDE
- [x] Runnable app shell: boots, serves the frontend, `/api/health`, `/docs`
- [x] A guided stub for every feature (what to build + why, no implementation)
- [x] uv project: `pyproject.toml` + `uv.lock`, optional extras per phase

Everything below is **yours to implement**.

## ⬜ Phase 1 — Your first chat (the skeleton)
- [ ] Install Ollama, pull a model (`qwen3:4b`)
- [ ] Design the request schema (`backend/schemas/chat.py`)
- [ ] Define the provider interface (`backend/core/llm/base.py`)
- [ ] Implement the Ollama provider (`backend/core/llm/ollama_provider.py`), sending `num_ctx`
- [ ] Implement `POST /api/chat` (stream the reply) + `GET /api/models`
- [ ] Build the minimal chat UI and wire it up

## ⬜ Phase 2 — Better chat
- [ ] Multiple conversations, saved to `data/`
- [ ] Pick model per conversation; system prompt field
- [ ] Markdown rendering in the UI
- [ ] Collapsible "thinking" block + think on/off toggle
- [ ] Token usage / "context used" display

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
- [ ] (Stretch) local speech-to-text / text-to-speech

## ⬜ Phase 12 — API models + polish
- [ ] Anthropic + OpenAI(-compatible) providers behind the same interface
- [ ] Provider/model switcher; model ids from settings; cost & token display
- [ ] Prompt caching on the Anthropic provider
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
