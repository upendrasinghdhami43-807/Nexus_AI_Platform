import logging
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.providers.registry import ProviderRegistry
from app.providers.base import ChatRequest, ChatMessage
from app.models.user import User

logger = logging.getLogger(__name__)


class AgentService:
    async def run_agent(
        self,
        db: AsyncSession,
        user: User,
        prompt: str,
        model: str,
        registry: ProviderRegistry,
    ) -> Dict[str, Any]:
        logger.info("Agent run: user=%s model=%s prompt_len=%d", user.id, model, len(prompt))

        request = ChatRequest(
            messages=[
                ChatMessage(
                    role="system",
                    content=(
                        "You are Nexus AI Agent, an autonomous enterprise AI agent. "
                        "You are precise, structured, and helpful. "
                        "When given a task, reason step-by-step and provide a comprehensive response."
                    ),
                ),
                ChatMessage(role="user", content=prompt),
            ],
            model=model,
        )

        response_text = await registry.chat(model, request)

        return {
            "prompt": prompt,
            "response": response_text,
            "agent_steps": [
                {"step": 1, "action": "analyze_prompt", "status": "completed", "detail": f"Prompt length: {len(prompt)} chars"},
                {"step": 2, "action": "generate_response", "status": "completed", "detail": f"Model: {model}"},
            ],
            "model_used": model,
        }


agent_service = AgentService()
