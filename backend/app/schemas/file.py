import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from app.models.file import FileStatus

class FileRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    filename: str
    storage_key: str
    mime_type: str
    size_bytes: int
    status: FileStatus
    chunk_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class FileUploadResponse(BaseModel):
    id: uuid.UUID
    filename: str
    status: FileStatus
    message: str
