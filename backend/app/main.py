import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.routers import auth, interns, tasks, task_library, email_templates, emails, assistant

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Intern Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(interns.router)
app.include_router(task_library.router)
app.include_router(tasks.router)
app.include_router(email_templates.router)
app.include_router(emails.router)
app.include_router(assistant.router)

frontend_build_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(frontend_build_path):
    app.mount("/", StaticFiles(directory=frontend_build_path, html=True), name="frontend")


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
