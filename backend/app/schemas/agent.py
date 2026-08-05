from pydantic import BaseModel, Field
from typing import Optional


class AgentRunPayload(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=16_000, description="Task prompt for the agent")
    model: str = Field(default="gemini-3.5-flash", max_length=100)


class AgentStepResult(BaseModel):
    step: int
    action: str
    status: str
    detail: Optional[str] = None


class AgentRunResult(BaseModel):
    prompt: str
    response: str
    agent_steps: list[AgentStepResult]
    model_used: str
