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