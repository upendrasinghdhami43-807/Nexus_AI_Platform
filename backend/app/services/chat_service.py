import uuid
import json
from typing import AsyncIterator, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.conversation_repo import conversation_repo
from app.repositories.message_repo import message_repo
from app.providers.registry import ProviderRegistry
from app.providers.base import ChatRequest, ChatMessage
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message, MessageRole
from app.schemas.chat import ChatStreamRequest, ConversationRead, MessageRead

class ChatService:
    async def create_conversation(
        self, db: AsyncSession, user_id: uuid.UUID, title: str = "New Conversation", model: str = "gemini-3.5-flash", project_id: Optional[uuid.UUID] = None
    ) -> ConversationRead:
        conv = await conversation_repo.create(db, {
            "user_id": user_id,
            "title": title,
            "model": model,
            "project_id": project_id,
        })
        return ConversationRead.model_validate(conv)

    async def get_user_conversations(self, db: AsyncSession, user_id: uuid.UUID) -> List[ConversationRead]:
        convs = await conversation_repo.get_by_user(db, user_id)
        return [ConversationRead.model_validate(c) for c in convs]

    async def get_conversation_messages(self, db: AsyncSession, conversation_id: uuid.UUID, user_id: uuid.UUID) -> List[MessageRead]:
        conv = await conversation_repo.get_by_id(db, conversation_id)
        if not conv or conv.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
        
        msgs = await message_repo.get_by_conversation(db, conversation_id)
        return [MessageRead.model_validate(m) for m in msgs]

    async def stream_chat(
        self,
        db: AsyncSession,
        user: User,
        payload: ChatStreamRequest,
        registry: ProviderRegistry
    ) -> AsyncIterator[str]:
        # 1. Resolve or create conversation
        if payload.conversation_id:
            conv = await conversation_repo.get_by_id(db, payload.conversation_id)
            if not conv or conv.user_id != user.id:
                raise HTTPException(status_code=404, detail="Conversation not found")
        else:
            first_title = payload.message[:30] + "..." if len(payload.message) > 30 else payload.message
            conv = await conversation_repo.create(db, {
                "user_id": user.id,
                "title": first_title,
                "model": payload.model,
                "project_id": payload.project_id
            })

        # 2. Persist user message
        await message_repo.create(db, {
            "conversation_id": conv.id,
            "role": MessageRole.USER,
            "content": payload.message,
        })

        # 3. Load historical messages for context
        history = await message_repo.get_by_conversation(db, conv.id)
        chat_messages = [ChatMessage(role=m.role.value, content=m.content) for m in history]

        chat_request = ChatRequest(
            messages=chat_messages,
            model=payload.model,
            temperature=0.7,
        )

        # 4. Stream chunks from registry
        full_response_chunks = []
        try:
            async for chunk in registry.stream_chat(payload.model, chat_request):
                full_response_chunks.append(chunk.delta)
                event_data = {
                    "conversation_id": str(conv.id),
                    "delta": chunk.delta,
                    "model": payload.model,
                }
                yield f"data: {json.dumps(event_data)}\n\n"
        except Exception as e:
            error_msg = f"AI Provider Streaming Error: {str(e)}"
            full_response_chunks.append(error_msg)
            yield f"data: {json.dumps({'delta': error_msg})}\n\n"

        # 5. Persist assistant response
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
