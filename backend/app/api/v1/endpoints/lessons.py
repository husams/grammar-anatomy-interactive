from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.base import get_db

router = APIRouter()


@router.get("/")
async def get_lessons(db: Session = Depends(get_db)):
    """Get all lessons"""
    # TODO: Implement actual database query
    return []


@router.get("/{lesson_id}")
async def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    """Get a specific lesson by ID"""
    # TODO: Implement actual database query
    raise HTTPException(status_code=404, detail="Lesson not found") 