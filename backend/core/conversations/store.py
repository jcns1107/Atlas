from __future__ import annotations
from pathlib import Path
import re
import os
import logging
from datetime import datetime, timezone

from pydantic import ValidationError

from backend.core.conversations.models import Conversation, CONVERSATION_ID_PATTERN

logger = logging.getLogger(__name__)


class ConversationNotFoundError(Exception):
    """Raised when a conversation is not found in the store."""

    pass


class ConversationExistsError(Exception):
    """Raised when a conversation already exists in the store."""

    pass


class ConversationStore:
    """A store for conversations, stored as JSON files under data/conversations/."""

    def __init__(self, root: Path) -> None:
        self.root = root
        self.root.mkdir(parents=True, exist_ok=True)

    def _path(self, id: str) -> Path:
        """Get the path to a conversation file by ID."""
        if not re.fullmatch(CONVERSATION_ID_PATTERN, id):
            raise ConversationNotFoundError(f"Invalid conversation ID: {id}")
        return self.root / f"{id}.json"

    def _write(self, path: Path, conversation: Conversation) -> None:
        """Write a conversation to its file."""
        temp_path = path.with_name(path.name + ".tmp")
        temp_path.write_text(conversation.model_dump_json(indent=2), encoding="utf-8")
        os.replace(temp_path, path)  # atomic replace

    def create(self, conversation: Conversation) -> Conversation:
        """Create a new conversation file."""
        path = self._path(conversation.id)
        if path.exists():
            raise ConversationExistsError(f"Conversation {conversation.id} already exists.")
        self._write(path, conversation)
        return conversation

    def get(self, id: str) -> Conversation:
        """Get a conversation by ID"""
        path = self._path(id)
        try:
            text = path.read_text(encoding="utf-8")
        except FileNotFoundError:
            raise ConversationNotFoundError(f"Conversation {id} not found.") from None
        return Conversation.model_validate_json(text)

    def list(self) -> list[Conversation]:
        """List all conversations."""
        conversations = []
        for path in self.root.glob("*.json"):
            try:
                conversations.append(
                    Conversation.model_validate_json(path.read_text(encoding="utf-8"))
                )
            except ValidationError as exc:
                logger.warning("Skipping invalid conversation file %s: %s", path, exc)
            except OSError as exc:
                logger.warning("Skipping unreadable conversation file %s: %s", path, exc)

        # Sort conversations by updated_at descending
        conversations.sort(key=lambda c: c.updated_at, reverse=True)
        return conversations

    def save(self, conv: Conversation) -> Conversation:
        """Save an existing conversation."""
        path = self._path(conv.id)
        if not path.exists():
            raise ConversationNotFoundError(f"Conversation {conv.id} not found.") from None
        conv.updated_at = datetime.now(timezone.utc)
        self._write(path, conv)
        return conv

    def delete(self, id: str) -> None:
        """Delete a conversation by ID."""
        path = self._path(id)
        try:
            path.unlink()
        except FileNotFoundError:
            raise ConversationNotFoundError(f"Conversation {id} not found.") from None
