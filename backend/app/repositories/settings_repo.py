import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user_settings import UserSettings
from app.repositories.base_repo import BaseRepository

class UserSettingsRepository(BaseRepository[UserSettings]):
    def __init__(self):
        super().__init__(UserSettings)

    async def get_by_user_id(self, db: AsyncSession, user_id: uuid.UUID) -> Optional[UserSettings]:
        stmt = select(UserSettings).where(UserSettings.user_id == user_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

settings_repo = UserSettingsRepository()
