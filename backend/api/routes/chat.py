"""Chat endpoint — streams a model's reply token-by-token via SSE.

This is the heart of the starter skeleton. POST a list of messages and you
get back a `text/event-stream` you can render live in the browser.
"""

from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from backend.core.llm import OllamaProvider
from backend.schemas.chat import ChatRequest

router = APIRouter(tags=["chat"])
_provider = OllamaProvider()


@router.post("/chat")
async def chat(req: ChatRequest) -> StreamingResponse:
    messages = [m.model_dump() for m in req.messages]

    async def event_stream():
        try:
            async for chunk in _provider.stream_chat(messages, model=req.model):
                # Server-Sent Events format: "data: <payload>\n\n"
                yield f"data: {chunk}\n\n"
        except Exception as exc:  # surface connection errors to the UI
            yield f"event: error\ndata: {exc}\n\n"
        yield "event: done\ndata: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
