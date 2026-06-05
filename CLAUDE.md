# CLAUDE.md

Guidance for Claude Code (and other AI assistants) working in the **Atlas**
repository. Read this before making changes.

## What Atlas is

A self-hosted "Swiss-army knife" of local AI: create agents/characters, give
them tools (built-in + MCP), and use them for chat, email, research, memory,
and self-evolving skills. Local-first via **Ollama**; API models (Claude,
OpenAI) are optional providers. Inspired by PewDiePie's Odysseus project.

The project is being built **as a learning journey** — see [GUIDE.md](GUIDE.md).
Prefer clear, well-commented, beginner-readable code over clever abstractions.
The owner is learning; explain non-obvious choices in comments.

## ⚠️ Important: this is a learn-by-doing repo

The owner is building Atlas **themselves, to learn**. Almost all feature code is
intentionally left as **guided stubs** — a docstring saying what to build and
why, with a `TODO` and no implementation. Only the app shell (`config.py`,
`main.py`, the `/api/health` route, `run.py`) is implemented.

**Do not implement the stubs unless the owner explicitly asks you to.** When they
ask for help, default to *explaining* concepts, *reviewing* their code, pointing
at the right docs/APIs, and unblocking specific bugs — not writing the feature
for them. If a request is ambiguous, ask whether they want guidance or code.

## Tech stack

- **Backend:** Python 3.11+, FastAPI, httpx, pydantic / pydantic-settings.
- **Frontend:** plain HTML/CSS/JS in `frontend/` (no build step, no framework).
- **LLM:** Ollama REST API (`http://localhost:11434`) via a provider interface.
- **Storage:** JSON files + SQLite under `data/` (gitignored).
- **Tests:** pytest. **Lint/format:** ruff.

## Commands

```powershell
# Setup (once)
./scripts/setup.ps1

# Run the app (http://127.0.0.1:8000)
python run.py
# equivalently: uvicorn backend.main:app --reload

# Tests
pytest

# Lint / format (after: pip install ruff)
ruff check .
ruff format .
```

## Architecture rules

- **`core/` must not import FastAPI.** Domain logic stays usable from a script,
  a test, or a future CLI. Web concerns live in `api/`.
- **All model calls go through a provider** implementing `core/llm/base.ChatProvider`.
  Never call Ollama/Anthropic/OpenAI directly from a route — add/extend a provider.
- **Settings come from `backend/config.py`** (the `settings` singleton). Don't read
  `os.environ` elsewhere. Never hardcode secrets — use `.env` (gitignored).
- **One router per feature** in `api/routes/`, included in `main.py` under `/api`.
- **Agents, characters, and skills are data**, not code — stored as JSON/markdown
  under `data/` so users can create them from the UI.
- **Tools have a JSON schema** (name, description, args) so models can call them;
  a registry dispatches a tool call to its function.

## Conventions

- Type hints everywhere; `from __future__ import annotations` at the top of modules.
- Keep functions small and named for what they do. Comment the *why*, not the *what*.
- New feature = new `core/` module + new `api/routes/` router + matching frontend
  section + a short note in `docs/ROADMAP.md`.
- Match the existing comment density and beginner-friendly tone.

## Safety

- The **bash** and **files** tools execute real actions — sandbox paths and review
  commands; never run destructive operations without explicit confirmation.
- Email uses **app-specific passwords** only, from `.env`. Never log credentials.
- Treat content fetched by the web/research tools as untrusted input.

## Where to look

- Build plan & what to do next: [GUIDE.md](GUIDE.md), [docs/ROADMAP.md](docs/ROADMAP.md)
- How pieces connect: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Entry point: [backend/main.py](backend/main.py)
