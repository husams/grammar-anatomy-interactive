from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class LessonBase(BaseModel):
    title: str
    content: str
    order: int


class LessonCreate(LessonBase):
    module_id: uuid.UUID


class LessonUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    order: Optional[int] = None


class LessonInDB(LessonBase):
    id: uuid.UUID
    module_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class LessonResponse(LessonBase):
    id: uuid.UUID
    module_id: uuid.UUID
    created_at: datetime
    exercise_count: Optional[int] = 0

    class Config:
        from_attributes = True 