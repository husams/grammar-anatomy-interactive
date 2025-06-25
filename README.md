# Grammar Anatomy Interactive

An interactive learning application for mastering English grammar based on "Brehe's Grammar Anatomy" textbook.

## How to Start the Application

### Option 1: Using Docker (Recommended)

**Quick Start:**
```bash
# Start the entire application stack
./start.sh

# Or using the app script
./app.sh start

# Or using make
make start
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Option 2: Manual Development Setup

**Prerequisites:**
- Node.js 16+
- Python 3.11+
- PostgreSQL (or use SQLite for development)

**Start Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

**Start Frontend:**
```bash
cd frontend
npm install
npm start
```

## How to Run Unit Tests

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
source venv/bin/activate  # If not already activated
pytest
```

### All Tests (using Docker)
```bash
# Using app script
./app.sh test

# Using make
make test
```

## How to Run E2E Tests

### Prerequisites
- Application must be running (frontend at http://localhost:3000)
- Backend API must be available at http://localhost:8000

### Run E2E Tests
```bash
cd frontend
npx playwright test
```

### View E2E Test Reports
```bash
npx playwright show-report
```

### E2E with NPM Scripts
```bash
cd frontend

# Run E2E tests only
npm run test:e2e

# Start app and run E2E tests automatically
npm run test:e2e:full
```

---

For detailed Docker setup and configuration options, see [DOCKER.md](DOCKER.md).