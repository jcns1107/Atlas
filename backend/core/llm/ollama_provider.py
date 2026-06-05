"""Ollama provider — YOUR job to implement (GUIDE.md, Phase 1).

Talk to a locally running Ollama server (default http://localhost:11434) and
implement the interface you defined in base.py.

Ollama's REST API (the two endpoints you need first):
  - POST /api/chat  : a chat completion. With {"stream": true} the response is
                      newline-delimited JSON — each line is a chunk that holds
                      message.content (the next piece of text) and a `done` flag.
  - GET  /api/tags  : the models the user has pulled.

What to implement:
  - list_models()                  -> the installed model names.
  - stream_chat(messages, model)   -> yield each text chunk as it arrives.

Hints:
  - Use `httpx.AsyncClient`. For streaming, `client.stream("POST", url, json=...)`
    plus `async for line in resp.aiter_lines()`.
  - Each streamed line is JSON — parse it, pull out the text, `yield` it.
  - Read OLLAMA_BASE_URL / OLLAMA_DEFAULT_MODEL from `backend.config.settings`.
  - Before coding, poke the API by hand to see the response shape, e.g.:
      curl http://localhost:11434/api/chat -d '{"model":"llama3.2","messages":[{"role":"user","content":"hi"}]}'
"""

from __future__ import annotations

# TODO: implement the OllamaProvider class (list_models + stream_chat).
