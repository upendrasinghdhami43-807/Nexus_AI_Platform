import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.models.message import MessageRole


class ChatMessageSchema(BaseModel):
    role: str
    content: str


class ChatStreamRequest(BaseModel):
    conversation_id: Optional[uuid.UUID] = None
    message: str = Field(..., min_length=1, max_length=32_000, description="User message text")
    model: str = Field(default="gemini-3.5-flash", max_length=100)
    web_search: bool = False
    project_id: Optional[uuid.UUID] = None


class ConversationCreate(BaseModel):
    title: Optional[str] = Field(default="New Conversation", max_length=200)
    model: str = Field(default="gemini-3.5-flash", max_length=100)
    project_id: Optional[uuid.UUID] = None


class ConversationUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    is_pinned: Optional[bool] = None
    is_archived: Optional[bool] = None


class ConversationRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    title: str
    model: str
    is_pinned: bool
    is_archived: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MessageRead(BaseModel):
    id: uuid.UUID
    conversation_id: uuid.UUID
    role: MessageRole
    content: str
    model: Optional[str] = None
    tool_calls: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True
