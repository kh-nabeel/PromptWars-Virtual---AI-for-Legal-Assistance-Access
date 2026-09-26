"""
Clarivo — FastAPI application entrypoint.

Registers all routers and applies:
    - CORS middleware (allows Vite dev server at localhost:5173)
    - Global exception handler (never leaks stack traces to clients)
    - Startup check for GEMINI_API_KEY presence
"""

from __future__ import annotations

import os
import sys

# Prevent protobuf from loading broken C-extension on Python 3.14
os.environ["PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION"] = "python"
sys.modules['google._upb._message'] = None

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import get_settings
from routers import upload, analysis, comparison, chat, export

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Clarivo API",
    description="AI-powered vendor agreement & NDA review — informational only, not legal advice.",
    version="1.0.0",
    # Hide detailed error info from OpenAPI docs in production
    docs_url="/api/docs",
    redoc_url=None,
)

# ---------------------------------------------------------------------------
# CORS — allow the Vite dev server and any local origin
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4173",  # Vite preview
        "http://127.0.0.1:5173",
        "https://clarivo-f337f.web.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Global error handler — never leak stack traces to the client
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    # Log the real error server-side
    logger.error("Unhandled exception on %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again."},
    )

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(analysis.router, prefix="/api", tags=["analysis"])
app.include_router(comparison.router, prefix="/api", tags=["comparison"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(export.router, prefix="/api", tags=["export"])


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup_event() -> None:
    settings = get_settings()
    if not settings.has_api_key():
        logger.warning(
            "GEMINI_API_KEY is not set. LLM features will fail. "
            "Copy .env.example to .env and add your key."
        )
    else:
        # Log only that the key is present — never its value
        logger.info("GEMINI_API_KEY is set. LLM features are enabled.")


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "service": "Clarivo"}
