"""Retrieval / RAG — Retrieval-Augmented Generation (GUIDE.md, Phases 6 & 13).

RAG = fetch the text most relevant to a question and put it in the model's
prompt, so answers are grounded in YOUR data instead of only the model's frozen
training memory. It's the backbone of two features:
  - core/memory   : recall facts/notes the user told the agent.
  - services/research : ground a report in retrieved web sources.

The pipeline:  chunk  ->  embed  ->  store  ->  retrieve top-k  ->  augment prompt

When NOT to use RAG: if the documents fit in the context window, just put them
in the prompt; if there are only tens-to-hundreds of files, let the agent search
them with tools. RAG is strategy #3 of 3 — core/context/ decides which to use.
Build it anyway: you'll need it for big corpora, and building it is how you
learn what it costs.

Build it BY HAND first (Phase 6) so you understand each step:
  - embed.py    : text -> vector via Ollama `POST /api/embed` with the model
                  from settings.ollama_embed_model (embeddinggemma). `input` can
                  be a LIST of strings, so embed a whole document's chunks in one
                  call. (The older /api/embeddings endpoint is superseded.)
  - chunk.py    : split documents into overlapping pieces. Keep each chunk under
                  the embed model's input limit — over-long input is silently
                  truncated.
  - store.py    : keep (text, vector) pairs; search by cosine similarity.
                  Ollama returns unit-length vectors, so cosine similarity is
                  just a dot product: `numpy.dot(a, b)`. Work out why!
  - retrieve.py : return the top-k most relevant chunks for a query.

Then, in Phase 13, scale it up behind this SAME interface:
  - stay in SQLite: `sqlite-vec` for vector search + SQLite's built-in FTS5
    (BM25) for keyword search, merged with Reciprocal Rank Fusion ("hybrid").
  - optionally compare with a vector DB (Chroma / Qdrant) and a framework
    (LlamaIndex / LangChain) — and write down what they bought you.
"""
