from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.chat import router as chat_router
from app.api.v1.projects import router as projects_router
from app.api.v1.files import router as files_router
from app.api.v1.agents import router as agents_router
from app.api.v1.users import router as users_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(chat_router)
api_v1_router.include_router(projects_router)
api_v1_router.include_router(files_router)
api_v1_router.include_router(agents_router)
api_v1_router.include_router(users_router)
