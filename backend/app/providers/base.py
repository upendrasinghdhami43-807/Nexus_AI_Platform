from abc import ABC, abstractmethod
from typing import AsyncIterator, List, Dict, Any, Optional
from dataclasses import dataclass, field

@dataclass
class ChatMessage:
    role: str           # "system" | "user" | "assistant" | "tool"
    content: str

@dataclass
class ChatRequest:
    messages: List[ChatMessage]
    model: str
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    tools: Optional[List[Dict[str, Any]]] = None

@dataclass
class ChatChunk:
    delta: str
    finish_reason: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None

class BaseProvider(ABC):
    """Abstract interface for all AI provider implementations."""
    
    @property
    @abstractmethod
    def provider_id(self) -> str:
        """Unique provider identifier (e.g., 'gemini_proxy', 'openai', 'ollama')."""
        pass
    
    @property
    @abstractmethod
    def supported_models(self) -> List[str]:
        """List of model IDs supported by this provider."""
        pass

    @abstractmethod
    async def stream_chat(self, request: ChatRequest) -> AsyncIterator[ChatChunk]:
        """Stream response chunk by chunk."""
        pass

    @abstractmethod
    async def chat(self, request: ChatRequest) -> str:
        """Non-streaming response."""
        pass

    def is_configured(self) -> bool:
        """Returns True if provider credentials or endpoints are ready."""
        return True
