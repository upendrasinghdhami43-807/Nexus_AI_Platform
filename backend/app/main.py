import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.api.v1.router import api_v1_router
from app.providers.registry import registry
from app.providers.gemini_proxy import GeminiProxyProvider
from app.providers.openai_provider import OpenAIProvider
from app.providers.groq_provider import GroqProvider
from app.providers.ollama_provider import OllamaProvider

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──────────────────────────────────────────────────────────────
    logger.info("🚀 Starting %s v%s", settings.PROJECT_NAME, settings.VERSION)

    # 1. Verify DB connectivity
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        logger.info("✅ Database connection verified.")
    except Exception as exc:
        logger.critical("❌ Database connection FAILED: %s", exc)
        # Do not raise — let the app start so health endpoint can report the error

    # 2. Register AI providers
    registry.register(GeminiProxyProvider())
    logger.info("  ↳ Registered provider: gemini_proxy")

    if settings.OPENAI_API_KEY:
        registry.register(OpenAIProvider(settings.OPENAI_API_KEY))
        logger.info("  ↳ Registered provider: openai")
    if settings.GROQ_API_KEY:
        registry.register(GroqProvider(settings.GROQ_API_KEY))
        logger.info("  ↳ Registered provider: groq")
    if settings.OLLAMA_BASE_URL:
        registry.register(OllamaProvider(settings.OLLAMA_BASE_URL))
        logger.info("  ↳ Registered provider: ollama")

    logger.info("✅ ProviderRegistry ready with %d provider(s).", len(registry._providers))
    yield
    # ── Shutdown ─────────────────────────────────────────────────────────────
    logger.info("🛑 Shutting down %s.", settings.PROJECT_NAME)


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
# NOTE: allow_origins=["*"] with allow_credentials=True is rejected by browsers.
# Use an explicit list from settings.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    expose_headers=["X-Request-Id"],
)

# ── Global Exception Handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception on %s %s", request.method, request.url)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": {"code": "INTERNAL_SERVER_ERROR", "message": "An unexpected error occurred."}},
    )

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], include_in_schema=True)
async def health_check():
    db_ok = False
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        pass

    return {
        "status": "online" if db_ok else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "ok" if db_ok else "unreachable",
        "providers_loaded": list(registry._providers.keys()),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
