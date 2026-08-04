import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.models.project import Project
from app.repositories.base_repo import BaseRepository

class ProjectRepository(BaseRepository[Project]):
    def __init__(self):
        super().__init__(Project)

    async def get_by_user(self, db: AsyncSession, user_id: uuid.UUID) -> List[Project]:
        stmt = (
            select(Project)
            .where(Project.user_id == user_id, Project.is_archived == False)
            .order_by(desc(Project.created_at))
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

project_repo = ProjectRepository()
