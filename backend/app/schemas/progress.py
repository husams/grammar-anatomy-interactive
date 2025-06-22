from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import enum


class ProgressStatus(str, enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class ProgressBase(BaseModel):
    status: ProgressStatus


class ProgressCreate(ProgressBase):
    module_id: Optional[uuid.UUID] = None
    lesson_id: Optional[uuid.UUID] = None


class ProgressUpdate(BaseModel):
    status: Optional[ProgressStatus] = None
    completed_exercises: Optional[int] = None
    total_exercises: Optional[int] = None


class ProgressResponse(ProgressBase):
    id: uuid.UUID
    user_id: uuid.UUID
    module_id: Optional[uuid.UUID] = None
    lesson_id: Optional[uuid.UUID] = None
    completed_exercises: Optional[int] = None
    total_exercises: Optional[int] = None
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProgressSummary(BaseModel):
    total_modules: int
    completed_modules: int
    total_lessons: int
    completed_lessons: int
    total_exercises: int
    completed_exercises: int
    overall_progress_percentage: float
    module_progress: List[dict]  # List of module progress details


class ModuleProgressDetail(BaseModel):
    module_id: uuid.UUID
    module_title: str
    total_lessons: int
    completed_lessons: int
    progress_percentage: float
    status: ProgressStatus 