# 🧭 The Atlas Build Guide

A step-by-step path to build Atlas — your local AI Swiss-army knife — from the
scaffold that's already here to the full vision. The repo ships the structure
and a *guided stub* for each piece — a short note on what to build and why — but
no feature code: **you write that.** It's written for someone **learning as they
build**, in the spirit of PewDiePie's Odysseus: own it, shape it, understand
every piece.

> 🔄 **Refreshed October 2026.** The plan was first written in March 2026. It now
> treats context (not RAG) as the core problem, teaches the agent *harness*
> explicitly, and uses current models, packages, and specs. See
> [docs/ROADMAP.md](docs/ROADMAP.md#-oct-2026-refresh--what-changed) for the list.

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

## Two ideas that run through the whole guide

**1. The harness.** A model on its own only turns text into more text. What makes
an *agent* is the code around it: the loop that runs tools, the permissions that
keep it safe, the logic that decides what goes into its context window, the
summaries that keep long sessions from overflowing. That surrounding code is
called the **harness** — it's what Claude Code, Codex & co. really are. You'll
build one piece at a time (Phases 4, 5, 6, 9, 10) and by the end you'll
understand how the agents you use every day actually work.

**2. Context is the budget.** Every call, the model sees only what fits in its
context window — and on a local model that window is small and slow to fill.
So for any information you want the model to use, pick the **cheapest strategy
that fits**: *stuff it* into the prompt if it's small, let the agent *search it*
with tools if it's medium, and *retrieve it* with RAG only when it's big. RAG is
a tool, not a default. (Phase 6 makes you measure this yourself.)

---

## Phase 0 — The toolbox (learn these first)

Before writing features, get comfortable with the core tools. You don't need
mastery — just enough to be dangerous. Spend a few days here.

### The non-negotiables

| Tool | Why you need it | Where to start |
| --- | --- | --- |
| **Command line** (PowerShell) | Run everything: Python, git, Ollama | Microsoft "PowerShell 101" |
| **Python 3.11+** | The whole backend | [Python official tutorial](https://docs.python.org/3/tutorial/) |
| **uv** | Installs Python + packages, runs the app | [docs.astral.sh/uv](https://docs.astral.sh/uv/) |
| **Git & GitHub** | Save work, track history, undo mistakes | [GitHub "Hello World"](https://docs.github.com/en/get-started) |
| **Ollama** | Runs the AI models locally | [ollama.com](https://ollama.com) |
| **HTML / CSS / JS** | The UI you design | [MDN](https://developer.mozilla.org/) "Getting started" |
| **HTTP & JSON** | How frontend ⇄ backend talk | MDN "An overview of HTTP" |

### Python concepts to be comfortable with

- Variables, functions, `if`/`for`, lists & dicts
- `import` and modules/packages (what `__init__.py` does)
- `async`/`await` (FastAPI is async — you'll use it constantly)
- Virtual environments — a private folder (`.venv`) of packages for one project.
  `uv sync` creates it from `pyproject.toml`; `uv run <cmd>` runs inside it.
- Type hints (`def f(x: int) -> str:`) — used everywhere in this repo

### The libraries this project uses

- **FastAPI** — the web framework (routes, request/response).
- **Uvicorn** — the server that runs FastAPI.
- **httpx2** — makes HTTP calls (to Ollama, later to APIs). It's the maintained
  fork of the popular `httpx` — same API, so `httpx` tutorials still apply.
- **Pydantic** — validates data with types (the `ChatRequest` model, etc.).

Later phases add optional bundles ("extras") — e.g. `uv sync --extra rag`. Each
phase tells you which one; they're all listed in [pyproject.toml](pyproject.toml).

> 💡 Don't binge-watch tutorials. Read enough to recognize the words below, then
> learn the rest *inside* each phase, with real code in front of you.

✅ **Done when:** you can run `./scripts/setup.ps1`, start `uv run python run.py`,
see the app shell boot at `http://127.0.0.1:8000` (and the auto-generated API
docs at `/docs`), and explain in your own words what each top-level folder is
for. (Chatting with a model comes in Phase 1, once you build it.)

---

## Phase 1 — Build the chat skeleton

🎯 **Goal:** type a message in the browser and watch a local model stream its
reply back. This is the backbone everything else hangs off — build it yourself.

📚 **Learn:** installing Ollama; Ollama's `/api/chat` and `/api/tags` endpoints;
what a **context window** is and why you set `num_ctx`; async generators in
Python (`async def` + `yield`); FastAPI `StreamingResponse` and Server-Sent
Events; `fetch()` and reading a stream in JavaScript.

🔨 **Steps — implement the stubs in this order (each file's docstring tells you
what to build):**
1. Install **[Ollama](https://ollama.com/download)**; confirm `ollama --version`.
   Pull a small model that can call tools and "think": `ollama pull qwen3:4b`
   (or `qwen3:1.7b` on a small PC). Bigger machines can try `gemma4` (also sees
   images) or `gpt-oss:20b` — check current tags on
   [ollama.com/library](https://ollama.com/library).
2. **Request schema** — [backend/schemas/chat.py](backend/schemas/chat.py):
   a `Message` and a `ChatRequest`.
3. **Provider interface** — [backend/core/llm/base.py](backend/core/llm/base.py):
   decide what `stream_chat` takes and returns.
4. **Ollama provider** — [backend/core/llm/ollama_provider.py](backend/core/llm/ollama_provider.py):
   `list_models()` and a streaming `stream_chat()`. Send `num_ctx` from settings
   on every call — Ollama's default window is small and it silently drops
   whatever doesn't fit.
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
markdown rendering, and visible "thinking".

📚 **Learn:** reading/writing JSON files in Python; FastAPI path & query params;
a little DOM manipulation in JS; (optional) a markdown library like `marked.js`;
how thinking models separate reasoning (`message.thinking`) from the answer.

🔨 **Steps:**
1. Add a `Conversation` schema (id, title, model, system prompt, messages).
2. New router `api/routes/conversations.py`: create / list / get / delete,
   persisting JSON files under `data/conversations/`.
3. Frontend: a conversation list in the sidebar; click to load; "New chat" button.
4. Add a system-prompt field and prepend it as a `{"role": "system", ...}` message.
5. Render assistant markdown (code blocks, lists) instead of plain text.
6. Show the model's thinking in a collapsible "Thinking…" block, and add a
   per-chat toggle that sends `"think": false` when you want fast answers.
7. Show token usage after each reply (`prompt_eval_count` / `eval_count` on
   Ollama's final chunk) as "context used: N / num_ctx". You'll need this number
   a lot from Phase 5 on.

✅ **Done when:** you can have two separate chats, reload the page, and they're
still there — and you can see how full the context window is.

---

## Phase 3 — Hardware-aware model management

🎯 **Goal:** see recommended models, what each one can do, and manage them from
the UI.

📚 **Learn:** the Ollama REST API (`/api/tags`, `/api/show`, `/api/ps`,
`/api/pull`, `/api/delete`); model **capabilities** (tools, thinking, vision,
embedding); quantization and why a bigger context costs memory; streaming
progress responses.

🔨 **Steps:**
1. Implement the recommender in
   [backend/services/hardware/recommend.py](backend/services/hardware/recommend.py)
   and the `GET /api/models/recommend` route, then surface it in the UI. Show
   each model with a "comfortable / tight / too large" badge.
2. Call `/api/show` for each installed model and badge its capabilities — you'll
   use this in Phase 5 to stop an agent from picking a model that can't call tools.
3. Add `POST /api/models/pull` that proxies Ollama's pull and streams progress.
4. Add delete. Show installed size + a one-click "use this model".
5. *(Stretch)* detect GPU VRAM and prefer it over system RAM in the recommender;
   show what's loaded right now with `/api/ps`.

✅ **Done when:** you can pull and select a model without leaving the browser, and
you can see at a glance which models support tools.

---

## Phase 4 — Built-in tools & the harness loop (this is where it gets fun)

🎯 **Goal:** the model can *do things* — read files, search docs, fetch the web,
run commands — inside a loop that's safe and that you can watch.

📚 **Learn:** **tool/function calling** (how a model returns a structured request
to call a function); JSON Schema; Ollama's tool-calling (`tools` in the request,
`tool_calls` in the reply, `{"role": "tool"}` messages back); parallel tool calls;
why a harness needs **permissions** and **limits**.

🔨 **Steps:**
1. Define a `Tool` (name, description, JSON-schema parameters, a Python function,
   a permission) in [backend/core/tools/](backend/core/tools/). Build a
   **registry**: name → tool. *(Nice trick: generate the schema from the
   function's type hints with pydantic.)*
2. Upgrade your provider interface: the stream now yields **typed events** —
   text, thinking, tool_call, done (+ token counts) — instead of plain strings.
   Update the SSE frames and `app.js` to match.
3. Implement built-ins one at a time, easiest first
   (`uv sync --extra tools` for the web tool):
   - `files` — read/write/list within a sandboxed workspace dir.
   - `docs` — `list_docs` / `grep_docs` / `read_doc` over a folder of your notes.
     (You'll lean on these in Phase 6.)
   - `web` — fetch a URL (httpx2) and extract the readable text (trafilatura).
   - `memory` — store/recall (stub now; real in Phase 6).
   - `bash` — run a shell command. **Do this last and carefully:** allowlist
     commands, never run blindly.
4. Write the **harness loop**: send tools to the model → run every tool call it
   returns → append one tool result per call → repeat until it answers in words.
   Then add the guardrails:
   - **max iterations** so a confused model can't loop forever;
   - **errors as results** — return `"error: …"` to the model instead of crashing;
   - **result size caps** — truncate big outputs, keep the full text on disk;
   - **permissions** — each tool is *allow*, *ask*, or *deny*. "Ask" pauses the
     loop until you click **Approve** in the UI (bash, file writes).
5. Frontend: show thinking, tool calls, and results in the transcript so you can
   see its work — plus the approve/deny buttons.
6. *(Stretch — come back after Phase 8)* add a **guard**: before a tool runs, ask
   a decision model "is this destructive?". It may only bump a call from *allow*
   to *ask*, never the other way round — your allowlist and approval click stay
   in charge.

✅ **Done when:** you ask "what files are in my workspace?" and the model uses the
`files` tool to answer correctly — and asking it to delete something pops up an
approval instead of just doing it.

> ⚠️ **Safety:** `bash` and `files` perform real actions. Sandbox the working
> directory, validate paths, and confirm destructive operations. Treat anything
> the `web` tool returns as untrusted — a page can contain instructions aimed at
> your model ("prompt injection").

---

## Phase 5 — Create your own agents

🎯 **Goal:** define agents (model + instructions + tools + memory) and chat with
them — with a harness that keeps long sessions inside the context window.

📚 **Learn:** designing a small schema; writing instructions (system prompts) as
markdown, like an `AGENTS.md`; **context assembly** (what goes in the prompt, in
what order); **compaction** (summarizing old turns so the chat can go on);
composition (an agent *uses* the tool registry and provider you already built).

🔨 **Steps:**
1. `Agent` schema in [backend/core/agents/](backend/core/agents/): name, model,
   enabled tools + their permissions, memory on/off, sampling (temperature…).
   Store config in `data/agents/<name>/agent.json` and the instructions in
   `data/agents/<name>/AGENTS.md`. Add CRUD routes.
2. Agent **builder UI**: name, pick model (only ones with the *tools* capability),
   write the instructions, toggle tools on/off.
3. Route chat through the agent: it picks the model, injects the instructions,
   and only exposes that agent's enabled tools to the harness loop.
4. **Context assembly** in [backend/core/context/](backend/core/context/): build
   every prompt in a fixed order — instructions → core memories → (later) skills
   index → summary → recent turns. Keep the start identical between turns:
   Ollama reuses its cache for an unchanged prefix, so replies start faster.
5. **Compaction:** when the context passes ~75% of `num_ctx`, first shrink old
   tool results, then ask the model to summarize older turns (goal, decisions,
   open tasks) and replace them with that summary.
6. *(Stretch)* a `todo` tool the agent uses to write and tick off its own plan —
   a cheap trick that keeps small models on track in long tasks.

✅ **Done when:** you create a "Coding Helper" and a "Travel Planner" with
different tools, each behaves differently, and a very long chat keeps working
(and still knows its goal) after a compaction.

---

## Phase 6 — Memory & context: pick the cheapest strategy

🎯 **Goal:** agents remember facts across sessions *and* can answer over your own
notes/documents — using the cheapest method that works. You'll build all three
context strategies and **measure** when each one wins, including a minimal
**RAG (Retrieval-Augmented Generation)** pipeline by hand.

📚 **Learn:** short-term (the message list) vs long-term (durable) memory; *core*
memories (always in the prompt) vs *recall* (fetched when relevant); the three
strategies — **stuff**, **search**, **retrieve**; what an **embedding** is (text →
a vector of numbers capturing meaning); **cosine similarity**; the RAG pipeline —
*chunk → embed → store → retrieve top-k → augment the prompt*; SQLite.

🔨 **Steps:**
1. **Plain memory first.** SQLite table `(id, agent_id, key, value, source,
   created_at)` with Python's built-in `sqlite3`; a `memory` tool to **write**
   ("remember that…") and **recall**. See [backend/core/memory/](backend/core/memory/).
2. **Core memories.** Mark a few facts as "core" and always put them in the
   prompt (via your context assembly). Everything else is recalled on demand.
3. **Strategy 1 — stuff it.** Let the user attach `.txt`/`.md` files to a chat.
   If they fit in about half the context budget, put them straight into the
   prompt. No embeddings. Try it — for a few files this often beats everything.
4. **Strategy 2 — search it.** Point an agent at a folder of notes and let it use
   the `docs` tools from Phase 4 (list, grep, read). It searches like you would.
5. **Strategy 3 — retrieve it (RAG, by hand).** `uv sync --extra rag`, then
   `ollama pull embeddinggemma`. In [backend/core/rag/](backend/core/rag/):
   split docs into overlapping chunks, embed them with `POST /api/embed` (pass a
   *list* of chunks in one call), store each vector next to its text, and for
   each question embed it and take the top-k by cosine similarity. Ollama's
   vectors are unit-length, so that's just a `numpy.dot` — work out why. Inject
   the top chunks into the prompt. Congratulations — that's RAG.
6. **The router.** In [backend/core/context/](backend/core/context/), choose the
   strategy automatically from the size of the documents vs the budget.
7. **Measure it.** Write ~10 questions about your own docs with the answers you
   expect. Run them through all three strategies and record: correct? how slow?
   how many tokens? Save the script — it's your first *eval*.

✅ **Done when:** you tell an agent your name in one session and it remembers next
session; it answers a question about a document you fed it, pointing at the part
it used; and you can say — **from your own numbers** — where RAG beat stuffing,
and where it didn't.

> 📌 You built RAG from scratch on purpose. In **Phase 13** you'll scale it up
> (hybrid search, a real index) behind the same interface, now that you know
> exactly what it does — and when you don't need it at all.

---

## Phase 7 — Tools & MCP

🎯 **Goal:** connect external **MCP** servers; their tools appear next to the
built-ins, toggleable per tool.

📚 **Learn:** what **Model Context Protocol** is (an open standard for AI ⇄ tools);
the Python MCP SDK v2 (`uv sync --extra mcp`, which follows the 2026-07-28 spec);
the two transports — **stdio** (a local subprocess) and **Streamable HTTP** (a
server at a URL).

🔨 **Steps:**
1. In [backend/core/mcp/](backend/core/mcp/), write a client that connects to an
   MCP server and lists its tools (`from mcp import Client`).
2. **Adapter:** wrap each MCP tool so it looks exactly like a built-in `Tool`
   (same registry, same loop, same permissions). The agent shouldn't know the
   difference. MCP tools default to *ask* until you trust them.
3. UI: add/remove MCP servers; per-tool enable/disable toggles. Keep the enabled
   list short — every tool schema costs context, and small models choose badly
   among dozens of tools.
4. Try a real server (filesystem, web search, etc.) from the MCP ecosystem.
5. *(Stretch)* turn it around: expose Atlas **as** an MCP server
   (`mcp.server.MCPServer`) so Claude Code or Claude Desktop can use your agents
   and memory.

✅ **Done when:** you connect one MCP server and an agent uses one of its tools.

---

## Phase 8 — Email assistant

🎯 **Goal:** summaries, style-matched drafts, auto-tagging & spam triage over email.

📚 **Learn:** IMAP (reading mail) & SMTP (sending) — Python's `imaplib`/`smtplib`
or `aioimaplib`; **app-specific passwords** (never your real password); parsing
MIME emails; classification prompting; **structured outputs** (Ollama's `format`
+ a JSON schema); **decision models** — TypeSafe's **Jev** format, where you send
a `state` plus typed questions (*noul* = yes/no, *choice* = pick one, *score* = a
rubric level) and get each answer back with a probability; recent Ollama
versions serve Jev-style models such as `nimble` locally at `/v1/systemone`;
**prompt injection**.

🔨 **Steps:**
1. In [backend/services/email/](backend/services/email/): `client.py` to fetch
   recent mail (IMAP) and send (SMTP). Credentials from `.env` only.
2. `summarize.py` — LLM summary of a thread.
3. `draft.py` — generate a reply that matches *your* writing style (feed it a few
   of your past sent emails as examples — stuffed into the prompt, no RAG needed).
4. `triage.py` — classify into tags (work, personal, …) + spam/priority. Ask for
   the answer as structured output and validate it with a pydantic model.
5. **Decision models.** Add a small `DecisionProvider` seam in
   [backend/core/llm/](backend/core/llm/) (local Ollama now; hosted Jev with
   `JEV_API_KEY` if you want to compare). `ollama pull nimble` — check the tag
   and the request fields in Ollama's release notes, then poke the endpoint by
   hand. Re-do triage as decisions: spam? → *noul*, tag → *choice*, priority →
   *score*. Use the probabilities: auto-apply above a threshold, ask you below it.
6. **Compare.** Label ~20 of your own emails and run both versions. Which is more
   accurate? Faster? Is a 0.9-confidence answer really right 90% of the time?
   (Confidence measures how *sure* the model is, not whether it's *correct*.)
7. UI: inbox list → summary → suggested tags → "draft reply" you can edit & send.

✅ **Done when:** Atlas summarizes a real thread and drafts a reply that sounds
like you — and you can say, from your labelled emails, whether the decision model
or structured outputs triages better.

> ⚠️ **Safety:** start **read-only**. Only enable sending after you trust it, and
> always require a human click before an email actually goes out. Remember that
> every email is untrusted input written by a stranger: an agent that can read
> your inbox **and** reach the web or send mail could be tricked into leaking it.
> Give the email agent no web tool, and keep "send" on *ask*.

---

## Phase 9 — Deep Research

🎯 **Goal:** multi-step runs that gather, read, and synthesize sources into a
written, cited report.

📚 **Learn:** this is **retrieval applied to the live web** — find sources, then
write a grounded, cited answer. Plus the harness patterns that make long runs
work: an **orchestrator** with **sub-agents** that each get their own fresh
context; structured-output plans; web search (`ddgs`, via
`uv sync --extra research`); extracting readable text; prompting for synthesis
with citations.

🔨 **Steps:**
1. `planner.py` — break the question into sub-questions (as structured output).
2. `search.py` + `read.py` — search with `ddgs`, fetch top results, extract
   clean text. *(Optional: Ollama's hosted `web_search` / `web_fetch` API gives
   good results but needs a free ollama.com key — it's not fully local.)*
3. **Sub-agents:** run each sub-question in a fresh agent with its own empty
   context. It searches and reads (thousands of tokens), then returns only a
   short summary + sources. The orchestrator never sees the raw pages, so its
   context stays small no matter how many sources you read.
4. A loop: plan → research → "do we have enough?" → maybe more sub-questions.
   ("Enough?" is a yes/no decision — reuse your Phase 8 decision model.)
5. `synthesize.py` — write a structured report with inline citations to `data/`.
6. UI: a research input, a live activity log, and the final rendered report.
7. Eval: keep 3–5 research questions you know the answer to and rerun them when
   you change the model or prompts.

✅ **Done when:** you ask a real question and get back a multi-paragraph report
with links to its sources.

---

## Phase 10 — Self-evolving Skills

🎯 **Goal:** the assistant writes, refines, and reuses its own skills.

📚 **Learn:** the open **Agent Skills** format ([agentskills.io](https://agentskills.io))
— a folder with a `SKILL.md` (YAML frontmatter with `name` + `description`, then
markdown instructions), the same format Claude Code and many other agents read;
**progressive disclosure** (show only the descriptions, load the full skill on
demand); self-critique/reflection prompting.

🔨 **Steps:**
1. Store skills as `data/skills/<name>/SKILL.md` (+ optional `scripts/`,
   `references/`). See [backend/core/skills/](backend/core/skills/).
2. `registry.py` — scan the folder, parse each frontmatter, and put a short
   **skills index** (name + description per skill) into the prompt.
3. A `load_skill(name)` tool that returns the full `SKILL.md` when the model
   decides a skill fits. (Notice: no embeddings needed — the model reads the
   index itself. Context strategy #1 again.)
4. `author.py` — after a task succeeds, have the model write it up as a new skill.
5. `refine.py` — after using a skill, the model critiques and improves it. New
   and changed skills wait for your approval before they're used.
6. UI: browse, edit, enable/disable skills; see which one was used.

✅ **Done when:** the assistant solves a task, saves a skill, and reuses it next
time without you re-explaining — and you can copy that skill folder into Claude
Code and it works there too.

---

## Phase 11 — Characters

🎯 **Goal:** design personas with voice & backstory you can chat with.

📚 **Learn:** persona/system-prompt design; how sampling settings (temperature,
top-p) change "personality"; a bit of UI/UX for the character builder.

🔨 **Steps:**
1. `Character` schema: name, personality, voice, backstory, avatar, sampling.
2. A character = a persona layer over an agent. Reuse the agent runner.
3. Character builder UI (avatar, traits, example dialogue).
4. *(Stretch toward "talk with your agents")* add speech-to-text for input (a
   local Whisper-family model) and text-to-speech for replies (a local engine
   such as Piper or Kokoro).

✅ **Done when:** you create a character with a distinct voice and it stays in
character across a conversation.

---

## Phase 12 — API models + polish

🎯 **Goal:** use Claude/OpenAI alongside local models, behind the same interface.

📚 **Learn:** the Anthropic & OpenAI SDKs (`uv sync --extra api`); keeping keys
and model ids in `.env`; token/cost basics; **prompt caching** (why your stable
prompt prefix from Phase 5 now saves money); the OpenAI-compatible API that many
servers speak — including Ollama itself, at `http://localhost:11434/v1`.

🔨 **Steps:**
1. `core/llm/anthropic_provider.py` and `openai_provider.py` implementing the
   same `ChatProvider.stream_chat` interface (typed events and all) — **nothing
   else changes.** Point the OpenAI-compatible one at Ollama's `/v1` too, and
   compare it with your native Ollama provider.
2. A provider/model switcher in the UI (local vs API). Read model ids from
   settings — they change every few months, so never hardcode them.
3. Show token usage / estimated cost for API calls.
4. Turn on prompt caching for the Anthropic provider and watch the cached-token
   counts. *(Stretch: the Claude API can also compact long conversations on the
   server — compare it with your own compaction from Phase 5.)*
5. Polish pass: error states, loading spinners, keyboard shortcuts, your own
   visual design in `frontend/css/styles.css`.

✅ **Done when:** you flip a dropdown from `qwen3` to `claude` and the same
chat — tools included — keeps working.

---

## Phase 13 — Retrieval at scale (hybrid search, then maybe a framework)

🎯 **Goal:** make your Phase 6 retrieval hold up on a big pile of documents —
without leaving SQLite at first — then decide, with evidence, whether a vector
database or framework is worth it.

📚 **Learn:** **sqlite-vec** (vector search inside SQLite); SQLite **FTS5** and
**BM25** (classic keyword search); **hybrid search** + **Reciprocal Rank Fusion**
(merge the two ranked lists); chunking strategies (size, overlap, adding the
document title/section to each chunk); *(stretch)* re-ranking. Then, optionally:
vector databases (**Chroma**, Qdrant) and **LlamaIndex** / **LangChain** loaders
+ retrievers.

🔨 **Steps:**
1. Move your vectors into **sqlite-vec** — same database file as your memories,
   same retrieve interface in [backend/core/rag/](backend/core/rag/), so nothing
   upstream changes. (This is exactly why you built the seam.)
2. Add an **FTS5** keyword index over the same chunks. Keyword search finds exact
   names, codes, and error messages that embeddings blur.
3. **Hybrid:** run both searches, merge with Reciprocal Rank Fusion, take top-k.
4. Prepend each chunk's document title + section heading before embedding it.
   Re-run your Phase 6 eval — did it help?
5. *(Optional)* `uv sync --extra frameworks`: try Chroma + a LlamaIndex or
   LangChain retriever behind the same interface, with their loaders for PDFs
   and web pages.
6. Compare honestly, with your eval: what did each step buy you? What did the
   framework hide?

✅ **Done when:** Atlas answers questions over a large folder of your own
documents with hybrid search, and you can show with numbers which retrieval
setup works best for *your* data.

---

## Phase 14 — Orchestrate with a framework (LangGraph)

🎯 **Goal:** rebuild your agent loop and deep-research run as an explicit **graph**
of steps, so complex multi-step flows are easier to reason about, resume, and add
a human-in-the-loop to.

📚 **Learn:** **LangGraph** (1.x) core ideas — nodes (steps), edges (transitions),
shared state, conditional routing, checkpoints/persistence, and human-in-the-loop
interrupts. How it compares to the harness you wrote by hand in Phases 4–5 & 9.
*(Alternative to look at: **Pydantic AI** — lighter, strongly typed, works with
Ollama.)*

🔨 **Steps:**
1. Re-express the agent tool loop as a graph: a "call model" node, a "run tool"
   node, and a conditional edge that loops until the model answers in words.
2. Re-express Deep Research as a graph: plan → research (sub-agents) →
   synthesize, with state tracking the sources gathered so far.
3. Add a checkpoint so a long run can pause and resume, and an interrupt for
   approvals (compare it with your Phase 4 *ask* permission).
4. Keep both implementations side by side behind your existing interfaces; choose
   whichever you prefer per feature.

✅ **Done when:** an agent or a research run executes as a LangGraph graph, and you
can explain when a framework like this earns its complexity — and when plain
scratch code is simpler.

> 💡 The lesson of Phases 13–14 isn't "frameworks win." It's that you can now make
> that call *yourself*, because you built the thing they abstract away.

---

## Working rhythm (do this every phase)

1. Re-read the relevant `core/` `__init__.py` — it lists the planned modules.
2. Build the smallest version that works. Test it by hand in the browser.
3. Add a quick `pytest` for the core logic where it's easy (`uv run pytest`).
4. For anything the model does, keep a few **eval prompts** (input + what a good
   answer looks like) and rerun them whenever you change the model or a prompt.
   Models are not deterministic — evals are how you know a change helped.
5. Update [docs/ROADMAP.md](docs/ROADMAP.md). Commit with a clear message.
6. Refactor only once it works and you understand it.

## When you get stuck

- Read the error message slowly — it usually says what and where.
- Check the server logs in the terminal running `uv run python run.py`.
- Use the interactive API docs FastAPI gives you free at `/docs`.
- Shrink the problem: test the one function in isolation before the whole flow.
- Model acting weird? Check the context first: is the prompt bigger than
  `num_ctx`? Did a giant tool result push the instructions out?
- Ask an AI assistant — and make it *explain*, so you actually learn.

You're not just assembling features; you're building something you understand top
to bottom. That's the whole point. Have fun. 🧭
