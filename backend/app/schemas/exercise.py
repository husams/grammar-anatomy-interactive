from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import enum


class ExerciseType(str, enum.Enum):
    IDENTIFICATION = "identification"
    MULTIPLE_CHOICE = "multiple_choice"
    FILL_IN_BLANK = "fill_in_blank"
    SENTENCE_CONSTRUCTION = "sentence_construction"


class ExerciseBase(BaseModel):
    title: str
    type: ExerciseType
    prompt: str
    content: Dict[str, Any]  # Flexible content structure
    order: int


class ExerciseCreate(ExerciseBase):
    lesson_id: uuid.UUID


class ExerciseUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[ExerciseType] = None
    prompt: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    order: Optional[int] = None


class ExerciseInDB(ExerciseBase):
    id: uuid.UUID
    lesson_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ExerciseResponse(ExerciseBase):
    id: uuid.UUID
    lesson_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ExerciseSubmission(BaseModel):
    answer: Dict[str, Any]  # Flexible answer structure
    time_spent: Optional[int] = None  # Time in seconds


class ExerciseResult(BaseModel):
    exercise_id: uuid.UUID
    user_id: uuid.UUID
    answer: Dict[str, Any]
    is_correct: bool
    score: float
    time_spent: Optional[int] = None
    submitted_at: datetime

    class Config:
        from_attributes = True 