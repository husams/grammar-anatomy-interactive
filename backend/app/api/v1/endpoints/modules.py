from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db

router = APIRouter()


@router.get("/")
async def get_modules(db: Session = Depends(get_db)):
    """Get all modules"""
    # TODO: Implement actual database query
    return [
        {
            "id": 1,
            "title": "Subjects and Predicates",
            "description": "Learn about sentence structure",
            "order": 1,
            "is_completed": False
        },
        {
            "id": 2,
            "title": "Nouns and Verbs",
            "description": "Understanding parts of speech",
            "order": 2,
            "is_completed": False
        }
    ]


@router.get("/{module_id}")
async def get_module(module_id: int, db: Session = Depends(get_db)):
    """Get a specific module by ID"""
    # TODO: Implement actual database query
    if module_id == 1:
        return {
            "id": 1,
            "title": "Subjects and Predicates",
            "description": "Learn about sentence structure",
            "order": 1,
            "is_completed": False,
            "lessons": []
        }
    raise HTTPException(status_code=404, detail="Module not found") 