import json
import logging
import httpx
from typing import AsyncIterator, List, Optional
from app.providers.base import BaseProvider, ChatRequest, ChatChunk
from app.core.config import settings

logger = logging.getLogger(__name__)

_OPENAI_API_URL = "https://api.openai.com/v1/chat/completions"


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
            yield ChatChunk(delta="[OpenAI Error] API key is not configured. Add it in Settings.")
            return

        payload = {
            "model": request.model,
            "messages": [{"role": m.role, "content": m.content} for m in request.messages],
            "stream": True,
            "temperature": request.temperature,
        }
        if request.max_tokens:
            payload["max_tokens"] = request.max_tokens

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=120) as client:
                async with client.stream("POST", _OPENAI_API_URL, json=payload, headers=headers) as resp:
                    if resp.status_code != 200:
                        body = await resp.aread()
                        try:
                            err = json.loads(body).get("error", {})
                            message = err.get("message", "Unknown OpenAI error")
                        except Exception:
                            message = body.decode(errors="replace")[:300]
                        logger.error("OpenAI HTTP %d: %s", resp.status_code, message)
                        yield ChatChunk(delta=f"[OpenAI Error {resp.status_code}] {message}")
                        return

                    async for line in resp.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        data = line[6:].strip()
                        if data == "[DONE]":
                            break
                        try:
                            chunk_data = json.loads(data)
                            delta = chunk_data["choices"][0].get("delta", {}).get("content", "")
                            finish_reason = chunk_data["choices"][0].get("finish_reason")
                            if delta:
                                yield ChatChunk(delta=delta, finish_reason=finish_reason)
                        except (json.JSONDecodeError, KeyError, IndexError):
                            pass

        except httpx.ConnectError:
            logger.error("OpenAI connection failed")
            yield ChatChunk(delta="[OpenAI Error] Cannot reach api.openai.com. Check network connectivity.")
        except httpx.TimeoutException:
            logger.error("OpenAI request timed out for model=%s", request.model)
            yield ChatChunk(delta="[OpenAI Error] Request timed out. The model may be overloaded.")
        except Exception as exc:
            logger.exception("Unexpected OpenAI error for model=%s", request.model)
            yield ChatChunk(delta=f"[OpenAI Error] Unexpected error: {type(exc).__name__}")

    async def chat(self, request: ChatRequest) -> str:
        chunks = []
        async for chunk in self.stream_chat(request):
            chunks.append(chunk.delta)
        return "".join(chunks)
