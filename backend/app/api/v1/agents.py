from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db, get_current_user, get_provider_registry
from app.services.agent_service import agent_service
from app.providers.registry import ProviderRegistry
from app.models.user import User
from pydantic import BaseModel

class AgentRunPayload(BaseModel):
    prompt: str
    model: str = "gemini-3.5-flash"

router = APIRouter(prefix="/agents", tags=["Autonomous AI Agents"])

@router.post("/run")
async def run_agent(
    payload: AgentRunPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    registry: ProviderRegistry = Depends(get_provider_registry),
):
    return await agent_service.run_agent(db, payload.prompt, payload.model, registry)
