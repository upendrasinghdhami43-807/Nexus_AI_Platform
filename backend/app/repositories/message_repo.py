import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.message import Message
from app.repositories.base_repo import BaseRepository

class MessageRepository(BaseRepository[Message]):
    def __init__(self):
        super().__init__(Message)

    async def get_by_conversation(self, db: AsyncSession, conversation_id: uuid.UUID) -> List[Message]:
        stmt = (
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

message_repo = MessageRepository()
