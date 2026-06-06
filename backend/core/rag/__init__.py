"""Retrieval / RAG — Retrieval-Augmented Generation (GUIDE.md, Phases 6 & 13).

RAG = fetch the text most relevant to a question and put it in the model's
prompt, so answers are grounded in YOUR data instead of only the model's frozen
training memory. It's the backbone of two features:
  - core/memory   : recall facts/notes the user told the agent.
  - services/research : ground a report in retrieved web sources.

The pipeline:  chunk  ->  embed  ->  store  ->  retrieve top-k  ->  augment prompt

Build it BY HAND first (Phase 6) so you understand each step:
  - embed.py    : text -> vector, using Ollama's `nomic-embed-text` (/api/embeddings).
  - chunk.py    : split documents into overlapping pieces.
  - store.py    : keep (text, vector) pairs; search by cosine similarity.
  - retrieve.py : return the top-k most relevant chunks for a query.

Then, once you know what they do, swap the store for a real vector database and
optionally a framework (Phase 13) behind this SAME interface — Chroma / FAISS /
Qdrant for storage; LangChain or LlamaIndex for loaders + retrievers.
"""
