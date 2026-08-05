import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db, get_current_user, get_provider_registry
from app.services.chat_service import chat_service
from app.schemas.chat import (
    ChatStreamRequest,
    ConversationRead,
    ConversationCreate,
    ConversationUpdate,
    MessageRead,
)
from app.providers.registry import ProviderRegistry
from app.models.user import User

router = APIRouter(prefix="/chat", tags=["Chat & Streaming"])


@router.post("/stream")
async def stream_chat(
    payload: ChatStreamRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    registry: ProviderRegistry = Depends(get_provider_registry),
):
    """Stream an AI response as Server-Sent Events (SSE)."""
    return StreamingResponse(
        chat_service.stream_chat(db, current_user, payload, registry),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable Nginx buffering for SSE
        },
    )


@router.post("/conversations", response_model=ConversationRead, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    payload: ConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await chat_service.create_conversation(
        db,
        current_user.id,
        title=payload.title or "New Conversation",
        model=payload.model,
        project_id=payload.project_id,
    )


@router.get("/conversations", response_model=List[ConversationRead])
async def list_conversations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await chat_service.get_user_conversations(db, current_user.id)


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageRead])
async def list_messages(
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await chat_service.get_conversation_messages(db, conversation_id, current_user.id)


@router.patch("/conversations/{conversation_id}", response_model=ConversationRead)
async def update_conversation(
    conversation_id: uuid.UUID,
    payload: ConversationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Rename, pin, or archive a conversation."""
    return await chat_service.update_conversation(db, conversation_id, current_user.id, payload)


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Permanently delete a conversation and all its messages."""
    await chat_service.delete_conversation(db, conversation_id, current_user.id)
