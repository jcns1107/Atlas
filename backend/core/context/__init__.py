"""Context — what goes into the model's prompt, and how much (Phases 5 & 6).

A model only "knows" what's in its context window on this call: the system
prompt, memories, documents, tool results, and the conversation so far. The
window is a fixed budget of tokens, and it fills up fast on a local model.
Deciding what earns a place in it is called **context engineering**, and it's
the heart of a good agent "harness" (the code wrapped around the model).

The big idea: **pick the cheapest strategy that fits.** RAG is NOT the default.

  1. Stuff it    — the documents fit comfortably (say, under half the budget)?
                   Just put them in the prompt. No embeddings, no index, and
                   the model sees everything. Best for a few files.
  2. Search it   — too big to stuff, but only tens-to-hundreds of files? Give
                   the agent tools (list_docs / grep_docs / read_doc) and let it
                   look things up itself, like Claude Code does with grep.
  3. Retrieve it — a large or growing corpus, or the same docs queried all the
                   time? Now RAG pays off: embed chunks once, fetch the top-k by
                   meaning (core/rag/). Hybrid keyword + vector in Phase 13.

Why not always RAG? Retrieval can miss the one chunk that mattered, chunking
splits ideas in half, and it's a whole pipeline to maintain. Why not always
stuff? Big prompts are slow on local hardware, and a model's *effective*
context is smaller than its advertised one — details in the middle of a long
prompt get lost. So: measure on your own docs (the Phase 6 mini-eval).

Planned modules:
  - budget.py     : count/estimate tokens (start with len(text) / 4, then check
                    against Ollama's prompt_eval_count) and know the window size
                    (settings.ollama_num_ctx, or the model's limit from /api/show).
  - assemble.py   : build the prompt in a fixed order — system/instructions ->
                    core memories -> skills index -> conversation summary ->
                    recent turns. Keep the early parts STABLE between turns:
                    Ollama reuses its cache for an unchanged prefix (and API
                    providers bill a cached prefix cheaper).
  - router.py     : choose stuff / search / retrieve for a set of documents.
  - compaction.py : when the conversation passes ~75% of the window, first
                    shrink old tool results (keep a short preview, save the full
                    text under data/ with a reference), then summarize older
                    turns into a running summary (goal, decisions, open tasks).
                    Keep the system prompt and the last few turns word-for-word.

This package is internal (used by agents) — it has no API route or UI of its
own, though showing "context used: 61%" in the chat UI is a nice touch.
"""
