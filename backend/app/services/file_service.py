import os
import re
import uuid
import logging
from typing import List, Optional, Set
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, UploadFile
from app.repositories.file_repo import file_repo
from app.models.file import FileStatus
from app.schemas.file import FileRead, FileUploadResponse
from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────

ALLOWED_MIME_TYPES: Set[str] = {
    # Documents
    "text/plain",
    "text/csv",
    "text/markdown",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    # Images
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    # Code / data
    "application/json",
    "application/xml",
    "text/html",
    "text/xml",
    "text/x-python",
    "text/javascript",
    "application/javascript",
    "text/typescript",
}

# Dangerous extensions regardless of MIME (double-check)
_BLOCKED_EXTENSIONS: Set[str] = {
    ".exe", ".bat", ".sh", ".cmd", ".ps1", ".msi", ".dll",
    ".so", ".bin", ".elf", ".dmg", ".app", ".apk",
}

_SAFE_FILENAME_RE = re.compile(r"[^\w.\- ]")


def _sanitize_filename(filename: str) -> str:
    """
    Strip directory traversal components and dangerous characters from the filename.
    Keeps alphanumeric, dots, dashes, underscores, and spaces.
    """
    # Strip path components (e.g. "../../etc/passwd")
    name = os.path.basename(filename)
    # Replace dangerous characters
    name = _SAFE_FILENAME_RE.sub("_", name)
    # Collapse multiple underscores/dots
    name = re.sub(r"\.{2,}", ".", name).strip()
    return name or "upload"


class FileService:
    async def upload_file(
        self,
        db: AsyncSession,
        user_id: uuid.UUID,
        file: UploadFile,
        project_id: Optional[uuid.UUID] = None,
    ) -> FileUploadResponse:
        original_name = file.filename or "unnamed"
        safe_name = _sanitize_filename(original_name)

        # ── Extension check ───────────────────────────────────────────────────
        ext = os.path.splitext(safe_name)[1].lower()
        if ext in _BLOCKED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"File type '{ext}' is not permitted.",
            )

        # ── MIME type check ───────────────────────────────────────────────────
        mime = file.content_type or "application/octet-stream"
        if mime not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"MIME type '{mime}' is not supported. Allowed types include PDF, DOCX, images, and plain text.",
            )

        # ── Read content + size check ─────────────────────────────────────────
        content = await file.read()
        size = len(content)
        if size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file is empty.",
            )
        if size > settings.MAX_FILE_SIZE_BYTES:
            max_mb = settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds the {max_mb} MB size limit.",
            )

        # ── Build storage key ─────────────────────────────────────────────────
        # Use UUID-prefixed path to prevent collisions; never use raw user filename
        storage_key = f"files/{user_id}/{uuid.uuid4()}_{safe_name}"

        # ── Persist metadata ──────────────────────────────────────────────────
        # TODO: upload *content* to MinIO/S3 here using the storage_key
        file_obj = await file_repo.create(db, {
            "user_id": user_id,
            "project_id": project_id,
            "filename": safe_name,
            "storage_key": storage_key,
            "mime_type": mime,
            "size_bytes": size,
            "status": FileStatus.READY,
            "chunk_count": max(1, size // 1000),
        })

        logger.info("File uploaded: user=%s file=%s size=%d mime=%s", user_id, safe_name, size, mime)

        return FileUploadResponse(
            id=file_obj.id,
            filename=file_obj.filename,
            status=file_obj.status,
            message="File uploaded successfully and queued for RAG indexing.",
        )

    async def get_user_files(self, db: AsyncSession, user_id: uuid.UUID) -> List[FileRead]:
        files = await file_repo.get_by_user(db, user_id)
        return [FileRead.model_validate(f) for f in files]


file_service = FileService()
