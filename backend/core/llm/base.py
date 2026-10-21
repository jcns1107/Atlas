"""The provider interface — YOUR job to design (GUIDE.md, Phase 1).

Define the single shape every model backend implements. When you later add an
API provider (Phase 12), it implements this same shape and nothing else in
Atlas has to change. That's the whole point of having an interface.

Questions to answer as you design it:
  - What does "chat" need as INPUT? (probably a list of {role, content}
    messages, a model name, maybe sampling settings like temperature.)
  - What does it RETURN? For streaming, an async generator of text chunks
    (`AsyncIterator[str]`).

A Python `Protocol` (from `typing`) is a clean way to express an interface
without forcing every provider to inherit from a base class. A suggested shape
— design your own:

    async def stream_chat(messages, model=None) -> AsyncIterator[str]: ...

Start with plain text chunks — it's all Phase 1 needs. Expect to CHANGE this
interface in Phase 4: once models think and call tools, one stream carries
several kinds of things (a piece of answer text, a piece of "thinking", a tool
call, a final "done" with token counts). You'll upgrade the yield type to small
typed events (e.g. a dataclass with a `kind` field). Evolving your own interface
when the requirements grow is part of the lesson — not a mistake.

Write the interface below.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Literal, Protocol

from pydantic import BaseModel, Field

# TODO: define your ChatProvider interface (Protocol or ABC).


class Message(BaseModel):
    """One turn in a conversation. Roles match Ollama's chat format."""

    # The role of the message sender, which can be "system", "user", "assistant", or "tool".
    role: Literal["system", "user", "assistant", "tool"]

    # The content of the message
    content: str = Field(min_length=1, description="The content of the message.")


class ChatProvider(Protocol):
    """The interface every model backend implements. One method, one shape."""

    def stream_chat(self, messages: list[Message], model: str | None = None) -> AsyncIterator[str]:
        """Send the conversation to the model and yield the reply text as it arrives.

        `model=None` means "use this provider's default model".
        """
        ...

    async def list_models(self) -> list[str]:
        """Return a list of model names this provider supports."""
        ...
