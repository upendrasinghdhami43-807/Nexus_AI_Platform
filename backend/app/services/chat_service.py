import uuid
import json
import logging
from typing import AsyncIterator, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.conversation_repo import conversation_repo
from app.repositories.message_repo import message_repo
from app.providers.registry import ProviderRegistry
from app.providers.base import ChatRequest, ChatMessage
from app.models.user import User
from app.schemas.chat import ChatStreamRequest, ConversationRead, MessageRead, ConversationUpdate

logger = logging.getLogger(__name__)

# Maximum number of messages to include in context window
# (to avoid hitting provider token limits on long conversations)
_MAX_CONTEXT_MESSAGES = 20


class ChatService:
    async def create_conversation(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        title: str = "New Conversation",
        model: str = "gemini-3.5-flash",
        project_id: Optional[uuid.UUID] = None,
    ) -> ConversationRead:
        conv = await conversation_repo.create(db, {
            "user_id": user_id,
            "title": title,
            "model": model,
            "project_id": project_id,
        })
        return ConversationRead.model_validate(conv)

    async def get_user_conversations(
        self, db: AsyncSession, user_id: uuid.UUID
    ) -> List[ConversationRead]:
        convs = await conversation_repo.get_by_user(db, user_id)
        return [ConversationRead.model_validate(c) for c in convs]

    async def get_conversation_messages(
        self, db: AsyncSession, conversation_id: uuid.UUID, user_id: uuid.UUID
    ) -> List[MessageRead]:
        conv = await conversation_repo.get_by_id(db, conversation_id)
        if not conv or conv.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
        msgs = await message_repo.get_by_conversation(db, conversation_id)
        return [MessageRead.model_validate(m) for m in msgs]

    async def update_conversation(
        self,
        db: AsyncSession,
        conversation_id: uuid.UUID,
        user_id: uuid.UUID,
        data: ConversationUpdate,
    ) -> ConversationRead:
        conv = await conversation_repo.get_by_id(db, conversation_id)
        if not conv or conv.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
        updated = await conversation_repo.update(db, conv, data.model_dump(exclude_unset=True))
        return ConversationRead.model_validate(updated)

    async def delete_conversation(
        self, db: AsyncSession, conversation_id: uuid.UUID, user_id: uuid.UUID
    ) -> None:
        conv = await conversation_repo.get_by_id(db, conversation_id)
        if not conv or conv.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
        await conversation_repo.delete(db, conversation_id)

    async def stream_chat(
        self,
        db: AsyncSession,
        user: User,
        payload: ChatStreamRequest,
        registry: ProviderRegistry,
    ) -> AsyncIterator[str]:
        # ── 1. Resolve or create conversation ────────────────────────────────
        if payload.conversation_id:
            conv = await conversation_repo.get_by_id(db, payload.conversation_id)
            if not conv or conv.user_id != user.id:
                yield f"event: error\ndata: {json.dumps({'code': 'NOT_FOUND', 'message': 'Conversation not found.'})}\n\n"
                return
        else:
            # Auto-title from first 60 chars of the message
            first_title = payload.message[:57] + "..." if len(payload.message) > 57 else payload.message
            conv = await conversation_repo.create(db, {
                "user_id": user.id,
                "title": first_title,
                "model": payload.model,
                "project_id": payload.project_id,
            })

        # ── 2. Emit conversation_id as first chunk so frontend can sync URL ──
        yield f"data: {json.dumps({'event': 'conversation_created', 'conversation_id': str(conv.id)})}\n\n"

        # ── 3. Persist user message ───────────────────────────────────────────
        from app.models.message import MessageRole
        await message_repo.create(db, {
            "conversation_id": conv.id,
            "role": MessageRole.USER,
            "content": payload.message,
        })

        # ── 4. Load history + apply context window limit ──────────────────────
        history = await message_repo.get_by_conversation(db, conv.id)
        # Keep the last N messages to stay within provider token limits
        trimmed = history[-_MAX_CONTEXT_MESSAGES:] if len(history) > _MAX_CONTEXT_MESSAGES else history
        chat_messages = [ChatMessage(role=m.role.value, content=m.content) for m in trimmed]

        chat_request = ChatRequest(
            messages=chat_messages,
            model=payload.model,
            temperature=0.7,
        )

        # ── 5. Stream from provider ───────────────────────────────────────────
        full_response_chunks: List[str] = []
        try:
            async for chunk in registry.stream_chat(payload.model, chat_request):
                if chunk.delta:
                    full_response_chunks.append(chunk.delta)
                    event_data = {
                        "conversation_id": str(conv.id),
                        "delta": chunk.delta,
                        "model": payload.model,
                    }
                    yield f"data: {json.dumps(event_data)}\n\n"
        except Exception as exc:
            logger.exception("Provider streaming error for model=%s user=%s", payload.model, user.id)
            error_msg = "AI provider encountered an error. Please try again."
            yield f"event: error\ndata: {json.dumps({'code': 'PROVIDER_ERROR', 'message': error_msg})}\n\n"
            # Still persist what we got before the error
            full_response_chunks.append(f"\n\n[Stream interrupted: {type(exc).__name__}]")

        # ── 6. Persist assistant response ─────────────────────────────────────
        assistant_content = "".join(full_response_chunks)
        if assistant_content.strip():
            await message_repo.create(db, {
                "conversation_id": conv.id,
                "role": MessageRole.ASSISTANT,
                "content": assistant_content,
                "model": payload.model,
            })

        yield "data: [DONE]\n\n"


chat_service = ChatService()
