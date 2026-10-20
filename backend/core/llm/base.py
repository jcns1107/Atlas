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

# TODO: define your ChatProvider interface (Protocol or ABC).
