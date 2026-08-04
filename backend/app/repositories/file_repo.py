import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.file import FileModel
from app.repositories.base_repo import BaseRepository

class FileRepository(BaseRepository[FileModel]):
    def __init__(self):
        super().__init__(FileModel)

    async def get_by_user(self, db: AsyncSession, user_id: uuid.UUID) -> List[FileModel]:
        stmt = select(FileModel).where(FileModel.user_id == user_id).order_by(desc(FileModel.created_at))
        result = await db.execute(stmt)
        return list(result.scalars().all())

file_repo = FileRepository()
