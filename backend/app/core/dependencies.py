from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.utils.jwt import decode_access_token
from app.repositories.user_repo import user_repo
from app.models.user import User
from app.providers.registry import registry, ProviderRegistry
import uuid

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not token:
        # Development fallback / guest mode for testing
        guest_user = await user_repo.get_by_email(db, "developer@nexus.ai")
        if not guest_user:
            guest_user = await user_repo.create(db, {
                "email": "developer@nexus.ai",
                "full_name": "Bipin singh Dhami",
                "role": "user",
                "is_active": True,
                "is_verified": True,
            })
        return guest_user

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user_id = uuid.UUID(payload["sub"])
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user ID format in token")

    user = await user_repo.get_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account is inactive or not found")
    
    return user

def get_provider_registry() -> ProviderRegistry:
    return registry
