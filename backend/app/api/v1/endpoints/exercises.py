from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.base import get_db

router = APIRouter()


@router.get("/")
async def get_exercises(db: Session = Depends(get_db)):
    """Get all exercises"""
    # TODO: Implement actual database query
    return []


@router.get("/{exercise_id}")
async def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    """Get a specific exercise by ID"""
    # TODO: Implement actual database query
    raise HTTPException(status_code=404, detail="Exercise not found") 