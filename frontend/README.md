# Grammar Anatomy Interactive - Frontend

React TypeScript frontend for the Grammar Anatomy Interactive application.

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
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Route-level page components
│   ├── contexts/      # React Context for state management
│   ├── data/          # Static data and API integration
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main application component
│   └── index.tsx      # Application entry point
├── public/            # Static assets
├── package.json       # Dependencies and scripts
└── tailwind.config.js # Tailwind CSS configuration
```

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

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

- [Architecture Overview](../docs/architecture.md)
- [MVP Implementation Plan](../docs/mvp-implementation-plan.md)
- [Python Backend Setup Guide](../docs/python-backend-setup.md)
- [API Specification](../docs/api-spec.md)
- [Database Schema](../docs/database-schema.md)
- [Frontend Structure](../docs/frontend-structure.md)
- [Content Management](../docs/content-management.md)
- [UI Wireframes](../docs/ui-wireframes.md)

## Contributing

This project follows the MVP implementation plan outlined in the docs directory. Please refer to the architecture and design documents for development guidelines.

## Repository

- **GitHub:** https://github.com/husams/grammar-anatomy-interactive
- **Frontend:** React TypeScript application
- **Backend:** Python FastAPI application (Phase 1.3)
- **Documentation:** Comprehensive guides and specifications
