"""Bridge package exposing the GrabnShare FastAPI app as app.main.app.

The application itself lives in backend/main.py (flat module layout:
`from database import ...` / `import auth`). This package lets the Vercel
entrypoint api/index.py use `from app.main import app` while leaving
backend/main.py unchanged and sys.path pointed at the `backend` folder.
"""
