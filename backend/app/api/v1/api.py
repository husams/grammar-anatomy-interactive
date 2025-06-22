from fastapi import APIRouter
from app.api.v1.endpoints import modules, lessons, exercises, users, progress

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(modules.router, prefix="/modules", tags=["modules"])
api_router.include_router(lessons.router, prefix="/lessons", tags=["lessons"])
api_router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"]) 