from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db, get_current_user, get_provider_registry
from app.services.agent_service import agent_service
from app.schemas.agent import AgentRunPayload, AgentRunResult
from app.providers.registry import ProviderRegistry
from app.models.user import User

router = APIRouter(prefix="/agents", tags=["Autonomous AI Agents"])


@router.post("/run", response_model=AgentRunResult)
async def run_agent(
    payload: AgentRunPayload,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    registry: ProviderRegistry = Depends(get_provider_registry),
):
    """Run an autonomous agent task. Returns the response and reasoning steps."""
    return await agent_service.run_agent(db, current_user, payload.prompt, payload.model, registry)
