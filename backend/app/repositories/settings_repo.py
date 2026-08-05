import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user_settings import UserSettings
from app.repositories.base_repo import BaseRepository
from app.utils.encryption import encrypt_value, decrypt_value

# Fields that must be encrypted before DB write and decrypted on read
_ENCRYPTED_FIELDS = {"openai_api_key", "anthropic_api_key", "groq_api_key"}


class UserSettingsRepository(BaseRepository[UserSettings]):
    def __init__(self):
        super().__init__(UserSettings)

    async def get_by_user_id(self, db: AsyncSession, user_id: uuid.UUID) -> Optional[UserSettings]:
        stmt = select(UserSettings).where(UserSettings.user_id == user_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, obj_in: dict) -> UserSettings:
        """Override to encrypt API keys before DB write."""
        encrypted = self._encrypt_keys(obj_in)
        return await super().create(db, encrypted)

    async def update(self, db: AsyncSession, db_obj: UserSettings, obj_in: dict) -> UserSettings:
        """Override to encrypt API keys before DB write.

        Supports setting a field to None (explicitly clearing it) by accepting
        the key in the dict with a None value — unlike base_repo which skips None.
        """
        encrypted = self._encrypt_keys(obj_in)
        for field, value in encrypted.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    def get_decrypted_key(self, settings_obj: UserSettings, field: str) -> Optional[str]:
        """Return the decrypted plaintext value of an encrypted API key field."""
        raw = getattr(settings_obj, field, None)
        if raw is None:
            return None
        return decrypt_value(raw)

    # ──────────────────────────────────────────────────────────────────────────
    # Internal helpers
    # ──────────────────────────────────────────────────────────────────────────

    @staticmethod
    def _encrypt_keys(data: dict) -> dict:
        """Return a copy of *data* with API key fields encrypted."""
        result = dict(data)
        for field in _ENCRYPTED_FIELDS:
            if field in result and result[field] is not None:
                result[field] = encrypt_value(str(result[field]).strip())
        return result


settings_repo = UserSettingsRepository()
