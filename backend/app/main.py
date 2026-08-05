from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1.router import api_v1_router
from app.providers.registry import registry
from app.providers.gemini_proxy import GeminiProxyProvider
from app.providers.openai_provider import OpenAIProvider
from app.providers.groq_provider import GroqProvider
from app.providers.ollama_provider import OllamaProvider

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Startup: Register AI providers
    registry.register(GeminiProxyProvider())
    
    if settings.OPENAI_API_KEY:
        registry.register(OpenAIProvider(settings.OPENAI_API_KEY))
    if settings.GROQ_API_KEY:
        registry.register(GroqProvider(settings.GROQ_API_KEY))
    if settings.OLLAMA_BASE_URL:
        registry.register(OllamaProvider(settings.OLLAMA_BASE_URL))

    print(f"✅ {settings.PROJECT_NAME} initialized with AI ProviderRegistry ready.")
    yield
    print("🛑 Shutting down backend service.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Healthcheck"])
async def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "providers_loaded": list(registry._providers.keys()),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
