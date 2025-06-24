from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List
from app.db.base import get_db
from app.models.progress import Progress, ProgressStatus
from app.models.module import Module
from app.models.lesson import Lesson
from app.models.exercise import Exercise
from app.models.user import User
from app.schemas.progress import (
    ProgressCreate, ProgressUpdate, ProgressResponse, 
    UserProgressSummary, ModuleProgressDetail
)
from app.api.deps import get_current_active_user
import uuid

router = APIRouter()


@router.get("/", response_model=List[ProgressResponse])
async def get_user_progress(
    module_id: str | None = None,
    lesson_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get user's progress, optionally filtered by module or lesson."""
    query = db.query(Progress).filter(Progress.user_id == current_user.id)
    
    if module_id:
        try:
            module_uuid = uuid.UUID(module_id)
            query = query.filter(Progress.module_id == module_uuid)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid module ID format"
            )
    
    if lesson_id:
        try:
            lesson_uuid = uuid.UUID(lesson_id)
            query = query.filter(Progress.lesson_id == lesson_uuid)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid lesson ID format"
            )
    
    progress_entries = query.order_by(Progress.updated_at.desc()).all()
    return [ProgressResponse.model_validate(entry) for entry in progress_entries]


@router.get("/summary", response_model=UserProgressSummary)
async def get_user_progress_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get comprehensive progress summary for the user."""
    
    # Temporary fallback with mock data for dashboard demo
    # TODO: Implement proper database queries once all tables are set up
    return UserProgressSummary(
        total_modules=5,
        completed_modules=2,
        total_lessons=20,
        completed_lessons=8,
        total_exercises=50,
        completed_exercises=15,
        overall_progress_percentage=40.0,
        module_progress=[
            {
                "module_id": "1",
                "module_title": "Basic Grammar",
                "total_lessons": 5,
                "completed_lessons": 3,
                "progress_percentage": 60.0,
                "status": "in_progress"
            },
            {
                "module_id": "2", 
                "module_title": "Advanced Grammar",
                "total_lessons": 8,
                "completed_lessons": 0,
                "progress_percentage": 0.0,
                "status": "not_started"
            }
        ]
    )


@router.get("/{progress_id}", response_model=ProgressResponse)
async def get_progress(
    progress_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific progress entry."""
    try:
        progress_uuid = uuid.UUID(progress_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid progress ID format"
        )
    
    progress = db.query(Progress).filter(
        and_(
            Progress.id == progress_uuid,
            Progress.user_id == current_user.id
        )
    ).first()
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progress not found"
        )
    
    return ProgressResponse.model_validate(progress)


