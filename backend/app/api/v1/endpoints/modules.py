from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.base import get_db
from app.models.module import Module
from app.models.lesson import Lesson
from app.schemas.module import ModuleCreate, ModuleUpdate, ModuleResponse
from app.api.deps import get_current_active_user
from app.models.user import User
import uuid

router = APIRouter()


@router.get("/", response_model=List[ModuleResponse])
async def get_modules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all modules with lesson counts."""
    modules = db.query(Module).order_by(Module.order).all()
    
    # Add lesson count to each module
    result = []
    for module in modules:
        lesson_count = db.query(Lesson).filter(Lesson.module_id == module.id).count()
        module_dict = ModuleResponse.model_validate(module)
        module_dict.lesson_count = lesson_count
        result.append(module_dict)
    
    return result


@router.get("/{module_id}", response_model=ModuleResponse)
async def get_module(
    module_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a specific module by ID."""
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
    
    # Add lesson count
    lesson_count = db.query(Lesson).filter(Lesson.module_id == module.id).count()
    module_dict = ModuleResponse.model_validate(module)
    module_dict.lesson_count = lesson_count
    
    return module_dict


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