import json
import httpx
from typing import AsyncIterator, List, Optional
from app.providers.base import BaseProvider, ChatRequest, ChatChunk
from app.core.config import settings

class OllamaProvider(BaseProvider):
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = base_url or settings.OLLAMA_BASE_URL or "http://localhost:11434"

    @property
    def provider_id(self) -> str:
        return "ollama"

    @property
    def supported_models(self) -> List[str]:
        return ["llama3.2", "deepseek-r1:7b", "codellama:13b"]

    def is_configured(self) -> bool:
        return bool(self.base_url)

    async def stream_chat(self, request: ChatRequest) -> AsyncIterator[ChatChunk]:
        payload = {
            "model": request.model,
            "messages": [{"role": m.role, "content": m.content} for m in request.messages],
            "stream": True,
        }

        try:
            async with httpx.AsyncClient(timeout=180) as client:
                async with client.stream("POST", f"{self.base_url}/api/chat", json=payload) as resp:
                    async for line in resp.aiter_lines():
                        if line:
                            try:
                                chunk_data = json.loads(line)
                                delta = chunk_data.get("message", {}).get("content", "")
                                yield ChatChunk(delta=delta)
                            except Exception:
                                pass
        except Exception:
            yield ChatChunk(delta=f"Error connecting to local Ollama at {self.base_url}.")

    async def chat(self, request: ChatRequest) -> str:
        chunks = []
        async for chunk in self.stream_chat(request):
            chunks.append(chunk.delta)
        return "".join(chunks)
