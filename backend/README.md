# Grammar Anatomy Backend

FastAPI backend for the Grammar Anatomy learning application.

## Features

- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **Alembic**: Database migration tool
- **Pydantic**: Data validation using Python type annotations
- **JWT Authentication**: Secure token-based authentication
- **CORS Support**: Cross-origin resource sharing
- **SQLite/PostgreSQL**: Database support

## Prerequisites

- Python 3.9+
- pip
- virtual environment (recommended)

## Installation

1. **Create and activate virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Development

### Running the Server

```bash
# Development server with auto-reload
python run.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Database Setup

1. **Initialize Alembic** (first time only):
   ```bash
   alembic init alembic
   ```

2. **Create initial migration**:
   ```bash
   alembic revision --autogenerate -m "Initial migration"
   ```

3. **Apply migrations**:
   ```bash
   alembic upgrade head
   ```

### Code Quality

```bash
# Format code
black app/

# Sort imports
isort app/

# Type checking
mypy app/

# Linting
flake8 app/

# Run all checks
black app/ && isort app/ && mypy app/ && flake8 app/
```

### Testing

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_modules.py
```

## API Documentation

Once the server is running, you can access:

- **Interactive API docs**: http://localhost:8000/docs
- **ReDoc documentation**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   │   ├── __init__.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── api.py       # Main API router
│   │   │   │   └── endpoints/   # API endpoints
│   │   │   ├── core/
│   │   │   │   ├── __init__.py
│   │   │   │   └── config.py        # Settings and configuration
│   │   │   ├── db/
│   │   │   │   ├── __init__.py
│   │   │   │   └── base.py          # Database setup
│   │   │   ├── models/              # SQLAlchemy models
│   │   │   ├── schemas/             # Pydantic schemas
│   │   │   ├── crud/                # Database operations
│   │   │   └── utils/               # Utility functions
│   │   ├── alembic/                 # Database migrations
│   │   ├── tests/                   # Test files
│   │   ├── requirements.txt         # Python dependencies
│   │   ├── alembic.ini             # Alembic configuration
│   │   └── run.py                  # Application entry point
│   └── .env                        # Environment variables
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=sqlite:///./grammar_anatomy.db

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=development
DEBUG=true

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
```

## API Endpoints

### Modules
- `GET /api/v1/modules/` - Get all modules
- `GET /api/v1/modules/{module_id}` - Get specific module

### Lessons
- `GET /api/v1/lessons/` - Get all lessons
- `GET /api/v1/lessons/{lesson_id}` - Get specific lesson

### Exercises
- `GET /api/v1/exercises/` - Get all exercises
- `GET /api/v1/exercises/{exercise_id}` - Get specific exercise

### Users
- `GET /api/v1/users/` - Get all users
- `GET /api/v1/users/{user_id}` - Get specific user

## Development Guidelines

### Code Style

- Use **Black** for code formatting
- Use **isort** for import sorting
- Use **mypy** for type checking
- Follow PEP 8 guidelines

### Database

- Use **Alembic** for all database changes
- Create migrations for schema changes
- Use **SQLAlchemy** ORM for database operations

### API Design

- Use **Pydantic** models for request/response validation
- Follow RESTful conventions
- Include proper error handling
- Add comprehensive documentation

### Testing

- Write unit tests for all functions
- Use **pytest** for testing framework
- Mock external dependencies
- Aim for high test coverage

## Deployment

### Production Setup

1. **Environment Variables**:
   - Set `ENVIRONMENT=production`
   - Use strong `SECRET_KEY`
   - Configure production database URL

2. **Database**:
   - Use PostgreSQL for production
   - Run migrations: `alembic upgrade head`

3. **Server**:
   - Use production ASGI server (Gunicorn + Uvicorn)
   - Configure reverse proxy (Nginx)
   - Set up SSL/TLS certificates

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
RUN alembic upgrade head

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure virtual environment is activated
2. **Database Errors**: Run `alembic upgrade head`
3. **CORS Issues**: Check `BACKEND_CORS_ORIGINS` configuration
4. **Port Conflicts**: Change port in `run.py` or use different port

### Logs

- Check application logs for errors
- Use `--log-level debug` for detailed logging
- Monitor database connection issues

## Contributing

1. Create feature branch
2. Follow code style guidelines
3. Add tests for new features
4. Update documentation
5. Submit pull request 