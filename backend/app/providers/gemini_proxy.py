import json
import logging
import httpx
from typing import AsyncIterator, List
from app.providers.base import BaseProvider, ChatRequest, ChatChunk
from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiProxyProvider(BaseProvider):
    """
    Connects to gemini-web2api proxy endpoint.
    100% Free — reverse-engineers gemini.google.com via OpenAI-compatible endpoints.
    """

    @property
    def provider_id(self) -> str:
        return "gemini_proxy"

    @property
    def supported_models(self) -> List[str]:
        return [
            "gemini-3.6-flash",
            "gemini-3.5-flash",
            "gemini-3.5-flash-thinking",
            "gemini-3.5-flash-thinking@think=0",
            "gemini-3.5-flash-thinking@think=2",
            "gemini-3.5-flash-thinking@think=4",
            "gemini-3.5-flash-thinking-lite",
            "gemini-flash-lite",
            "gemini-3.1-pro",
            "gemini-auto",
        ]

    async def stream_chat(self, request: ChatRequest) -> AsyncIterator[ChatChunk]:
        payload = {
            "model": request.model,
            "messages": [{"role": m.role, "content": m.content} for m in request.messages],
            "stream": True,
            "temperature": request.temperature,
        }
        if request.max_tokens:
            payload["max_tokens"] = request.max_tokens
        if request.tools:
            payload["tools"] = request.tools

        url = f"{settings.GEMINI_PROXY_URL}/chat/completions"
        headers = {"Authorization": f"Bearer {settings.GEMINI_PROXY_KEY}"}

        try:
            async with httpx.AsyncClient(timeout=180) as client:
                async with client.stream("POST", url, json=payload, headers=headers) as resp:
                    if resp.status_code != 200:
                        body = await resp.aread()
                        error_text = body.decode(errors="replace")[:300]
                        logger.error(
                            "GeminiProxy HTTP %d for model=%s: %s",
                            resp.status_code, request.model, error_text,
                        )
                        yield ChatChunk(
                            delta=f"[Nexus AI Error] Gemini Proxy returned HTTP {resp.status_code}. "
                                  f"Check that the proxy service is running at {settings.GEMINI_PROXY_URL}."
                        )
                        return

                    async for line in resp.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        data = line[6:].strip()
                        if data == "[DONE]":
                            break
                        try:
                            chunk_data = json.loads(data)
                            choices = chunk_data.get("choices", [])
                            if choices:
                                delta_content = choices[0].get("delta", {}).get("content", "")
                                finish_reason = choices[0].get("finish_reason")
                                if delta_content:
                                    yield ChatChunk(delta=delta_content, finish_reason=finish_reason)
                        except json.JSONDecodeError:
                            pass  # Partial / malformed SSE chunk — safe to ignore

        except httpx.ConnectError:
            logger.error("GeminiProxy connection refused at %s", settings.GEMINI_PROXY_URL)
            yield ChatChunk(
                delta=f"[Nexus AI Error] Cannot connect to Gemini Proxy at {settings.GEMINI_PROXY_URL}. "
                      "Please ensure the gemini-web2api service is running."
            )
        except httpx.TimeoutException:
            logger.error("GeminiProxy request timed out for model=%s", request.model)
            yield ChatChunk(delta="[Nexus AI Error] The Gemini Proxy request timed out. Please try again.")
        except Exception as exc:
            logger.exception("Unexpected GeminiProxy error for model=%s", request.model)
            yield ChatChunk(delta=f"[Nexus AI Error] Unexpected provider error: {type(exc).__name__}")

    async def chat(self, request: ChatRequest) -> str:
        chunks = []
        async for chunk in self.stream_chat(request):
            chunks.append(chunk.delta)
        return "".join(chunks)
