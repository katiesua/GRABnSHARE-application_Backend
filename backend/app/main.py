"""Re-export the FastAPI application instance as app.main.app.

Top-level `main` resolves to backend/main.py because the Vercel entrypoint
(<repo-root>/api/index.py) inserts the `backend` folder into sys.path.
"""
from main import app

__all__ = ["app"]
