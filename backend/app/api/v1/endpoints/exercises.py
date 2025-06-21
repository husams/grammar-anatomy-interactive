from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models.exercise import Exercise
from app.models.lesson import Lesson
from app.models.progress import Progress, ProgressStatus
from app.schemas.exercise import (
    ExerciseCreate, ExerciseUpdate, ExerciseResponse,
    ExerciseSubmission, ExerciseResult
)
from app.api.deps import get_current_active_user
from app.models.user import User
from app.core.exercise_evaluator import ExerciseEvaluator
import uuid
import json
from datetime import datetime

router = APIRouter()


@router.get("/", response_model=List[ExerciseResponse])
async def get_exercises(
    lesson_id: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all exercises, optionally filtered by lesson_id."""
    query = db.query(Exercise)
    
    if lesson_id:
        try:
            lesson_uuid = uuid.UUID(lesson_id)
            # Verify lesson exists
            lesson = db.query(Lesson).filter(Lesson.id == lesson_uuid).first()
            if not lesson:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Lesson not found"
                )
            query = query.filter(Exercise.lesson_id == lesson_uuid)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid lesson ID format"
            )
    
    exercises = query.order_by(Exercise.order).all()
    return [ExerciseResponse.model_validate(exercise) for exercise in exercises]


@router.get("/{exercise_id}", response_model=ExerciseResponse)
async def get_exercise(
    exercise_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific exercise by ID."""
    try:
        exercise_uuid = uuid.UUID(exercise_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid exercise ID format"
        )
    
    exercise = db.query(Exercise).filter(Exercise.id == exercise_uuid).first()
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    return ExerciseResponse.model_validate(exercise)


@router.post("/", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
async def create_exercise(
    exercise: ExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new exercise (admin only)."""
    # TODO: Add admin role check
    
    # Verify lesson exists
    lesson = db.query(Lesson).filter(Lesson.id == exercise.lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
    
    # Check if exercise with same order in this lesson already exists
    existing_exercise = db.query(Exercise).filter(
        Exercise.lesson_id == exercise.lesson_id,
        Exercise.order == exercise.order
    ).first()
    if existing_exercise:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Exercise with order {exercise.order} already exists in this lesson"
        )
    
    # Validate content structure based on exercise type
    try:
        ExerciseEvaluator._validate_exercise_content(exercise.type, exercise.content)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid answer format: {str(e)}"
        )
    
    db_exercise = Exercise(
        title=exercise.title,
        type=exercise.type,
        prompt=exercise.prompt,
        content=exercise.content,
        order=exercise.order,
        lesson_id=exercise.lesson_id
    )
    
    try:
        db.add(db_exercise)
        db.commit()
        db.refresh(db_exercise)
        return ExerciseResponse.model_validate(db_exercise)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create exercise"
        )


@router.put("/{exercise_id}", response_model=ExerciseResponse)
async def update_exercise(
    exercise_id: str,
    exercise_update: ExerciseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update an exercise (admin only)."""
    # TODO: Add admin role check
    
    try:
        exercise_uuid = uuid.UUID(exercise_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid exercise ID format"
        )
    
    db_exercise = db.query(Exercise).filter(Exercise.id == exercise_uuid).first()
    if not db_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    # Check if new order conflicts with existing exercise in same lesson
    if exercise_update.order is not None and exercise_update.order != db_exercise.order:
        existing_exercise = db.query(Exercise).filter(
            Exercise.lesson_id == db_exercise.lesson_id,
            Exercise.order == exercise_update.order,
            Exercise.id != exercise_uuid
        ).first()
        if existing_exercise:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Exercise with order {exercise_update.order} already exists in this lesson"
            )
    
    # Validate content structure if content is being updated
    if exercise_update.content is not None:
        exercise_type = exercise_update.type or db_exercise.type
        try:
            ExerciseEvaluator._validate_exercise_content(exercise_type, exercise_update.content)
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid answer format: {str(e)}"
            )
    
    # Update fields
    update_data = exercise_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_exercise, field, value)
    
    try:
        db.commit()
        db.refresh(db_exercise)
        return ExerciseResponse.model_validate(db_exercise)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update exercise"
        )


@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exercise(
    exercise_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete an exercise (admin only)."""
    # TODO: Add admin role check
    
    try:
        exercise_uuid = uuid.UUID(exercise_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid exercise ID format"
        )
    
    db_exercise = db.query(Exercise).filter(Exercise.id == exercise_uuid).first()
    if not db_exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    try:
        db.delete(db_exercise)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete exercise"
        )


@router.post("/{exercise_id}/submit", response_model=ExerciseResult)
async def submit_exercise(
    exercise_id: str,
    submission: ExerciseSubmission,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Submit an answer for an exercise."""
    try:
        exercise_uuid = uuid.UUID(exercise_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid exercise ID format"
        )
    
    exercise = db.query(Exercise).filter(Exercise.id == exercise_uuid).first()
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    # Evaluate the submission
    try:
        is_correct, score = ExerciseEvaluator.evaluate_exercise(
            exercise.type,
            exercise.content,
            submission.answer
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid answer format: {str(e)}"
        )
    
    # Create exercise result
    exercise_result = ExerciseResult(
        exercise_id=exercise_uuid,
        user_id=current_user.id,
        answer=submission.answer,
        is_correct=is_correct,
        score=score,
        time_spent=submission.time_spent,
        submitted_at=datetime.utcnow()
    )
    
    # Update progress for the lesson
    lesson_progress = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.lesson_id == exercise.lesson_id
    ).first()
    
    if not lesson_progress:
        # Create new progress entry
        lesson_progress = Progress(
            user_id=current_user.id,
            lesson_id=exercise.lesson_id,
            status=ProgressStatus.IN_PROGRESS
        )
        db.add(lesson_progress)
    
    # Update progress status based on exercise completion
    # This is a simplified logic - in a real app, you'd check all exercises in the lesson
    if is_correct:
        lesson_progress.status = ProgressStatus.COMPLETED
    
    try:
        db.commit()
        return exercise_result
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save exercise result"
        ) 