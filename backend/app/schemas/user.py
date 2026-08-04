import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models.user import UserRole

class UserRead(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
