"""Schemas for the chat endpoint."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    model: str | None = None          # falls back to OLLAMA_DEFAULT_MODEL
    stream: bool = True
