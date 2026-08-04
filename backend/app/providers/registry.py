from typing import AsyncIterator, Dict, Optional
from app.providers.base import BaseProvider, ChatRequest, ChatChunk

class ProviderRegistry:
    def __init__(self):
        self._providers: Dict[str, BaseProvider] = {}
        self._model_map: Dict[str, str] = {}  # model_id -> provider_id

    def register(self, provider: BaseProvider):
        self._providers[provider.provider_id] = provider
        for model in provider.supported_models:
            self._model_map[model] = provider.provider_id

    def get_provider_for_model(self, model_id: str) -> BaseProvider:
        provider_id = self._model_map.get(model_id)
        if not provider_id:
            # Fallback to gemini_proxy if model is unregistered
            fallback = self._providers.get("gemini_proxy")
            if fallback:
                return fallback
            raise ValueError(f"No provider registered for model: {model_id}")
        
        provider = self._providers[provider_id]
        if not provider.is_configured():
            fallback = self._providers.get("gemini_proxy")
            if fallback:
                return fallback
        return provider

    async def stream_chat(self, model_id: str, request: ChatRequest) -> AsyncIterator[ChatChunk]:
        provider = self.get_provider_for_model(model_id)
        async for chunk in provider.stream_chat(request):
            yield chunk

    async def chat(self, model_id: str, request: ChatRequest) -> str:
        provider = self.get_provider_for_model(model_id)
        return await provider.chat(request)

registry = ProviderRegistry()
