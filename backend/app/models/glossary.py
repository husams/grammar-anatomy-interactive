from sqlalchemy import Column, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.db.base import Base


class Glossary(Base):
    __tablename__ = "glossary"
    
    term = Column(String, primary_key=True, index=True)
    definition = Column(Text, nullable=False)
    related_lessons = Column(JSON, nullable=True)  # Array of lesson IDs
    created_at = Column(String, nullable=True)  # For tracking when term was added 