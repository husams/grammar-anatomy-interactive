# Grammar Anatomy Interactive

An interactive learning application for mastering English grammar based on "Brehe's Grammar Anatomy" textbook.

## Project Status

**Current Phase:** 1.1 - Project Initialization ✅

### Completed Tasks
- [x] React TypeScript project created
- [x] Tailwind CSS v3.x installed and configured
- [x] React Router v6 set up
- [x] Basic project structure created
- [x] TypeScript types defined
- [x] Basic routing implemented
- [x] Development server running

### Project Structure
```
grammar-anatomy-app/          # Frontend (React + TypeScript)
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Route-level page components
│   ├── contexts/      # React Context for state management
│   ├── data/          # Static data and API integration
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main application component
│   └── index.tsx      # Application entry point
└── docs/              # Project documentation

backend/                # Backend (Python + FastAPI) - Coming in Phase 1.3
├── app/               # FastAPI application
├── alembic/           # Database migrations
├── tests/             # Test files
└── requirements.txt   # Python dependencies
```

## Getting Started

### Prerequisites
- Node.js 16+ (for frontend)
- Python 3.8+ (for backend - coming in Phase 1.3)
- npm or yarn

### Frontend Development
```bash
# Navigate to frontend directory
cd grammar-anatomy-app

# Install dependencies
npm install

# Start development server
npm start
```

### Backend Development (Phase 1.3)
```bash
# Navigate to backend directory (when created)
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Available Scripts
- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router v6** - Navigation

### Backend (Phase 1.3)
- **Python 3.8+** - Programming language
- **FastAPI** - Web framework
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **PostgreSQL/SQLite** - Database
- **JWT** - Authentication

## MVP Roadmap

### Phase 1: Foundation ✅
- [x] Project setup and configuration
- [ ] Development environment setup
- [ ] Backend foundation (Python FastAPI)

### Phase 2: Core Infrastructure
- [ ] Database schema implementation (SQLAlchemy)
- [ ] Basic API endpoints (FastAPI)
- [ ] Frontend foundation components

### Phase 3: Content Management
- [ ] Content structure setup
- [ ] Content API integration
- [ ] Static content pages

### Phase 4: Core Learning Features
- [ ] Dashboard implementation
- [ ] Exercise system
- [ ] Progress tracking

### Phase 5: Interactive Tools
- [ ] Basic Anatomy Lab
- [ ] Glossary implementation
- [ ] Review system

### Phase 6: Polish & Testing
- [ ] UI/UX refinement
- [ ] Testing & quality assurance
- [ ] Performance optimization

## Features

### MVP Features
- User registration and login
- Module and lesson navigation
- Interactive exercises
- Progress tracking
- Basic sentence parsing
- Searchable glossary
- Flashcard review system

### Future Features (Phase 2+)
- AI Guru chatbot
- Text-to-Speech integration
- Advanced sentence diagramming
- Cloud sync
- Admin panel
- Advanced analytics

## Documentation

- [Architecture Overview](docs/architecture.md)
- [MVP Implementation Plan](docs/mvp-implementation-plan.md)
- [Python Backend Setup Guide](docs/python-backend-setup.md)
- [API Specification](docs/api-spec.md)
- [Database Schema](docs/database-schema.md)
- [Frontend Structure](docs/frontend-structure.md)
- [Content Management](docs/content-management.md)
- [UI Wireframes](docs/ui-wireframes.md)

## Contributing

This project follows the MVP implementation plan outlined in the docs directory. Please refer to the architecture and design documents for development guidelines.

## Repository

- **GitHub:** https://github.com/husams/grammar-anatomy-interactive
- **Frontend:** React TypeScript application
- **Backend:** Python FastAPI application (Phase 1.3)
- **Documentation:** Comprehensive guides and specifications
