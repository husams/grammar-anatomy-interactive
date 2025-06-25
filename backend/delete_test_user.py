#!/usr/bin/env python3
"""Delete test user from the Grammar Anatomy app."""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Import Base first
from app.db.base import Base

# Create database session
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Import User model
from app.models.user import User

try:
    # Find and delete test user
    test_user = db.query(User).filter(User.email == "test@example.com").first()
    if test_user:
        db.delete(test_user)
        db.commit()
        print("Test user deleted successfully!")
    else:
        print("Test user not found!")
except Exception as e:
    print(f"Error deleting test user: {e}")
    db.rollback()
finally:
    db.close()