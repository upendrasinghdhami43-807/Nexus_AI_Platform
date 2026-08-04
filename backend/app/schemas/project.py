import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    default_model: str = "gemini-3.5-flash"

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    default_model: Optional[str] = None
    is_archived: Optional[bool] = None

class ProjectRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    org_id: Optional[uuid.UUID] = None
    name: str
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    default_model: str
    is_archived: bool
    created_at: datetime

    class Config:
        from_attributes = True
