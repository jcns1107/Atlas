"""Hardware-aware model recommendations — YOUR job to implement (Phase 3).

The idea: a quantized model needs roughly its parameter count in GB of memory
(a 7B Q4 model ~ 4-5 GB), plus extra for the context window (a bigger num_ctx
costs more memory). Compare that against available memory and only suggest
models that fit comfortably.

What to build:
  - system_profile() -> a snapshot of the machine's RAM/CPU. The `psutil`
    library makes this easy: psutil.virtual_memory(), psutil.cpu_count().
  - recommend_models(profile) -> walk a small catalog of
    (display name, ollama tag, approx GB needed) and flag each model as
    comfortable / tight / too large for this machine. Seed it with current
    families in a few sizes — e.g. qwen3 (1.7b / 4b / 8b / 14b), gemma4, and
    gpt-oss:20b for big machines — and check the real tags and sizes on
    https://ollama.com/library (they change often).

Useful Ollama endpoints:
  - POST /api/show {"model": ...} : a model's `capabilities` (tools, thinking,
    vision, embedding) and its context length — badge models with these.
  - GET  /api/ps : which models are loaded right now and how much VRAM they use.

Why rule-based first? It's transparent and easy to reason about. You can make it
smarter later (a live model catalog, GPU/VRAM detection via nvidia-smi, etc.).
"""

from __future__ import annotations

# TODO: implement system_profile() and recommend_models().
