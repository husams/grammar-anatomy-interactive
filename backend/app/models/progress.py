from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Integer
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum
from app.db.base import Base


class ProgressStatus(enum.Enum):
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class Progress(Base):
    __tablename__ = "progress"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    module_id = Column(UUID(as_uuid=True), ForeignKey("modules.id"), nullable=True)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=True)
    status = Column(Enum(ProgressStatus), nullable=False, default=ProgressStatus.NOT_STARTED)
    completed_exercises = Column(Integer, nullable=True, default=0)
    total_exercises = Column(Integer, nullable=True, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="progress")
    module = relationship("Module", back_populates="progress")
    lesson = relationship("Lesson", back_populates="progress") 