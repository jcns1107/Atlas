# Roadmap

A living checklist. Tick items as you finish them. Each phase maps to a section
in [GUIDE.md](../GUIDE.md).

## ✅ Phase 0 — Scaffold (done for you)
- [x] Project structure, git, `.gitignore`, `.env.example`
- [x] Docs: README, CLAUDE.md, ARCHITECTURE, ROADMAP, GUIDE
- [x] Runnable app shell: boots, serves the frontend, `/api/health`, `/docs`
- [x] A guided stub for every feature (what to build + why, no implementation)

Everything below is **yours to implement**.

## ⬜ Phase 1 — Your first chat (the skeleton)
- [ ] Install Ollama, pull a model
- [ ] Design the request schema (`backend/schemas/chat.py`)
- [ ] Define the provider interface (`backend/core/llm/base.py`)
- [ ] Implement the Ollama provider (`backend/core/llm/ollama_provider.py`)
- [ ] Implement `POST /api/chat` (stream the reply) + `GET /api/models`
- [ ] Build the minimal chat UI and wire it up

## ⬜ Phase 2 — Better chat
- [ ] Multiple conversations, saved to `data/`
- [ ] Pick model per conversation; system prompt field
- [ ] Markdown rendering in the UI

## ⬜ Phase 3 — Model management
- [ ] Implement the hardware recommender + `/api/models/recommend`
- [ ] Surface recommendations in the UI
- [ ] Pull/delete models from the UI (`/api/pull` proxy to Ollama)

## ⬜ Phase 4 — Built-in tools
- [ ] Tool interface + registry (name, schema, function)
- [ ] `files`, `web`, `bash` (sandboxed), `memory` tools
- [ ] Tool-call loop with a local model that supports tools

## ⬜ Phase 5 — Agents
- [ ] Agent schema (model, system prompt, tools[], memory)
- [ ] Create/edit/save agents from the UI
- [ ] Agent run loop wired into chat

## ⬜ Phase 6 — Memory & RAG (by hand)
- [ ] SQLite store (key, value, source, time)
- [ ] Write/recall during a conversation
- [ ] Embeddings (Ollama `nomic-embed-text`) + cosine-similarity retrieval
- [ ] Augment the prompt with retrieved snippets (this is RAG)
- [ ] Answer questions over a user-provided document

## ⬜ Phase 7 — MCP
- [ ] Connect an MCP server (stdio/HTTP)
- [ ] Expose its tools through the tool registry
- [ ] Per-tool enable/disable toggles in the UI

## ⬜ Phase 8 — Email assistant
- [ ] IMAP fetch + SMTP send (app password)
- [ ] Summaries, style-matched drafts
- [ ] Auto-tagging + spam/priority triage

## ⬜ Phase 9 — Deep Research (RAG over the web)
- [ ] Plan → search → read → synthesize loop
- [ ] Cited report written to `data/`

## ⬜ Phase 10 — Self-evolving Skills
- [ ] Skill schema + registry
- [ ] Author a skill from a successful task; refine after use

## ⬜ Phase 11 — Characters
- [ ] Persona schema (voice, backstory, avatar, sampling)
- [ ] Character builder UI

## ⬜ Phase 12 — API models + polish
- [ ] Anthropic + OpenAI providers behind the same interface
- [ ] Provider/model switcher; cost & token display
- [ ] (Stretch) voice in/out for "talk with your agents"

## ⬜ Phase 13 — RAG, for real (vector DB + framework)
- [ ] Move embeddings into a vector DB (Chroma/FAISS/Qdrant)
- [ ] Document loaders + chunking via LangChain or LlamaIndex
- [ ] Swap hand-rolled retrieval for a framework retriever (same interface)
- [ ] (Stretch) re-ranking / hybrid search

## ⬜ Phase 14 — Orchestrate with LangGraph
- [ ] Agent loop as a LangGraph graph (nodes / edges / state)
- [ ] Deep Research as a graph with source-tracking state
- [ ] Checkpoint + human-in-the-loop interrupt
