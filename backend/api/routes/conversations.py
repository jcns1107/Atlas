from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError

from backend.core.conversations.models import Conversation
from backend.core.conversations.store import (
    ConversationStore,
    ConversationExistsError,
    ConversationNotFoundError,
)
from backend.api.deps import get_store
from backend.schemas.conversation import ConversationCreate, ConversationUpdate, ConversationSummary


router = APIRouter(
    prefix="/conversations", tags=["conversations"], responses={404: {"description": "Not found"}}
)


@router.post("", status_code=201)
def create_conversation(
    body: ConversationCreate, store: ConversationStore = Depends(get_store)
) -> Conversation:
    """Create a new conversation."""

    conversation = Conversation(**body.model_dump(exclude_unset=True))
    try:
        store.create(conversation)
    except ConversationExistsError:
        raise HTTPException(
            status_code=409, detail=f"Conversation {conversation.id} already exists."
        ) from None
    return conversation


@router.get("", response_model=list[ConversationSummary])
def list_conversations(store: ConversationStore = Depends(get_store)) -> list[Conversation]:
    """List all conversations."""

    return store.list()


@router.get("/{conversation_id}")
def get_conversation(
    conversation_id: str, store: ConversationStore = Depends(get_store)
) -> Conversation:
    """Get a conversation by ID."""

    try:
        conversation = store.get(conversation_id)
        return conversation
    except ConversationNotFoundError:
        raise HTTPException(
            status_code=404, detail=f"Conversation {conversation_id} not found."
        ) from None


@router.patch("/{conversation_id}")
def update_conversation(
    conversation_id: str, body: ConversationUpdate, store: ConversationStore = Depends(get_store)
) -> Conversation:
    """Update a conversation by ID."""

    try:
        conversation = store.get(conversation_id)
        for key, value in body.model_dump(exclude_unset=True).items():
            setattr(conversation, key, value)
        store.save(conversation)
        return conversation
    except ConversationNotFoundError:
        raise HTTPException(
            status_code=404, detail=f"Conversation {conversation_id} not found."
        ) from None
    except ValidationError as exc:
        raise HTTPException(
            status_code=422, detail=exc.errors(include_context=False, include_url=False)
        ) from None


@router.delete("/{conversation_id}", status_code=204)
def delete_conversation(
    conversation_id: str, store: ConversationStore = Depends(get_store)
) -> None:
    """Delete a conversation by ID."""

    try:
        store.delete(conversation_id)
    except ConversationNotFoundError:
        raise HTTPException(
            status_code=404, detail=f"Conversation {conversation_id} not found."
        ) from None
