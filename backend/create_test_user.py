#!/usr/bin/env python3
"""Create a test user for the Grammar Anatomy app."""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.security import get_password_hash

# Import Base first to set up the registry
from app.db.base import Base

# Create database session
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Now import User model after Base is set up
from app.models.user import User

try:
    # Check if user already exists
    existing = db.query(User).filter(User.email == "test@example.com").first()
    if existing:
        print("Test user already exists!")
    else:
        # Create test user
        test_user = User(
            email="test@example.com",
            name="Test User",
            password_hash=get_password_hash("testpassword"),
            is_active=True
        )
        db.add(test_user)
        db.commit()
        print("Test user created successfully!")
        print("Email: test@example.com")
        print("Password: testpassword")
except Exception as e:
    print(f"Error creating test user: {e}")
    db.rollback()
finally:
    db.close()