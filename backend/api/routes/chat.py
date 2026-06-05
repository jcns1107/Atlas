"""Chat endpoint — YOUR job to implement (GUIDE.md, Phase 1).

Goal: accept a list of chat messages, send them to a model through your LLM
provider, and stream the reply back to the browser so it appears token by token.

What to build here:
  - A `POST /api/chat` route.
  - Read and validate the request body (design the schema in
    backend/schemas/chat.py).
  - Call your provider's streaming chat method (backend/core/llm/).
  - Return the chunks as a live stream.

Why stream? Local models generate one token at a time; streaming makes the UI
feel instant instead of waiting for the whole answer. Server-Sent Events
(media_type "text/event-stream") is the simplest transport the browser can read
incrementally — each frame looks like  `data: <text>\n\n`.

Keep this route THIN: parse the request, call core, stream the result. All the
real model logic belongs in core/llm/, not here.

Right now it returns 501 so the app still boots and the route shows up in /docs.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["chat"])


@router.post("/chat")
async def chat():
    raise HTTPException(status_code=501, detail="Not implemented yet — see GUIDE.md Phase 1.")
