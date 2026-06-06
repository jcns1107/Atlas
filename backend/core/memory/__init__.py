"""Memory (Phase 6).

Two complementary layers:
  - Short-term: the running conversation (just the message list).
  - Long-term: durable facts the agent should remember across sessions.

Start simple with a SQLite table of (key, value, source, created_at). Then add
"recall by meaning" with embeddings + similarity search — that's **RAG**, and the
reusable pieces live in core/rag/ (built by hand in Phase 6, swappable for a real
vector DB in Phase 13).

Planned modules:
  - store.py     : CRUD over the memory DB.
  - retrieve.py  : fetch the most relevant memories for a prompt.
"""
