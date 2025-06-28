from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models.lesson import Lesson
from app.models.module import Module
from app.models.exercise import Exercise
from app.schemas.lesson import LessonCreate, LessonUpdate, LessonResponse
from app.api.deps import get_current_active_user
from app.models.user import User
import uuid

router = APIRouter()


@router.get("/", response_model=List[LessonResponse])
async def get_lessons(
    module_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all lessons, optionally filtered by module_id."""
    query = db.query(Lesson)
    
    if module_id:
        try:
            module_uuid = uuid.UUID(module_id)
            # Verify module exists
            module = db.query(Module).filter(Module.id == module_uuid).first()
            if not module:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Module not found"
                )
            query = query.filter(Lesson.module_id == module_uuid)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid module ID format"
            )
    
    lessons = query.order_by(Lesson.order).all()
    
    # Add exercise count to each lesson
    result = []
    for lesson in lessons:
        # Simple count without accessing specific columns
        from sqlalchemy import func
        exercise_count = db.query(func.count(Exercise.id)).filter(Exercise.lesson_id == lesson.id).scalar()
        lesson_dict = {
            "id": lesson.id,
            "module_id": lesson.module_id,
            "title": lesson.title,
            "content": lesson.content,
            "order": lesson.order,
            "created_at": lesson.created_at,
            "exercise_count": exercise_count or 0
        }
        result.append(LessonResponse(**lesson_dict))
    
    return result


@router.get("/{lesson_id}", response_model=LessonResponse)
async def get_lesson(
    lesson_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific lesson by ID."""
    try:
        lesson_uuid = uuid.UUID(lesson_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lesson ID format"
        )
    
    lesson = db.query(Lesson).filter(Lesson.id == lesson_uuid).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    # Add exercise count
    try:
        from sqlalchemy import func
        exercise_count = db.query(func.count(Exercise.id)).filter(Exercise.lesson_id == lesson.id).scalar()
        lesson_dict = {
            "id": lesson.id,
            "module_id": lesson.module_id,
            "title": lesson.title,
            "content": lesson.content,
            "order": lesson.order,
            "created_at": lesson.created_at,
            "exercise_count": exercise_count or 0
        }
        
        return LessonResponse(**lesson_dict)
    except Exception as e:
        print(f"Error creating lesson response: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing lesson: {str(e)}"
        )


@router.post("/", response_model=LessonResponse, status_code=status.HTTP_201_CREATED)
async def create_lesson(
    lesson: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new lesson (admin only)."""
    # TODO: Add admin role check
    
    # Verify module exists
    module = db.query(Module).filter(Module.id == lesson.module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found"
        )
    
    # Check if lesson with same order in this module already exists
    existing_lesson = db.query(Lesson).filter(
        Lesson.module_id == lesson.module_id,
        Lesson.order == lesson.order
    ).first()
    if existing_lesson:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Lesson with order {lesson.order} already exists in this module"
        )
    
    db_lesson = Lesson(
        title=lesson.title,
        content=lesson.content,
        order=lesson.order,
        module_id=lesson.module_id
    )
    
    try:
        db.add(db_lesson)
        db.commit()
        db.refresh(db_lesson)
        return LessonResponse.model_validate(db_lesson)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create lesson"
        )


@router.put("/{lesson_id}", response_model=LessonResponse)
async def update_lesson(
    lesson_id: str,
    lesson_update: LessonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a lesson (admin only)."""
    # TODO: Add admin role check
    
    try:
        lesson_uuid = uuid.UUID(lesson_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lesson ID format"
        )
    
    db_lesson = db.query(Lesson).filter(Lesson.id == lesson_uuid).first()
    if not db_lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    # Check if new order conflicts with existing lesson in same module
    if lesson_update.order is not None and lesson_update.order != db_lesson.order:
        existing_lesson = db.query(Lesson).filter(
            Lesson.module_id == db_lesson.module_id,
            Lesson.order == lesson_update.order,
            Lesson.id != lesson_uuid
        ).first()
        if existing_lesson:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Lesson with order {lesson_update.order} already exists in this module"
            )
    
    # Update fields
    update_data = lesson_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_lesson, field, value)
    
    try:
        db.commit()
        db.refresh(db_lesson)
        return LessonResponse.model_validate(db_lesson)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update lesson"
        )


@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lesson(
    lesson_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a lesson (admin only)."""
    # TODO: Add admin role check
    
    try:
        lesson_uuid = uuid.UUID(lesson_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lesson ID format"
        )
    
    db_lesson = db.query(Lesson).filter(Lesson.id == lesson_uuid).first()
    if not db_lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    # Check if lesson has exercises
    exercise_count = db.query(Exercise).filter(Exercise.lesson_id == lesson_uuid).count()
    if exercise_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete lesson with {exercise_count} exercises. Delete exercises first."
        )
    
    try:
        db.delete(db_lesson)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete lesson"
        ) 