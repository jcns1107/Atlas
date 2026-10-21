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

from pydantic import BaseModel, Field

from backend.core.llm.base import Message

# TODO: define your Message and ChatRequest models.


class ChatRequest(BaseModel):
    """Body of POST /api/chat. If `model` is omitted, the default from settings is used."""

    # A list of messages in the chat, which must contain at least one message.
    messages: list[Message] = Field(min_length=1, description="A list of messages in the chat.")

    # An optional model name for the chat request, which can be None if not specified.
    model: str | None = Field(default=None, description="Optional model name")

    # A boolean flag indicating whether to stream the response, which defaults to True.
    stream: bool = Field(default=True, description="Whether to stream the response")
