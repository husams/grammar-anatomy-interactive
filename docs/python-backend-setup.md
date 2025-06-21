# Python Backend Setup Guide — Grammar Anatomy Interactive

## Overview
This document provides detailed instructions for setting up the Python FastAPI backend for the Grammar Anatomy Interactive application.

## Technology Stack

### Core Dependencies
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and Object-Relational Mapping (ORM)
- **Alembic** - Database migration tool for SQLAlchemy
- **Pydantic** - Data validation using Python type annotations
- **PostgreSQL/SQLite** - Database (PostgreSQL for production, SQLite for development)
- **JWT** - JSON Web Token authentication
- **CORS** - Cross-Origin Resource Sharing middleware

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection and session
│   ├── models/              # SQLAlchemy database models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── module.py
│   │   ├── lesson.py
│   │   ├── exercise.py
│   │   ├── progress.py
│   │   ├── achievement.py
│   │   └── glossary.py
│   ├── schemas/             # Pydantic request/response models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── module.py
│   │   ├── lesson.py
│   │   └── exercise.py
│   ├── api/                 # API route handlers
│   │   ├── __init__.py
│   │   ├── deps.py          # Dependencies (auth, etc.)
│   │   ├── users.py
│   │   ├── modules.py
│   │   ├── lessons.py
│   │   ├── exercises.py
│   │   ├── glossary.py
│   │   └── anatomy_lab.py
│   ├── core/                # Core functionality
│   │   ├── __init__.py
│   │   ├── auth.py          # JWT authentication
│   │   ├── security.py      # Password hashing
│   │   └── config.py        # Settings management
│   └── utils/               # Utility functions
│       ├── __init__.py
│       └── content.py       # Content loading utilities
├── alembic/                 # Database migrations
│   ├── versions/
│   ├── env.py
│   └── alembic.ini
├── tests/                   # Test files
│   ├── __init__.py
│   ├── test_api/
│   ├── test_models/
│   └── conftest.py
├── requirements.txt         # Python dependencies
├── requirements-dev.txt     # Development dependencies
├── .env                     # Environment variables
├── .env.example             # Example environment variables
└── README.md                # Backend documentation
```

## Setup Instructions

### 1. Environment Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Dependencies (requirements.txt)

```txt
# FastAPI and ASGI server
fastapi==0.104.1
uvicorn[standard]==0.24.0

# Database
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9  # For PostgreSQL
# sqlite3 is included with Python

# Authentication and Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# Data Validation
pydantic==2.5.0
pydantic-settings==2.1.0

# CORS
python-cors==1.7.0

# Environment variables
python-dotenv==1.0.0

# Content processing
markdown==3.5.1
```

### 3. Development Dependencies (requirements-dev.txt)

```txt
# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2

# Code quality
black==23.11.0
isort==5.12.0
flake8==6.1.0
mypy==1.7.1

# Documentation
mkdocs==1.5.3
mkdocs-material==9.4.8
```

### 4. Environment Configuration (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost/grammar_anatomy
# For development with SQLite:
# DATABASE_URL=sqlite:///./grammar_anatomy.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]

# API
API_V1_STR=/api/v1
PROJECT_NAME=Grammar Anatomy Interactive API

# Content
CONTENT_DIR=../content
```

### 5. Database Models

#### User Model (app/models/user.py)
```python
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

#### Module Model (app/models/module.py)
```python
from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Module(Base):
    __tablename__ = "modules"
    
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    order = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

### 6. Pydantic Schemas

#### User Schema (app/schemas/user.py)
```python
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None

class User(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
```

### 7. API Routes

#### Users API (app/api/users.py)
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import crud, schemas
from app.api import deps

router = APIRouter()

@router.post("/register", response_model=schemas.User)
def create_user(
    user_in: schemas.UserCreate,
    db: Session = Depends(deps.get_db)
):
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    user = crud.user.create(db, obj_in=user_in)
    return user

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(deps.get_db)
):
    user = crud.user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=400, detail="Incorrect email or password"
        )
    elif not crud.user.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
```

### 8. Main Application (app/main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.api_v1.api import api_router
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Grammar Anatomy Interactive API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

## Development Workflow

### 1. Start Development Server
```bash
# Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Database Migrations
```bash
# Initialize Alembic
alembic init alembic

# Create a new migration
alembic revision --autogenerate -m "Create initial tables"

# Apply migrations
alembic upgrade head
```

### 3. Testing
```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_api/test_users.py
```

### 4. Code Quality
```bash
# Format code
black app/

# Sort imports
isort app/

# Lint code
flake8 app/

# Type checking
mypy app/
```

## API Documentation

Once the server is running, you can access:
- **Interactive API docs (Swagger UI):** http://localhost:8000/docs
- **Alternative API docs (ReDoc):** http://localhost:8000/redoc
- **OpenAPI schema:** http://localhost:8000/openapi.json

## Integration with Frontend

The backend is configured to work with the React frontend running on `http://localhost:3000`. CORS is properly configured to allow requests from the frontend.

## Next Steps

After setting up the backend:
1. Create database models for all entities
2. Implement CRUD operations
3. Add authentication and authorization
4. Create API endpoints for all features
5. Add comprehensive testing
6. Set up CI/CD pipeline for the backend 