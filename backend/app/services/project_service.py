import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from app.repositories.project_repo import project_repo
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectRead

class ProjectService:
    async def create_project(self, db: AsyncSession, user_id: uuid.UUID, data: ProjectCreate) -> ProjectRead:
        project_dict = data.model_dump()
        project_dict["user_id"] = user_id
        project = await project_repo.create(db, project_dict)
        return ProjectRead.model_validate(project)

    async def get_user_projects(self, db: AsyncSession, user_id: uuid.UUID) -> List[ProjectRead]:
        projects = await project_repo.get_by_user(db, user_id)
        return [ProjectRead.model_validate(p) for p in projects]

    async def get_project(self, db: AsyncSession, project_id: uuid.UUID, user_id: uuid.UUID) -> ProjectRead:
        project = await project_repo.get_by_id(db, project_id)
        if not project or project.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
        return ProjectRead.model_validate(project)

    async def update_project(self, db: AsyncSession, project_id: uuid.UUID, user_id: uuid.UUID, data: ProjectUpdate) -> ProjectRead:
        project = await project_repo.get_by_id(db, project_id)
        if not project or project.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
        
        updated = await project_repo.update(db, project, data.model_dump(exclude_unset=True))
        return ProjectRead.model_validate(updated)

    async def delete_project(self, db: AsyncSession, project_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        project = await project_repo.get_by_id(db, project_id)
        if not project or project.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found.")
        return await project_repo.delete(db, project_id)

project_service = ProjectService()
