from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db, get_current_user
from app.repositories.settings_repo import settings_repo
from app.schemas.settings import UserSettingsRead, UserSettingsUpdate
from app.models.user import User

router = APIRouter(prefix="/users", tags=["User Settings"])

@router.get("/settings", response_model=UserSettingsRead)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    settings_obj = await settings_repo.get_by_user_id(db, current_user.id)
    if not settings_obj:
        settings_obj = await settings_repo.create(db, {"user_id": current_user.id})

    return UserSettingsRead(
        user_id=settings_obj.user_id,
        default_model=settings_obj.default_model,
        theme=settings_obj.theme,
        send_on_enter=settings_obj.send_on_enter,
        show_token_count=settings_obj.show_token_count,
        has_openai_key=bool(settings_obj.openai_api_key),
        has_anthropic_key=bool(settings_obj.anthropic_api_key),
        has_groq_key=bool(settings_obj.groq_api_key),
        ollama_base_url=settings_obj.ollama_base_url,
    )

@router.put("/settings", response_model=UserSettingsRead)
async def update_settings(
    payload: UserSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    settings_obj = await settings_repo.get_by_user_id(db, current_user.id)
    if not settings_obj:
        settings_obj = await settings_repo.create(db, {"user_id": current_user.id})

    updated = await settings_repo.update(db, settings_obj, payload.model_dump(exclude_unset=True))
    
    return UserSettingsRead(
        user_id=updated.user_id,
        default_model=updated.default_model,
        theme=updated.theme,
        send_on_enter=updated.send_on_enter,
        show_token_count=updated.show_token_count,
        has_openai_key=bool(updated.openai_api_key),
        has_anthropic_key=bool(updated.anthropic_api_key),
        has_groq_key=bool(updated.groq_api_key),
        ollama_base_url=updated.ollama_base_url,
    )
