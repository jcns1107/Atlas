from __future__ import annotations

from datetime import UTC, datetime
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field

from backend.core.llm.base import Message

CONVERSATION_ID_PATTERN = r"^[0-9a-f]{32}$"
DEFAULT_TITLE = "New Chat"


class Conversation(BaseModel):
    """A saved conversation, stored as a JSON file under data/conversations/."""

    model_config = ConfigDict(validate_assignment=True)

    # File name of the conversation, which is also its unique identifier.
    id: str = Field(
        default_factory=lambda: uuid4().hex,
        pattern=CONVERSATION_ID_PATTERN,
        description="The unique identifier of the conversation.",
    )

    # The title of the conversation.
    title: str = Field(
        default=DEFAULT_TITLE, min_length=1, description="The title of the conversation."
    )

    model: str | None = Field(
        default=None, description="The model used for the conversation, if any."
    )

    think: bool | None = Field(default=None, description="None is model default.")

    system_prompt: str = Field(
        default="", description="The system prompt used for the conversation, if any."
    )

    # The list of messages in the conversation.
    messages: list[Message] = Field(
        default_factory=list, description="The list of messages in the conversation."
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="The timestamp when the conversation was created.",
    )

    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        description="The timestamp when the conversation was last updated.",
    )
