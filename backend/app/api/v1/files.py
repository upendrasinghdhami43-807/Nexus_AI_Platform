import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db, get_current_user
from app.services.file_service import file_service
from app.schemas.file import FileRead, FileUploadResponse
from app.models.user import User

router = APIRouter(prefix="/files", tags=["File Storage & RAG"])

@router.post("/upload", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    project_id: Optional[uuid.UUID] = Form(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await file_service.upload_file(db, current_user.id, file, project_id)

@router.get("", response_model=List[FileRead])
async def list_files(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await file_service.get_user_files(db, current_user.id)
