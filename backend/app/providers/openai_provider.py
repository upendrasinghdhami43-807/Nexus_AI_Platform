import json
import httpx
from typing import AsyncIterator, List, Optional
from app.providers.base import BaseProvider, ChatRequest, ChatChunk
from app.core.config import settings

class OpenAIProvider(BaseProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY

    @property
    def provider_id(self) -> str:
        return "openai"

    @property
    def supported_models(self) -> List[str]:
        return ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1", "o1-mini", "o3-mini"]

    def is_configured(self) -> bool:
        return bool(self.api_key)

    async def stream_chat(self, request: ChatRequest) -> AsyncIterator[ChatChunk]:
        if not self.api_key:
            yield ChatChunk(delta="Error: OpenAI API key is not configured.")
            return

        payload = {
            "model": request.model,
            "messages": [{"role": m.role, "content": m.content} for m in request.messages],
            "stream": True,
            "temperature": request.temperature,
        }
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        async with httpx.AsyncClient(timeout=120) as client:
            async with client.stream("POST", "https://api.openai.com/v1/chat/completions", json=payload, headers=headers) as resp:
                async for line in resp.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:].strip()
                        if data == "[DONE]":
                            break
                        try:
                            chunk_data = json.loads(data)
                            delta = chunk_data["choices"][0].get("delta", {}).get("content", "")
                            yield ChatChunk(delta=delta)
                        except Exception:
                            pass

    async def chat(self, request: ChatRequest) -> str:
        chunks = []
        async for chunk in self.stream_chat(request):
            chunks.append(chunk.delta)
        return "".join(chunks)
