import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.embedding import Embedding
from app.repositories.base_repo import BaseRepository

class EmbeddingRepository(BaseRepository[Embedding]):
    def __init__(self):
        super().__init__(Embedding)

    async def search_similar(self, db: AsyncSession, query_vector: List[float], project_id: uuid.UUID = None, limit: int = 5) -> List[Embedding]:
        stmt = select(Embedding)
        if project_id:
            stmt = stmt.where(Embedding.project_id == project_id)
        if hasattr(Embedding.vector, "l2_distance"):
            stmt = stmt.order_by(Embedding.vector.l2_distance(query_vector)).limit(limit)
        else:
            stmt = stmt.limit(limit)
        result = await db.execute(stmt)
        return list(result.scalars().all())

embedding_repo = EmbeddingRepository()
