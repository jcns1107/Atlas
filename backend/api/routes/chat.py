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

import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from backend.core.llm.base import ChatProvider
from backend.core.llm.ollama_provider import OllamaProvider
from backend.schemas.chat import ChatRequest

router = APIRouter(tags=["chat"])

provider: ChatProvider = OllamaProvider()


@router.post("/chat")
async def chat(req: ChatRequest) -> StreamingResponse:
    """Accept a list of messages, send them to the model, and stream the reply back."""

    async def event_stream():
        # Each SSE frame carries ONE line of JSON. Raw text would break the
        # framing: model chunks often contain "\n" (new paragraphs), and SSE
        # treats a blank line as "end of event" — so the newlines got lost.
        # json.dumps escapes them, and the `kind` field gets the frontend ready
        # for Phase 4 (thinking / tool_call events ride the same stream).
        try:
            async for chunk in provider.stream_chat(req.messages, req.model):
                yield f"data: {json.dumps({'kind': 'text', 'text': chunk})}\n\n"
        except Exception as exc:  # `exc`, not `exec` — that name is a Python builtin
            yield f"data: {json.dumps({'kind': 'error', 'message': str(exc)})}\n\n"
        yield f"data: {json.dumps({'kind': 'done'})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
