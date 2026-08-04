import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.conversation import Conversation
from app.repositories.base_repo import BaseRepository

class ConversationRepository(BaseRepository[Conversation]):
    def __init__(self):
        super().__init__(Conversation)

    async def get_by_user(self, db: AsyncSession, user_id: uuid.UUID, limit: int = 50) -> List[Conversation]:
        stmt = (
            select(Conversation)
            .where(Conversation.user_id == user_id, Conversation.is_archived == False)
            .order_by(desc(Conversation.updated_at))
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

conversation_repo = ConversationRepository()
