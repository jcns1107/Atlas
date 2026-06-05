"""Atlas application entry point.

Run it with:
    uvicorn backend.main:app --reload
or simply:
    python run.py

This wires up the API routers and serves the static frontend at `/`.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.api.routes import chat, models
from backend.config import DATA_DIR, FRONTEND_DIR


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: make sure the local data directories exist.
    for sub in ("agents", "characters", "memory", "skills"):
        (DATA_DIR / sub).mkdir(parents=True, exist_ok=True)
    yield
    # Shutdown: nothing to clean up yet.


app = FastAPI(title="Atlas", version="0.1.0", lifespan=lifespan)

# During development the frontend may be opened from a file or another port.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- API routes (each feature gets its own router under /api) ----
app.include_router(chat.router, prefix="/api")
app.include_router(models.router, prefix="/api")


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "atlas"}


# ---- Static frontend (served last so /api/* wins) ----
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    @app.get("/")
    async def index() -> FileResponse:
        return FileResponse(FRONTEND_DIR / "index.html")
