import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import String, ForeignKey, DateTime, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from app.models.base import TimestampMixin, generate_uuid
import enum

class PlanType(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"

class OrgRole(str, enum.Enum):
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"

class Organization(Base, TimestampMixin):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan: Mapped[PlanType] = mapped_column(SQLEnum(PlanType), default=PlanType.FREE, nullable=False)

    # Relationships
    members: Mapped[List["OrgMember"]] = relationship("OrgMember", back_populates="organization", cascade="all, delete-orphan")

class OrgMember(Base):
    __tablename__ = "org_members"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=generate_uuid)
    org_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role: Mapped[OrgRole] = mapped_column(SQLEnum(OrgRole), default=OrgRole.MEMBER, nullable=False)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    __table_args__ = (
        UniqueConstraint("org_id", "user_id", name="uq_org_member"),
    )

    # Relationships
    organization: Mapped["Organization"] = relationship("Organization", back_populates="members")
