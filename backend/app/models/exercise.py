from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.db.base import Base


class Exercise(Base):
    __tablename__ = "exercises"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    lesson_id = Column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=False)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)  # identification, multiple_choice, fill_in_blank, sentence_construction
    prompt = Column(Text, nullable=False)
    content = Column(JSON, nullable=False)  # Flexible content structure for different exercise types
    order = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    lesson = relationship("Lesson", back_populates="exercises") 