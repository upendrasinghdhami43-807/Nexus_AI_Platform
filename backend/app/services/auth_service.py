from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.user_repo import user_repo
from app.repositories.settings_repo import settings_repo
from app.schemas.auth import UserRegister, UserLogin, Token
from app.schemas.user import UserRead
from app.utils.hashing import hash_password, verify_password
from app.utils.jwt import create_access_token
from app.models.user import User

class AuthService:
    async def register_user(self, db: AsyncSession, data: UserRegister) -> UserRead:
        existing = await user_repo.get_by_email(db, data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already registered."
            )

        hashed_pw = hash_password(data.password)
        user_dict = {
            "email": data.email,
            "hashed_password": hashed_pw,
            "full_name": data.full_name or data.email.split("@")[0],
            "role": "user",
            "is_active": True,
            "is_verified": True,
        }
        new_user = await user_repo.create(db, user_dict)
        
        # Create default user settings
        await settings_repo.create(db, {"user_id": new_user.id, "default_model": "gemini-3.5-flash"})
        return UserRead.model_validate(new_user)

    async def authenticate_user(self, db: AsyncSession, data: UserLogin) -> Token:
        user = await user_repo.get_by_email(db, data.email)
        if not user or not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials."
            )

        if not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials."
            )

        access_token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
        return Token(access_token=access_token, token_type="bearer")

auth_service = AuthService()
