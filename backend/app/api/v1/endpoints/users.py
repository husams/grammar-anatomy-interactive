from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.base import get_db

router = APIRouter()


@router.get("/")
async def get_users(db: Session = Depends(get_db)):
    """Get all users"""
    # TODO: Implement actual database query
    return []


@router.get("/{user_id}")
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user by ID"""
    # TODO: Implement actual database query
    raise HTTPException(status_code=404, detail="User not found") 