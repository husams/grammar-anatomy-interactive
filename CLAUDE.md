# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

### Docker-based Development (Recommended)
- `./app.sh start` or `make start` - Start full application stack (frontend, backend, database)
- `./app.sh dev` or `make dev` - Start with live logs
- `./app.sh stop` or `make stop` - Stop all services
- `./app.sh populate` or `make populate` - Populate database with sample content
- `./app.sh test` or `make test` - Run all tests (backend pytest + frontend Jest)
- `./app.sh migrate` - Run database migrations
- `./app.sh logs` - View application logs

### Local Development Setup

#### Prerequisites
- Python 3.11+
- Node.js 16+
- PostgreSQL (optional, can use SQLite for development)

#### Starting Backend Locally
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```
Backend will be available at http://localhost:8000

#### Starting Frontend Locally
```bash
cd frontend
npm install
npm start
```
Frontend will be available at http://localhost:3000

#### Database Setup
- **SQLite (Development):** Backend automatically creates `grammar_anatomy.db`
- **PostgreSQL:** Set `DATABASE_URL` environment variable or use Docker Compose

#### Testing
- **Backend:** `cd backend && pytest`
- **Frontend:** `cd frontend && npm test`

### Quality Assurance
- **Backend linting:** `make lint-backend` (black, isort, flake8)
- **Frontend linting:** `cd frontend && npm run lint && npm run type-check`

## Architecture Overview

This is a full-stack grammar learning application with a **React TypeScript frontend**, **FastAPI Python backend**, and **PostgreSQL database**.

### Technology Stack
- **Frontend:** React 19.1.0 + TypeScript, Tailwind CSS, React Router v7.6.2
- **Backend:** FastAPI (Python), SQLAlchemy ORM, Alembic migrations
- **Database:** PostgreSQL 15 (production), SQLite (development)
- **Testing:** Playwright (E2E), Jest + React Testing Library (frontend), pytest (backend)
- **Deployment:** Docker Compose with Nginx, health checks

### Service Architecture
```
Frontend (React) → Backend API (FastAPI) → Database (PostgreSQL)
    ↓                    ↓                       ↓
  Port 3000           Port 8000                Port 5432
```

### Key Components

#### Backend (`/backend/app/`)
- **FastAPI app** with CORS middleware and JWT authentication
- **SQLAlchemy models:** User, Module, Lesson, Exercise, Progress, Achievement
- **API structure:** `/api/v1/` with endpoints for content, exercises, lessons, modules, progress, users
- **Content system:** Markdown lessons + JSON exercises loaded from `/content/` directory
- **Exercise types:** Multiple choice, fill-in-blank, identification, sentence construction

#### Frontend (`/frontend/src/`)
- **React Router navigation** with protected routes via AuthContext
- **Service layer pattern:** ModuleService, LessonService, ProgressService with API integration
- **Component architecture:** Page components + reusable UI components organized by feature
- **Interactive features:** Grammar word highlighting, progress tracking, dark mode support

### Database Schema
- **Users:** Authentication, progress tracking
- **Modules:** Course units with lessons and exercises
- **Lessons:** Markdown content with reading progress
- **Exercises:** JSON-defined questions with tracking
- **Progress:** Completion tracking, time spent, scores

## Content Management

### Content Structure
```
content/
├── modules/
│   ├── 01-nouns-verbs/
│   │   ├── lesson.md      # Lesson content
│   │   └── exercises.json # Exercise definitions
│   └── 02-pronouns/
└── glossary.json         # Grammar term definitions
```

### Adding New Content
1. Create module directory in `content/modules/`
2. Add `lesson.md` with frontmatter (title, description, learning_objectives)
3. Add `exercises.json` with exercise definitions
4. Run `./app.sh populate` to load into database

## Development Guidelines

### API Integration
- **Authentication:** JWT tokens stored in localStorage
- **Error handling:** Custom ApiError class with HTML response detection
- **Base URL:** Development uses `localhost:8000`, production uses `/api/v1`

### State Management
- **AuthContext** for user authentication and token management
- **Service layer** for business logic and API calls with caching
- **Local component state** with useState/useEffect patterns

### Code Quality
- **TypeScript strict mode** with comprehensive type definitions
- **ESLint + Prettier** for consistent code formatting
- **Component testing** with React Testing Library
- **API testing** with pytest and database fixtures

### Deployment
- **Docker Compose** orchestration with health checks
- **Multi-stage builds** for optimized production images
- **Environment configuration** via `.env` files
- **Database migrations** via Alembic

## Grammar Learning Features

This application provides interactive grammar education with:
- **Color-coded parts of speech** (nouns=blue, verbs=green, adjectives=purple, pronouns=orange)
- **Interactive markdown rendering** with grammar word detection and tooltips
- **Progress tracking** through lessons with scroll-based reading progress
- **Exercise system** with immediate feedback and score tracking
- **Module navigation** with search, filtering, and progress indicators

The application follows educational design principles with consistent styling, accessibility features, and responsive design optimized for learning experiences.