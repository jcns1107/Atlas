# 🧭 The Atlas Build Guide

A step-by-step path to build Atlas — your local AI Swiss-army knife — from the
scaffold that's already here to the full vision. The repo ships the structure
and a *guided stub* for each piece — a short note on what to build and why — but
no feature code: **you write that.** It's written for someone **learning as they
build**, in the spirit of PewDiePie's Odysseus: own it, shape it, understand
every piece.

## How to use this guide

- **Build in order.** Each phase stands on the previous one. Don't skip to the
  email assistant before you have agents and tools — you'll just get stuck.
- **One phase at a time.** Finish a phase, tick it in
  [docs/ROADMAP.md](docs/ROADMAP.md), commit, then move on.
- **Learn just-in-time.** Each phase lists *exactly* what to learn for that step.
  Don't try to learn "all of Python" first — learn the slice you need, use it,
  move on. You'll learn faster building something real.
- **Commit often.** Small commits = a safety net and a visible track record.
- **It's okay to be slow.** A weekend per phase is normal. The point is to
  understand what you build.

> **Legend:** 🎯 goal · 📚 learn this · 🔨 steps · ✅ done when

---

## Phase 0 — The toolbox (learn these first)

Before writing features, get comfortable with the core tools. You don't need
mastery — just enough to be dangerous. Spend a few days here.

### The non-negotiables

