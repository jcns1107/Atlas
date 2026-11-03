"""The provider interface: the one shape every model backend implements.

Routes and agents only talk to `ChatProvider`, never to Ollama or an API
directly. Adding a new backend (Claude, OpenAI — Phase 12) means writing one new
class that matches this shape; nothing else in Atlas has to change.

What lives here:
  - Message     : one turn of a conversation (role + content).
  - StreamChunk : one labeled piece of a streamed reply. Labels matter because
                  one stream carries different things — answer text, the
                  model's "thinking", and a final "done" with token counts —
                  and the UI shows each one differently.
  - ChatProvider: the contract — stream a reply, list available models.

This interface grows with the project: Phase 4 adds tool calls as a new chunk
kind (with fields to carry the call).
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from typing import Literal, Protocol

from pydantic import BaseModel, Field


class Message(BaseModel):
    """One turn in a conversation. Roles match Ollama's chat format."""

    # The role of the message sender, which can be "system", "user", "assistant", or "tool".
    role: Literal["system", "user", "assistant", "tool"]

    # The content of the message
    content: str = Field(min_length=1, description="The content of the message.")


class StreamChunk(BaseModel):
    """One labeled piece of a streamed reply.

    kind:
      - "text"     : a piece of the answer (in `text`).
      - "thinking" : a piece of the model's reasoning (in `text`).
      - "error"    : created by the route when the provider raises — providers
                     raise exceptions, they don't yield this kind.
      - "done"     : the reply finished; carries the token counts.
    """

    kind: Literal["text", "thinking", "error", "done"]
    text: str = Field(default="", description="The text content of the chunk, if any.")

    prompt_tokens: int | None = Field(
        default=None,
        description="The number of tokens in the prompt, if known. Only set on done chunk.",
    )
    output_tokens: int | None = Field(
        default=None,
        description="The number of tokens in the output, if known. Only set on done chunk.",
    )


class ChatProvider(Protocol):
    """The interface every model backend implements.

    A Protocol: a provider doesn't inherit from this class, it just needs
    methods with these exact shapes.
    """

    def stream_chat(
        self, messages: list[Message], model: str | None = None, think: bool | None = None
    ) -> AsyncIterator[StreamChunk]:
        """Send the conversation to the model and yield the reply as it arrives.

        Yields `text` and `thinking` chunks while the model generates, then one
        final `done` chunk with the token counts. Raises on errors (the route
        turns them into an `error` chunk for the browser).

        `model=None` means "use this provider's default model".
        `think` has three states:
          - None  : don't send it — the model uses its default.
          - True  : turn thinking on (errors on models that can't think).
          - False : turn thinking off for faster answers.
        """

        ...

    async def list_models(self) -> list[str]:
        """Return the names of the models this provider can use."""
        ...
