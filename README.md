# Grammar Anatomy Interactive

An interactive learning application for mastering English grammar based on "Brehe's Grammar Anatomy" textbook.

## Project Structure

```
grammar-anatomy-app/
├── frontend/              # React TypeScript application
│   ├── src/              # React source code
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   └── README.md         # Frontend documentation
├── backend/              # Python FastAPI application (Phase 1.3)
│   └── (will be created in Phase 1.3)
├── docs/                 # Project documentation
│   ├── architecture.md
│   ├── mvp-implementation-plan.md
│   ├── python-backend-setup.md
│   └── ...
├── .github/              # GitHub Actions workflows
└── README.md            # This file
```

## Quick Start

### Frontend Development
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at [http://localhost:3000](http://localhost:3000)

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

The backend API will be available at [http://localhost:8000](http://localhost:8000)

## Development Setup

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The API will be available at [http://localhost:8000](http://localhost:8000)

## Running Tests

### Frontend
- **Unit & Integration Tests:**
  ```bash
  cd frontend
  npm test
  ```
  This runs the React test suite (Jest, React Testing Library). Results are shown in the terminal.

- **End-to-End (E2E) Tests:**
  See the [End-to-End (E2E) Testing](#end-to-end-e2e-testing) section below for detailed instructions.

### Backend
- **Unit & API Tests:**
  ```bash
  cd backend
  pytest
  ```
  Test results are shown in the terminal. Coverage and advanced reporting can be configured in `backend/tests/`.

## End-to-End (E2E) Testing

End-to-End (E2E) tests for the frontend are implemented using [Playwright](https://playwright.dev/). These tests simulate real user interactions in a browser and verify the full application flow.

> **Note:** The backend API server must be running for E2E tests to work, as tests interact with real authentication endpoints (registration, login, etc.).
>
> **Limitation:** Password reset functionality is not yet implemented in the backend. Any E2E test steps involving password reset will fail until this feature is added.

### How to Run E2E Tests

1. **Start the frontend development server** (in a separate terminal, if not already running):
   ```bash
   cd frontend
   npm start
   ```
   The app must be running at [http://localhost:3000](http://localhost:3000) for E2E tests to work.

2. **Run E2E tests with Playwright:**
   ```bash
   cd frontend
   npx playwright test
   ```
   This will execute all E2E tests in `frontend/e2e/`. Results and reports are saved in `frontend/playwright-report/` and `frontend/test-results/`.

3. **View the Playwright HTML report:**
   ```bash
   npx playwright show-report frontend/playwright-report
   ```
   This will open an interactive HTML report in your browser, showing detailed results for each E2E test.

#### NPM Scripts for E2E
- Run E2E tests:
  ```bash
  npm run test:e2e
  ```
- Start the dev server and run E2E tests automatically:
  ```bash
  npm run test:e2e:full
  ```

> For more details, see the Playwright documentation or the `frontend/e2e/` directory for test examples.

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

## Project Status

**Current Phase:** 1.1 - Project Initialization ✅

### Completed Tasks
- [x] React TypeScript project created and structured
- [x] Tailwind CSS v3.x installed and configured
- [x] React Router v6 set up
- [x] Basic project structure created
- [x] TypeScript types defined
- [x] Basic routing implemented
- [x] Development server running
- [x] Project restructured with frontend/backend separation

### Next Steps
- [ ] Phase 1.2: Development Environment Setup
- [ ] Phase 1.3: Backend Foundation (Python FastAPI)

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

## Development

### Prerequisites
- **Node.js 16+** (for frontend)
- **Python 3.8+** (for backend - coming in Phase 1.3)
- **npm or yarn** (for frontend)
- **Git** (for version control)

### Available Scripts

#### Frontend (in `frontend/` directory)
```bash
npm start          # Start development server
npm test           # Run tests
npm run build      # Build for production
npm run eject      # Eject from Create React App
```

#### Backend (in `backend/` directory - Phase 1.3)
```bash
uvicorn app.main:app --reload  # Start development server
pytest                         # Run tests
alembic upgrade head          # Apply database migrations
```

## Repository

- **GitHub:** https://github.com/husams/grammar-anatomy-interactive
- **Frontend:** React TypeScript application
- **Backend:** Python FastAPI application (Phase 1.3)
- **Documentation:** Comprehensive guides and specifications

## Contributing

This project follows the MVP implementation plan outlined in the docs directory. Please refer to the architecture and design documents for development guidelines.

### Development Workflow
1. Create a feature branch from `main`
2. Make your changes
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Code Quality
- Frontend: ESLint, Prettier, TypeScript
- Backend: Black, isort, flake8, mypy (Phase 1.3)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please refer to the documentation or create an issue in the GitHub repository. 