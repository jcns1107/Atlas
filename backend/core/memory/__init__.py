"""Memory (Phase 6).

Two complementary layers:
  - Short-term: the running conversation (just the message list).
  - Long-term: durable facts the agent should remember across sessions.

Start simple with a SQLite table of (key, value, source, created_at) — Python's
built-in `sqlite3` module is all you need.

Then split long-term memory in two, the way modern assistants do:
  - Core memories : a few short, always-true facts (the user's name, their
                    preferences). Small enough to ALWAYS put in the prompt.
  - Recall        : everything else, fetched only when relevant — first by
                    keyword search, then "by meaning" with embeddings. That's
                    **RAG**, and the reusable pieces live in core/rag/.

An alternative worth trying: memory as a markdown file the agent reads and edits
itself (like Claude Code's CLAUDE.md / an AGENTS.md). Easy to inspect, easy to
fix by hand — and often enough for one person's facts.

Planned modules:
  - store.py     : CRUD over the memory DB.
  - retrieve.py  : fetch the most relevant memories for a prompt.
"""
