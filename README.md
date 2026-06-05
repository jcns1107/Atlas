# 🧭 Atlas

> A Swiss-army knife of local AI — chat with your own agents, build them from tools, and run it all on your own machine with [Ollama](https://ollama.com).

Atlas is a self-hosted AI workspace. Create custom agents and characters, give
them tools (built-in + any MCP server), and use them for real work: an email
assistant, deep research, persistent memory, and skills the assistant refines
on its own. Everything runs locally by default; API models (Claude, OpenAI)
plug in optionally.

Inspired by PewDiePie's **Odysseus** project — a personal, local AI you fully
own and shape yourself.

> **Status: 🚧 early scaffold.** The chat skeleton runs today; the rest is a
> guided build. See **[GUIDE.md](GUIDE.md)** for the step-by-step plan and
> **[docs/ROADMAP.md](docs/ROADMAP.md)** for progress.

---

## ✨ Features (the vision)

| Feature | What it does | Phase |
| --- | --- | --- |
| 💬 **Chat with your agents** | Talk (and eventually speak) with any agent you create | ✅ skeleton |
| 🤖 **Custom agents** | Model + persona + tools + memory, defined as data | 5 |
| 🧰 **Tools & MCP** | Built-in bash/files/web/memory + any MCP server, toggleable per tool | 4, 7 |
| 🖥️ **Hardware-aware models** | Recommends models that fit your RAM/VRAM | ✅ skeleton |
| 📧 **Email assistant** | Summaries, style-matched drafts, auto-tagging & spam triage over IMAP/SMTP | 8 |
| 🔎 **Deep Research** | Multi-step runs that gather, read & synthesize sources into a report | 9 |
| 🧠 **Memory** | Durable facts recalled across sessions | 6 |
| 🌱 **Self-evolving Skills** | The assistant writes, refines & reuses its own skills | 10 |
| 🎭 **Characters** | Personas with voice & backstory you can design | 11 |
| 🔌 **API models too** | Use Claude/OpenAI alongside local models | 12 |
| 🎨 **Local web UI** | Plain HTML/CSS/JS you fully control | ✅ skeleton |

---

## 🚀 Quick start

**Prerequisites:** Python 3.11+, and [Ollama](https://ollama.com/download) installed.

```powershell
# 1. From the project root, run one-time setup (creates venv, installs deps, makes .env)
./scripts/setup.ps1

# 2. Install a model (in a separate terminal, after installing Ollama)
ollama pull llama3.2

# 3. Start Atlas
python run.py

# 4. Open the UI
#    http://127.0.0.1:8000
```

Don't want the script? Manual version:

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
