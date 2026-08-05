import json
import logging
import httpx
from typing import AsyncIterator, List, Optional
from app.providers.base import BaseProvider, ChatRequest, ChatChunk
from app.core.config import settings

logger = logging.getLogger(__name__)

_GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


class GroqProvider(BaseProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GROQ_API_KEY

    @property
    def provider_id(self) -> str:
        return "groq"

    @property
    def supported_models(self) -> List[str]:
        return [
            "llama-3.1-70b-versatile",
            "llama-3.1-8b-instant",
            "llama3-70b-8192",
            "mixtral-8x7b-32768",
            "gemma2-9b-it",
        ]

    def is_configured(self) -> bool:
        return bool(self.api_key)

    async def stream_chat(self, request: ChatRequest) -> AsyncIterator[ChatChunk]:
        if not self.api_key:
            yield ChatChunk(delta="[Groq Error] API key is not configured. Add it in Settings.")
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
                async with client.stream("POST", _GROQ_API_URL, json=payload, headers=headers) as resp:
                    if resp.status_code != 200:
                        body = await resp.aread()
                        try:
                            err = json.loads(body).get("error", {})
                            message = err.get("message", "Unknown Groq error")
                        except Exception:
                            message = body.decode(errors="replace")[:300]
                        logger.error("Groq HTTP %d: %s", resp.status_code, message)
                        yield ChatChunk(delta=f"[Groq Error {resp.status_code}] {message}")
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
            logger.error("Groq connection failed")
            yield ChatChunk(delta="[Groq Error] Cannot reach api.groq.com. Check network connectivity.")
        except httpx.TimeoutException:
            logger.error("Groq request timed out for model=%s", request.model)
            yield ChatChunk(delta="[Groq Error] Request timed out. Please try again.")
        except Exception as exc:
            logger.exception("Unexpected Groq error for model=%s", request.model)
            yield ChatChunk(delta=f"[Groq Error] Unexpected error: {type(exc).__name__}")

    async def chat(self, request: ChatRequest) -> str:
        chunks = []
        async for chunk in self.stream_chat(request):
            chunks.append(chunk.delta)
        return "".join(chunks)
