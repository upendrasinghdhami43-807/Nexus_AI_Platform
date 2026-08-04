import uuid
from typing import Optional, List
from sqlalchemy import String, Boolean, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid
import enum

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"

class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    oauth_provider: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    oauth_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    settings: Mapped[Optional["UserSettings"]] = relationship("UserSettings", back_populates="user", uselist=False, cascade="all, delete-orphan")
    conversations: Mapped[List["Conversation"]] = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    projects: Mapped[List["Project"]] = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    files: Mapped[List["FileModel"]] = relationship("FileModel", back_populates="user", cascade="all, delete-orphan")
