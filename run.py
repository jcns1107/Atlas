"""Convenience launcher so you can just `python run.py`.

Equivalent to: uvicorn backend.main:app --reload
"""

import uvicorn

from backend.config import settings

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host=settings.atlas_host,
        port=settings.atlas_port,
        reload=settings.atlas_reload,
    )