@router.post("/", response_model=ProgressResponse, status_code=status.HTTP_201_CREATED)
async def create_progress(
    progress: ProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new progress entry."""
    
    # Validate that module or lesson exists if provided
    if progress.module_id:
        module = db.query(Module).filter(Module.id == progress.module_id).first()
        if not module:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Module not found"
            )
    
    if progress.lesson_id:
        lesson = db.query(Lesson).filter(Lesson.id == progress.lesson_id).first()
        if not lesson:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lesson not found"
            )
    
    # Check if progress entry already exists
    existing_progress = db.query(Progress).filter(
        and_(
            Progress.user_id == current_user.id,
            Progress.module_id == progress.module_id,
            Progress.lesson_id == progress.lesson_id
        )
    ).first()
    
    if existing_progress:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Progress entry already exists for this user and module/lesson"
        )
    
    # Calculate exercise counts if lesson is provided
    completed_exercises = 0
    total_exercises = 0
    
    if progress.lesson_id:
        total_exercises = db.query(Exercise).filter(Exercise.lesson_id == progress.lesson_id).count()
    
    # Map status string to ProgressStatus enum
    status_enum = ProgressStatus(progress.status)
    
    db_progress = Progress(
        user_id=current_user.id,
        module_id=progress.module_id,
        lesson_id=progress.lesson_id,
        status=status_enum,
        completed_exercises=completed_exercises,
        total_exercises=total_exercises
    )
    
    try:
        db.add(db_progress)
        db.commit()
        db.refresh(db_progress)
        return ProgressResponse.model_validate(db_progress)
    except Exception as e:
        db.rollback()
        print("CREATE PROGRESS ERROR:", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create progress entry"
        )


@router.put("/{progress_id}", response_model=ProgressResponse)
async def update_progress(
    progress_id: str,
    progress_update: ProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a progress entry."""
    try:
        progress_uuid = uuid.UUID(progress_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid progress ID format"
        )
    
    db_progress = db.query(Progress).filter(
        and_(
            Progress.id == progress_uuid,
            Progress.user_id == current_user.id
        )
    ).first()
    
    if not db_progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progress not found"
        )
    
    # Update fields
    update_data = progress_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "status" and value is not None:
            setattr(db_progress, field, ProgressStatus(value))
        else:
            setattr(db_progress, field, value)
    
    # Update total exercises if lesson is provided
    if db_progress.lesson_id and progress_update.completed_exercises is not None:
        total_exercises = db.query(Exercise).filter(Exercise.lesson_id == db_progress.lesson_id).count()
        db_progress.total_exercises = total_exercises
    
    try:
        db.commit()
        db.refresh(db_progress)
        return ProgressResponse.model_validate(db_progress)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update progress entry"
        )


@router.delete("/{progress_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_progress(
    progress_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a progress entry."""
    try:
        progress_uuid = uuid.UUID(progress_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid progress ID format"
        )
    
    db_progress = db.query(Progress).filter(
        and_(
            Progress.id == progress_uuid,
            Progress.user_id == current_user.id
        )
    ).first()
    
    if not db_progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progress not found"
        )
    
    try:
        db.delete(db_progress)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete progress entry"
        )


@router.post("/update", response_model=ProgressResponse)
async def update_user_progress(
    module_id: str | None = None,
    lesson_id: str | None = None,
    status: ProgressStatus = ProgressStatus.IN_PROGRESS,
    completed_exercises: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update or create user progress for a module or lesson."""
    
    # Validate IDs
    module_uuid = None
    lesson_uuid = None
    
    if module_id:
        try:
            module_uuid = uuid.UUID(module_id)
            module = db.query(Module).filter(Module.id == module_uuid).first()
            if not module:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Module not found"
                )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid module ID format"
            )
    
    if lesson_id:
        try:
            lesson_uuid = uuid.UUID(lesson_id)
            lesson = db.query(Lesson).filter(Lesson.id == lesson_uuid).first()
            if not lesson:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Lesson not found"
                )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid lesson ID format"
            )
    
    # Find existing progress or create new one
    progress = db.query(Progress).filter(
        and_(
            Progress.user_id == current_user.id,
            Progress.module_id == module_uuid,
            Progress.lesson_id == lesson_uuid
        )
    ).first()
    
    if not progress:
        # Create new progress entry
        total_exercises = 0
        if lesson_uuid:
            total_exercises = db.query(Exercise).filter(Exercise.lesson_id == lesson_uuid).count()
        
        progress = Progress(
            user_id=current_user.id,
            module_id=module_uuid,
            lesson_id=lesson_uuid,
            status=ProgressStatus(status),
            completed_exercises=completed_exercises or 0,
            total_exercises=total_exercises
        )
        db.add(progress)
    else:
        # Update existing progress
        progress.status = ProgressStatus(status)
        if completed_exercises is not None:
            progress.completed_exercises = completed_exercises
        if lesson_uuid:
            progress.total_exercises = db.query(Exercise).filter(Exercise.lesson_id == lesson_uuid).count()
    
    try:
        db.commit()
        db.refresh(progress)
        return ProgressResponse.model_validate(progress)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update progress"
        ) 