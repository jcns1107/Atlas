"""Conversation Schema (GUIDE.md, Phase 2)"""

from __future__ import annotations
from datetime import datetime

from pydantic import BaseModel, Field

from backend.core.conversations.models import DEFAULT_TITLE


class ConversationCreate(BaseModel):
    """Schema for creating a new conversation."""

    title: str = Field(
        default=DEFAULT_TITLE, min_length=1, description="The title of the conversation."
    )
    model: str | None = Field(
        default=None, description="The model used for the conversation, if any."
    )
    think: bool | None = Field(
        default=None, description="Whether to enable thinking mode (if supported by the model)."
    )
    system_prompt: str = Field(
        default="", description="The system prompt used for the conversation, if any."
    )


class ConversationUpdate(BaseModel):
    """Schema for updating an existing conversation."""

    title: str | None = Field(
        default=None, min_length=1, description="The title of the conversation."
    )
    model: str | None = Field(
        default=None, description="The model used for the conversation, if any."
    )
    think: bool | None = Field(
        default=None, description="Whether to enable thinking mode (if supported by the model)."
    )
    system_prompt: str | None = Field(
        default=None, description="The system prompt used for the conversation, if any."
    )


class ConversationSummary(BaseModel):
    """Schema for summarizing a conversation."""

    id: str = Field(description="The unique identifier of the conversation.")
    title: str = Field(description="The title of the conversation.")
    model: str | None = Field(
        default=None, description="The model used for the conversation, if any."
    )
    updated_at: datetime = Field(
        description="The timestamp when the conversation was last updated."
    )
