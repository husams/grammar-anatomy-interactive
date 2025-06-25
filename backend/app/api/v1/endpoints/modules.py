from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models.module import Module
from app.models.lesson import Lesson
from app.schemas.module import ModuleCreate, ModuleUpdate, ModuleResponse, ModuleDetailResponse, LessonSummary
from app.api.deps import get_current_active_user
from app.models.user import User
import uuid

router = APIRouter()


@router.get("/", response_model=List[ModuleResponse])
async def get_modules(
    search: str | None = None,
    status: str | None = None,
    sort_by: str = "order",
    sort_direction: str = "asc",
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all modules with lesson counts, search, and filtering."""
    query = db.query(Module)
    
    # Apply search filter
    if search:
        query = query.filter(Module.title.ilike(f"%{search}%"))
    
    # Apply sorting
    if sort_by == "title":
        if sort_direction == "desc":
            query = query.order_by(Module.title.desc())
        else:
            query = query.order_by(Module.title.asc())
    else:  # Default to order
        if sort_direction == "desc":
            query = query.order_by(Module.order.desc())
        else:
            query = query.order_by(Module.order.asc())
    
    # Apply pagination
    modules = query.offset(skip).limit(limit).all()
    
    # Add lesson count to each module
    result = []
    for module in modules:
        lesson_count = db.query(Lesson).filter(Lesson.module_id == module.id).count()
        module_dict = ModuleResponse.model_validate(module)
        module_dict.lesson_count = lesson_count
        result.append(module_dict)
    
    return result


@router.get("/{module_id}", response_model=ModuleDetailResponse)
async def get_module(
    module_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific module by ID with lessons."""
    try:
        module_uuid = uuid.UUID(module_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid module ID format"
        )
    
    module = db.query(Module).filter(Module.id == module_uuid).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found"
        )
    
    # Get lessons for this module
    lessons = db.query(Lesson).filter(Lesson.module_id == module.id).order_by(Lesson.order).all()
    
    # Transform lessons to LessonSummary format
    lesson_summaries = []
    for lesson in lessons:
        lesson_summary = LessonSummary(
            id=lesson.id,
            title=lesson.title,
            order=lesson.order,
            duration=30,  # Default duration
            lesson_type="content",  # Default type
            is_locked=False,  # Default unlocked
            description="",  # Default empty description
            exercise_count=0  # TODO: Count exercises when exercise model is available
        )
        lesson_summaries.append(lesson_summary)
    
    # Create detailed response
    module_detail = ModuleDetailResponse(
        id=module.id,
        title=module.title,
        order=module.order,
        created_at=module.created_at,
        lesson_count=len(lessons),
        exercise_count=0,  # TODO: Calculate total exercises
        learning_objectives=[],  # TODO: Add when module model has this field
        prerequisites=[],  # TODO: Add when module model has this field
        lessons=lesson_summaries,
        updated_at=None  # TODO: Add when module model has this field
    )
    
    return module_detail


@router.post("/", response_model=ModuleResponse, status_code=status.HTTP_201_CREATED)
async def create_module(
    module: ModuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new module (admin only)."""
    # TODO: Add admin role check
    # For now, allow any authenticated user to create modules
    
    # Check if module with same order already exists
    existing_module = db.query(Module).filter(Module.order == module.order).first()
    if existing_module:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Module with order {module.order} already exists"
        )
    
    db_module = Module(
        title=module.title,
        order=module.order
    )
    
    try:
        db.add(db_module)
        db.commit()
        db.refresh(db_module)
        return ModuleResponse.model_validate(db_module)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create module"
        )


@router.put("/{module_id}", response_model=ModuleResponse)
async def update_module(
    module_id: str,
    module_update: ModuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a module (admin only)."""
    # TODO: Add admin role check
    
    try:
        module_uuid = uuid.UUID(module_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid module ID format"
        )
    
    db_module = db.query(Module).filter(Module.id == module_uuid).first()
    if not db_module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found"
        )
    
    # Check if new order conflicts with existing module
    if module_update.order is not None and module_update.order != db_module.order:
        existing_module = db.query(Module).filter(
            Module.order == module_update.order,
            Module.id != module_uuid
        ).first()
        if existing_module:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Module with order {module_update.order} already exists"
            )
    
    # Update fields
    update_data = module_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_module, field, value)
    
    try:
        db.commit()
        db.refresh(db_module)
        return ModuleResponse.model_validate(db_module)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update module"
        )


@router.delete("/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_module(
    module_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a module (admin only)."""
    # TODO: Add admin role check
    
    try:
        module_uuid = uuid.UUID(module_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid module ID format"
        )
    
    db_module = db.query(Module).filter(Module.id == module_uuid).first()
    if not db_module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found"
        )
    
    # Check if module has lessons
    lesson_count = db.query(Lesson).filter(Lesson.module_id == module_uuid).count()
    if lesson_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete module with {lesson_count} lessons. Delete lessons first."
        )
    
    try:
        db.delete(db_module)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete module"
        ) 