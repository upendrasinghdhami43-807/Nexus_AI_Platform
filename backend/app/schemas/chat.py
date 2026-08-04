import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.models.message import MessageRole

class ChatMessageSchema(BaseModel):
    role: str
    content: str

class ChatStreamRequest(BaseModel):
    conversation_id: Optional[uuid.UUID] = None
    message: str
    model: str = "gemini-3.5-flash"
    web_search: bool = False
    project_id: Optional[uuid.UUID] = None

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

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    model: str = "gemini-3.5-flash"
    project_id: Optional[uuid.UUID] = None

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