| Tool | Why you need it | Where to start |
| --- | --- | --- |
| **Command line** (PowerShell) | Run everything: Python, git, Ollama | Microsoft "PowerShell 101" |
| **Python 3.11+** | The whole backend | [Python official tutorial](https://docs.python.org/3/tutorial/) |
| **Git & GitHub** | Save work, track history, undo mistakes | [GitHub "Hello World"](https://docs.github.com/en/get-started) |
| **Ollama** | Runs the AI models locally | [ollama.com](https://ollama.com) |
| **HTML / CSS / JS** | The UI you design | [MDN](https://developer.mozilla.org/) "Getting started" |
| **HTTP & JSON** | How frontend ⇄ backend talk | MDN "An overview of HTTP" |

### Python concepts to be comfortable with

- Variables, functions, `if`/`for`, lists & dicts
- `import` and modules/packages (what `__init__.py` does)
- `async`/`await` (FastAPI is async — you'll use it constantly)
- Virtual environments (`venv`) and `pip`
- Type hints (`def f(x: int) -> str:`) — used everywhere in this repo

### The libraries this project uses

- **FastAPI** — the web framework (routes, request/response).
- **Uvicorn** — the server that runs FastAPI.
- **httpx** — makes HTTP calls (to Ollama, later to APIs).
- **Pydantic** — validates data with types (the `ChatRequest` model, etc.).

> 💡 Don't binge-watch tutorials. Read enough to recognize the words below, then
> learn the rest *inside* each phase, with real code in front of you.

✅ **Done when:** you can open PowerShell, activate the venv, run `python run.py`,
see the app shell boot at `http://127.0.0.1:8000` (and the auto-generated API
docs at `/docs`), and explain in your own words what each top-level folder is
for. (Chatting with a model comes in Phase 1, once you build it.)

---

## Phase 1 — Build the chat skeleton

🎯 **Goal:** type a message in the browser and watch a local model stream its
reply back. This is the backbone everything else hangs off — build it yourself.

📚 **Learn:** installing Ollama; Ollama's `/api/chat` and `/api/tags` endpoints;
async generators in Python (`async def` + `yield`); FastAPI `StreamingResponse`
and Server-Sent Events; `fetch()` and reading a stream in JavaScript.

🔨 **Steps — implement the stubs in this order (each file's docstring tells you
what to build):**
1. Install **[Ollama](https://ollama.com/download)**; confirm `ollama --version`.
   Pull a small model: `ollama pull llama3.2` (or `llama3.2:1b` on a small PC).
2. **Request schema** — [backend/schemas/chat.py](backend/schemas/chat.py):
   a `Message` and a `ChatRequest`.
3. **Provider interface** — [backend/core/llm/base.py](backend/core/llm/base.py):
   decide what `stream_chat` takes and returns.
4. **Ollama provider** — [backend/core/llm/ollama_provider.py](backend/core/llm/ollama_provider.py):
   `list_models()` and a streaming `stream_chat()`.
5. **Endpoints** — [backend/api/routes/chat.py](backend/api/routes/chat.py)
   (`POST /api/chat`, streamed via SSE) and the `GET /api/models` half of
   [backend/api/routes/models.py](backend/api/routes/models.py).
6. **UI** — [frontend/index.html](frontend/index.html),
   [frontend/css/styles.css](frontend/css/styles.css),
   [frontend/js/app.js](frontend/js/app.js): a message area, an input, and a
   model picker; fetch the models, post a message, render the streamed reply.

💡 Test each layer before adding the next: try `/api/models` in `/docs`, then
`/api/chat`, *then* wire the UI. Small steps make bugs easy to find.

✅ **Done when:** you send a message in the browser and a local model streams its
answer back, token by token — and you can explain how each layer passed the data
to the next.

---

## Phase 2 — Make chat real

🎯 **Goal:** multiple saved conversations, model + system prompt per chat,
markdown rendering.

📚 **Learn:** reading/writing JSON files in Python; FastAPI path & query params;
a little DOM manipulation in JS; (optional) a markdown library like `marked.js`.

🔨 **Steps:**
1. Add a `Conversation` schema (id, title, model, system prompt, messages).
2. New router `api/routes/conversations.py`: create / list / get / delete,
   persisting JSON files under `data/conversations/`.
3. Frontend: a conversation list in the sidebar; click to load; "New chat" button.
4. Add a system-prompt field and prepend it as a `{"role": "system", ...}` message.
5. Render assistant markdown (code blocks, lists) instead of plain text.

✅ **Done when:** you can have two separate chats, reload the page, and they're
still there.

---

## Phase 3 — Hardware-aware model management

🎯 **Goal:** see recommended models and manage them from the UI.

📚 **Learn:** the Ollama REST API (`/api/tags`, `/api/pull`, `/api/delete`);
streaming progress responses.

🔨 **Steps:**
1. Implement the recommender in
   [backend/services/hardware/recommend.py](backend/services/hardware/recommend.py)
   and the `GET /api/models/recommend` route, then surface it in the UI. Show
   each model with a "comfortable / tight / too large" badge.
2. Add `POST /api/models/pull` that proxies Ollama's pull and streams progress.
3. Add delete. Show installed size + a one-click "use this model".
4. *(Stretch)* detect GPU VRAM and prefer it over system RAM in the recommender.

✅ **Done when:** you can pull and select a model without leaving the browser.

---

## Phase 4 — Built-in tools (this is where it gets fun)

🎯 **Goal:** the model can *do things* — read files, search the web, run commands.

📚 **Learn:** **tool/function calling** (how a model returns a structured request
to call a function); JSON Schema; Ollama's tool-calling support; why some models
support tools and others don't (use one that does, e.g. `llama3.1`/`qwen2.5`).

🔨 **Steps:**
1. Define a `Tool` (name, description, JSON-schema parameters, a Python function)
   in [backend/core/tools/](backend/core/tools/). Build a **registry**: name → tool.
2. Implement built-ins one at a time, easiest first:
   - `files` — read/write/list within a sandboxed workspace dir.
   - `web` — fetch a URL (httpx) and extract text (beautifulsoup4).
   - `memory` — store/recall (stub now; real in Phase 6).
   - `bash` — run a shell command. **Do this last and carefully:** allowlist
     commands, never run blindly, require confirmation for anything destructive.
3. Write the **tool loop**: send tools to the model → if it returns a tool call,
   run the function → feed the result back → repeat until it answers in words.
4. Frontend: show tool calls/results in the transcript so you can see its work.

✅ **Done when:** you ask "what files are in my workspace?" and the model uses the
`files` tool to answer correctly.

> ⚠️ **Safety:** `bash` and `files` perform real actions. Sandbox the working
> directory, validate paths, and confirm destructive operations. Treat anything
> the `web` tool returns as untrusted.

---

## Phase 5 — Create your own agents

🎯 **Goal:** define agents (model + persona + tools + memory) and chat with them.

📚 **Learn:** designing a small schema; system-prompt/persona design; composition
(an agent *uses* the tool registry and provider you already built).

🔨 **Steps:**
1. `Agent` schema in [backend/core/agents/](backend/core/agents/): name, model,
   system prompt, enabled tool names, memory on/off, sampling (temperature…).
2. Save/load agents as JSON in `data/agents/`. Add CRUD routes.
3. Agent **builder UI**: name, pick model, write the prompt, toggle tools on/off.
4. Route chat through the agent: it picks the model, injects the prompt, and only
   exposes that agent's enabled tools to the tool loop.

✅ **Done when:** you create a "Coding Helper" and a "Travel Planner" with
different tools, and each behaves differently.

---

## Phase 6 — Memory

🎯 **Goal:** agents remember facts across sessions.

📚 **Learn:** SQLite basics (and `sqlite3`/`sqlmodel` in Python); the difference
between short-term (the message list) and long-term (durable) memory; later,
embeddings & vector search for "recall by meaning".

🔨 **Steps:**
1. SQLite table: `(id, agent_id, key, value, source, created_at)`.
2. A `memory` tool the agent can call to **write** ("remember that…") and
   **recall** ("what do I know about…").
3. Inject a handful of relevant memories into the system prompt each turn.
4. *(Stretch)* add embeddings (e.g. `nomic-embed-text` via Ollama) + a vector
   index so recall is by meaning, not exact key.

✅ **Done when:** you tell an agent your name in one session and it remembers in
the next.

---

## Phase 7 — Tools & MCP

🎯 **Goal:** connect external **MCP** servers; their tools appear next to the
built-ins, toggleable per tool.

📚 **Learn:** what **Model Context Protocol** is (an open standard for AI ⇄ tools);
the Python MCP SDK (`pip install mcp`); stdio vs HTTP transports.

🔨 **Steps:**
1. In [backend/core/mcp/](backend/core/mcp/), write a client that connects to an
   MCP server and lists its tools.
2. **Adapter:** wrap each MCP tool so it looks exactly like a built-in `Tool`
   (same registry, same loop). The agent shouldn't know the difference.
3. UI: add/remove MCP servers; per-tool enable/disable toggles.
4. Try a real server (filesystem, web search, etc.) from the MCP ecosystem.

✅ **Done when:** you connect one MCP server and an agent uses one of its tools.

---

## Phase 8 — Email assistant

🎯 **Goal:** summaries, style-matched drafts, auto-tagging & spam triage over email.

📚 **Learn:** IMAP (reading mail) & SMTP (sending) — Python's `imaplib`/`smtplib`
or `aioimaplib`; **app-specific passwords** (never your real password); parsing
MIME emails; classification prompting.

🔨 **Steps:**
1. In [backend/services/email/](backend/services/email/): `client.py` to fetch
   recent mail (IMAP) and send (SMTP). Credentials from `.env` only.
2. `summarize.py` — LLM summary of a thread.
3. `draft.py` — generate a reply that matches *your* writing style (feed it a few
   of your past sent emails as examples).
4. `triage.py` — classify into tags (work, personal, …) + spam/priority.
5. UI: inbox list → summary → suggested tags → "draft reply" you can edit & send.

✅ **Done when:** Atlas summarizes a real thread and drafts a reply that sounds
like you.

> ⚠️ **Safety:** start **read-only**. Only enable sending after you trust it, and
> always require a human click before an email actually goes out.

---

## Phase 9 — Deep Research

🎯 **Goal:** multi-step runs that gather, read, and synthesize sources into a
written, cited report.

📚 **Learn:** agentic loops (plan → act → observe → repeat); web search APIs
(`duckduckgo-search` is a simple start); extracting readable text; prompting for
synthesis with citations.

🔨 **Steps:**
1. `planner.py` — break the question into sub-questions/search queries.
2. `search.py` + `read.py` — search, fetch top results, extract clean text.
3. A loop that keeps researching until it has enough, tracking sources.
4. `synthesize.py` — write a structured report with inline citations to `data/`.
5. UI: a research input, a live activity log, and the final rendered report.

✅ **Done when:** you ask a real question and get back a multi-paragraph report
with links to its sources.

---

## Phase 10 — Self-evolving Skills

🎯 **Goal:** the assistant writes, refines, and reuses its own skills.

📚 **Learn:** the "skill" pattern (a named, described, reusable procedure —
exactly like Claude Code's own Skills); self-critique/reflection prompting;
matching a skill to a task by its description.

🔨 **Steps:**
1. `Skill` schema: name, description, trigger, step-by-step instructions
   (markdown), optional code. Store in `data/skills/`.
2. `author.py` — after a task succeeds, have the model write it up as a skill.
3. `registry.py` — given a new task, surface skills whose description matches.
4. `refine.py` — after using a skill, the model critiques and improves it.
5. UI: browse, edit, enable/disable skills; see which one was used.

✅ **Done when:** the assistant solves a task, saves a skill, and reuses it next
time without you re-explaining.

---

## Phase 11 — Characters

🎯 **Goal:** design personas with voice & backstory you can chat with.

📚 **Learn:** persona/system-prompt design; how sampling settings (temperature,
top-p) change "personality"; a bit of UI/UX for the character builder.

🔨 **Steps:**
1. `Character` schema: name, personality, voice, backstory, avatar, sampling.
2. A character = a persona layer over an agent. Reuse the agent runner.
3. Character builder UI (avatar, traits, example dialogue).
4. *(Stretch toward "talk with your agents")* add text-to-speech for replies and
   speech-to-text for input.

✅ **Done when:** you create a character with a distinct voice and it stays in
character across a conversation.

---

## Phase 12 — API models + polish

🎯 **Goal:** use Claude/OpenAI alongside local models, behind the same interface.

📚 **Learn:** the Anthropic & OpenAI SDKs; keeping keys in `.env`; token/cost
basics; (optional) prompt caching.

🔨 **Steps:**
1. `core/llm/anthropic_provider.py` and `openai_provider.py` implementing the
   same `ChatProvider.stream_chat` interface — **nothing else changes.**
2. A provider/model switcher in the UI (local vs API).
3. Show token usage / estimated cost for API calls.
4. Polish pass: error states, loading spinners, keyboard shortcuts, your own
   visual design in `frontend/css/styles.css`.

✅ **Done when:** you flip a dropdown from `llama3.2` to `claude` and the same
chat keeps working.

---

## Working rhythm (do this every phase)

1. Re-read the relevant `core/` `__init__.py` — it lists the planned modules.
2. Build the smallest version that works. Test it by hand in the browser.
3. Add a quick `pytest` for the core logic where it's easy.
4. Update [docs/ROADMAP.md](docs/ROADMAP.md). Commit with a clear message.
5. Refactor only once it works and you understand it.

## When you get stuck

- Read the error message slowly — it usually says what and where.
- Check the server logs in the terminal running `python run.py`.
- Use the interactive API docs FastAPI gives you free at `/docs`.
- Shrink the problem: test the one function in isolation before the whole flow.
- Ask an AI assistant — and make it *explain*, so you actually learn.

You're not just assembling features; you're building something you understand top
to bottom. That's the whole point. Have fun. 🧭
