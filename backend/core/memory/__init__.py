"""Memory (Phase 6).

Two complementary layers:
  - Short-term: the running conversation (just the message list).
  - Long-term: durable facts the agent should remember across sessions.

Start simple with a SQLite table of (key, value, source, created_at). Upgrade
to semantic search later by adding embeddings + a vector index when you need
"recall by meaning" instead of exact lookup.

Planned modules:
  - store.py     : CRUD over the memory DB.
  - retrieve.py  : fetch the most relevant memories for a prompt.
"""
