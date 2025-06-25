from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid


class ModuleBase(BaseModel):
    title: str
    order: int


class ModuleCreate(ModuleBase):
    pass


class ModuleUpdate(BaseModel):
    title: Optional[str] = None
    order: Optional[int] = None


class ModuleInDB(ModuleBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ModuleResponse(ModuleBase):
    id: uuid.UUID
    created_at: datetime
    lesson_count: Optional[int] = 0

    class Config:
        from_attributes = True


# For module detail view - avoiding circular imports by defining lesson summary inline
class LessonSummary(BaseModel):
    id: uuid.UUID
    title: str
    order: int
    duration: int = 30  # Default duration in minutes
    lesson_type: str = "content"  # Default lesson type
    is_locked: bool = False  # Default unlocked
    description: str = ""  # Default empty description
    exercise_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ModuleDetailResponse(ModuleBase):
    id: uuid.UUID
    created_at: datetime
    lesson_count: Optional[int] = 0
    exercise_count: Optional[int] = 0
    learning_objectives: List[str] = []  # Default empty list
    prerequisites: List[str] = []  # Default empty list
    lessons: List[LessonSummary] = []  # Include lessons data
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 