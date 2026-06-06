# 🧭 Atlas

> A Swiss-army knife of local AI — chat with your own agents, build them from tools, and run it all on your own machine with [Ollama](https://ollama.com).

Atlas is a self-hosted AI workspace. Create custom agents and characters, give
them tools (built-in + any MCP server), and use them for real work: an email
assistant, deep research, persistent memory, and skills the assistant refines
on its own. Everything runs locally by default; API models (Claude, OpenAI)
plug in optionally.

Inspired by PewDiePie's **Odysseus** project — a personal, local AI you fully
own and shape yourself.

> **Status: 🚧 learning scaffold.** This repo gives you the structure, the docs,
> and a runnable app shell — but the feature code is intentionally left as
> **guided stubs** for *you* to implement. Each stub explains what to build and
> why. Follow **[GUIDE.md](GUIDE.md)** phase by phase; track progress in
> **[docs/ROADMAP.md](docs/ROADMAP.md)**.

---

## ✨ Features (the vision)

| Feature | What it does | Phase |
| --- | --- | --- |
| 💬 **Chat with your agents** | Talk (and eventually speak) with any agent you create | 1 |
| 🤖 **Custom agents** | Model + persona + tools + memory, defined as data | 5 |
| 🧰 **Tools & MCP** | Built-in bash/files/web/memory + any MCP server, toggleable per tool | 4, 7 |
| 🖥️ **Hardware-aware models** | Recommends models that fit your RAM/VRAM | 3 |
| 📧 **Email assistant** | Summaries, style-matched drafts, auto-tagging & spam triage over IMAP/SMTP | 8 |
| 🔎 **Deep Research** | Multi-step runs that gather, read & synthesize sources into a report | 9 |
| 🧠 **Memory** | Durable facts recalled across sessions | 6 |
| 📚 **RAG over your docs** | Ground answers in your own notes & files (retrieval) | 6, 13 |
| ⚙️ **Frameworks (optional)** | Vector DB + LangChain/LlamaIndex/LangGraph, *after* you've built the basics by hand | 13, 14 |
| 🌱 **Self-evolving Skills** | The assistant writes, refines & reuses its own skills | 10 |
| 🎭 **Characters** | Personas with voice & backstory you can design | 11 |
| 🔌 **API models too** | Use Claude/OpenAI alongside local models | 12 |
| 🎨 **Local web UI** | Plain HTML/CSS/JS you fully control | 1 |

---

## 🚀 Get started

**Prerequisites:** Python 3.11+, and [Ollama](https://ollama.com/download).

```powershell
# 1. One-time setup (creates venv, installs deps, makes .env)
./scripts/setup.ps1

# 2. Boot the app shell — a health check + an empty UI you'll build out
python run.py
#    -> http://127.0.0.1:8000   (interactive API docs at /docs)
```

That boots today, but the features aren't built yet — **that's the point.** Open
**[GUIDE.md](GUIDE.md)**, start at **Phase 0**, then implement **Phase 1** (your
first real chat) into the guided stubs. You'll `ollama pull llama3.2` when Phase 1
tells you to.

Prefer manual setup over the script?

```powershell
python -m venv .venv
. .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python run.py
```

---

## 🗂️ Project structure

```
Atlas/
├── backend/              # FastAPI app (Python)
│   ├── main.py           # app entry point — wires routers + serves frontend
│   ├── config.py         # settings from .env
│   ├── api/routes/       # one router per feature (chat, models, …)
│   ├── core/             # domain logic (no web imports)
│   │   ├── llm/          # model providers (Ollama now; Claude/OpenAI later)
│   │   ├── agents/       # agent definitions + run loop
│   │   ├── tools/        # built-in tools (bash, files, web, memory)
│   │   ├── mcp/          # MCP client
│   │   ├── memory/       # long-term memory
│   │   ├── rag/          # retrieval: embeddings → search → augment (RAG)
│   │   ├── skills/       # self-evolving skills
│   │   └── characters/   # personas
│   ├── services/         # email, research, hardware
│   └── schemas/          # pydantic request/response models
├── frontend/             # plain HTML/CSS/JS UI (your canvas)
├── data/                 # local agents/characters/memory/skills/db (gitignored)
├── docs/                 # architecture + roadmap
├── tests/                # pytest
├── scripts/              # setup helpers
├── GUIDE.md              # 👈 the step-by-step build guide
└── CLAUDE.md             # guidance for AI coding assistants
```

---

## 📚 Documentation

- **[GUIDE.md](GUIDE.md)** — the full learning + build path, phase by phase.
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — how the pieces fit together.
- **[docs/ROADMAP.md](docs/ROADMAP.md)** — checklist of what's done / next.
- **[CLAUDE.md](CLAUDE.md)** — conventions for working in this repo.

## 📝 License

[MIT](LICENSE) © 2026 jcns1107
