#!/usr/bin/env python3
"""Test login functionality directly."""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.core.security import verify_password, create_access_token

# Import Base first
from app.db.base import Base

# Create database session
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

# Import User model
from app.models.user import User

try:
    # Find test user
    user = db.query(User).filter(User.email == "test@example.com").first()
    if user:
        print(f"User found: {user.email}")
        print(f"User active: {user.is_active}")
        print(f"Password hash exists: {bool(user.password_hash)}")
        
        # Test password verification
        try:
            is_valid = verify_password("testpassword", user.password_hash)
            print(f"Password verification: {is_valid}")
            
            if is_valid:
                # Create token
                token = create_access_token(data={"sub": user.email})
                print(f"Token created successfully: {token[:20]}...")
            else:
                print("Password verification failed!")
        except Exception as e:
            print(f"Error during password verification: {e}")
            print(f"Error type: {type(e)}")
    else:
        print("Test user not found!")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()