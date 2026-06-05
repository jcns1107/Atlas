"""Chat request/response models — YOUR job to design (GUIDE.md, Phase 1).

Pydantic models validate the JSON coming from the browser, so your route
handlers receive typed, checked data instead of raw dicts. If a request is
malformed, FastAPI rejects it for you with a clear error.

What you'll likely need:
  - A Message     : role ("system" | "user" | "assistant") + content (str).
  - A ChatRequest : a list of messages, an optional model name, a stream flag.

Define them below with pydantic's BaseModel.
"""

from __future__ import annotations

# TODO: define your Message and ChatRequest models.
