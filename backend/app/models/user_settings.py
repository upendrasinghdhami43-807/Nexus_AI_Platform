import uuid
from typing import Optional
from sqlalchemy import String, Boolean, ForeignKey, Enum as SQLEnum, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import enum

class ThemeMode(str, enum.Enum):
    DARK = "dark"
    LIGHT = "light"
    SYSTEM = "system"

class UserSettings(Base):
    __tablename__ = "user_settings"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    default_model: Mapped[str] = mapped_column(String(100), default="gemini-3.5-flash", nullable=False)
    theme: Mapped[ThemeMode] = mapped_column(SQLEnum(ThemeMode), default=ThemeMode.DARK, nullable=False)
    openai_api_key: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    anthropic_api_key: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    groq_api_key: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ollama_base_url: Mapped[Optional[str]] = mapped_column(Text, default="http://localhost:11434", nullable=True)
    send_on_enter: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    show_token_count: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="settings")
