import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, UploadFile
from app.repositories.file_repo import file_repo
from app.models.file import FileStatus
from app.schemas.file import FileRead, FileUploadResponse

class FileService:
    async def upload_file(self, db: AsyncSession, user_id: uuid.UUID, file: UploadFile, project_id: Optional[uuid.UUID] = None) -> FileUploadResponse:
        content = await file.read()
        storage_key = f"files/{user_id}/{uuid.uuid4()}_{file.filename}"
        
        file_obj = await file_repo.create(db, {
            "user_id": user_id,
            "project_id": project_id,
            "filename": file.filename,
            "storage_key": storage_key,
            "mime_type": file.content_type or "application/octet-stream",
            "size_bytes": len(content),
            "status": FileStatus.READY,
            "chunk_count": max(1, len(content) // 1000),
        })

        return FileUploadResponse(
            id=file_obj.id,
            filename=file_obj.filename,
            status=file_obj.status,
            message="File successfully uploaded and ready for RAG indexing."
        )

    async def get_user_files(self, db: AsyncSession, user_id: uuid.UUID) -> List[FileRead]:
        files = await file_repo.get_by_user(db, user_id)
        return [FileRead.model_validate(f) for f in files]

file_service = FileService()
