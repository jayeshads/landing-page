"""
LeadPilot Backend — FastAPI application entry point.

Configures CORS, lifespan (MongoDB connect/disconnect), mounts all
routers, and provides a health-check endpoint.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.db.mongodb import connect_db, disconnect_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="LeadPilot API",
    description="AI-Powered Meta Ads Campaign Manager",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Global exception handler ───
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all so unhandled errors never leak raw stack traces to clients."""
    if settings.DEBUG:
        import traceback
        traceback.print_exc()

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# ─── Health check ───
@app.get("/api/health", tags=["system"])
async def health_check():
    return {"status": "ok", "service": "leadpilot-api", "version": "1.0.0"}


# ─── Mount routers ───
from app.routers.auth import router as auth_router  # noqa: E402
from app.routers.meta import router as meta_router  # noqa: E402
from app.routers.ai_chat import router as ai_chat_router  # noqa: E402
from app.routers.campaigns import router as campaigns_router  # noqa: E402
from app.routers.creatives import router as creatives_router  # noqa: E402
from app.routers.landing_pages import router as landing_pages_router, public_router as public_landing_router  # noqa: E402
from app.routers.admin import router as admin_router  # noqa: E402
from app.routers.plans import router as plans_router  # noqa: E402

app.include_router(auth_router, prefix="/api")
app.include_router(meta_router, prefix="/api")
app.include_router(ai_chat_router, prefix="/api")
app.include_router(campaigns_router, prefix="/api")
app.include_router(creatives_router, prefix="/api")
app.include_router(landing_pages_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(plans_router, prefix="/api")
app.include_router(public_landing_router)  # Public /l/{slug}
