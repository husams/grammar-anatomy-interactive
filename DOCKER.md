# Docker Setup for Grammar Anatomy App

This document explains how to run the Grammar Anatomy application using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### Option 1: Using the Start Script (Recommended)
```bash
# Start in development mode
./start.sh

# Start in production mode
./start.sh -e production -d

# Start with logs
./start.sh -l
```

### Option 2: Using the App Script (Quick Commands)
```bash
# Start application
./app.sh start

# Start in development mode with logs
./app.sh dev

# Check status
./app.sh status

# View logs
./app.sh logs

# Stop application
./app.sh stop
```

### Option 3: Using Make Commands
```bash
# Start application
make start

# Start in development mode
make dev

# Check status
make status

# Run tests
make test
```

### Option 4: Direct Docker Compose
```bash
# Copy environment file
cp .env.production .env
# Edit .env with your configuration

# Start all services
docker-compose up -d
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Architecture

The application consists of three main services:

- **Frontend**: React application served by nginx (port 3000)
- **Backend**: FastAPI application (port 8000)
- **Database**: PostgreSQL 15 (port 5432)

## Environment Configuration

### Development (.env)
```bash
POSTGRES_DB=grammar_anatomy
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password123
SECRET_KEY=your-secret-key-change-in-production
ENVIRONMENT=development
DEBUG=true
REACT_APP_API_URL=http://localhost:8000
```

### Production
Copy `.env.production` to `.env` and update with secure values:
- Strong database password
- Secure secret key (64+ characters)
- Production domain for REACT_APP_API_URL

## Docker Commands

### Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

### Production
```bash
# Start with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Scale services (if needed)
docker-compose up -d --scale backend=2
```

### Individual Services
```bash
# Start only database
docker-compose up -d db

# Start backend with logs
docker-compose up backend

# Rebuild specific service
docker-compose build frontend
```

## Database Management

### Running Migrations
```bash
# Access backend container
docker-compose exec backend bash

# Run Alembic migrations
alembic upgrade head
```

### Database Backup
```bash
# Create backup
docker-compose exec db pg_dump -U postgres grammar_anatomy > backup.sql

# Restore backup
docker-compose exec -T db psql -U postgres grammar_anatomy < backup.sql
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep -E "(3000|8000|5432)"
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

3. **Database connection issues:**
   ```bash
   # Check database health
   docker-compose exec db pg_isready -U postgres
   
   # View database logs
   docker-compose logs db
   ```

4. **Frontend build failures:**
   ```bash
   # Clear npm cache
   docker-compose exec frontend npm cache clean --force
   
   # Rebuild without cache
   docker-compose build --no-cache frontend
   ```

### Service Health Checks

All services include health checks:
```bash
# Check service status
docker-compose ps

# View health check logs
docker inspect grammar-anatomy-backend --format='{{.State.Health.Status}}'
```

## Development Workflow

### Hot Reloading (Development)
The development override automatically mounts source code for hot reloading:
- Backend: uvicorn with `--reload` flag
- Frontend: nginx serves pre-built static files

### Running Tests
```bash
# Backend tests
docker-compose exec backend pytest

# Frontend tests
docker-compose exec frontend npm test
```

### Adding Dependencies

#### Backend (Python)
```bash
# Add to requirements.txt, then rebuild
docker-compose build backend
```

#### Frontend (Node.js)
```bash
# Access container and install
docker-compose exec frontend npm install package-name
# Then rebuild the image
docker-compose build frontend
```

## Production Deployment

1. **Update environment variables** in `.env`
2. **Use production compose file:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```
3. **Set up reverse proxy** (nginx/apache) for SSL termination
4. **Configure backups** for PostgreSQL data volume
5. **Monitor logs** and set up log rotation

## Volumes and Data Persistence

- **postgres_data**: Database files (persistent)
- **content**: Application content files (read-only mount)

To reset database:
```bash
docker-compose down
docker volume rm grammar-anatomy_postgres_data
docker-compose up -d
```

## Security Considerations

- Change default passwords in production
- Use strong secret keys
- Consider using Docker secrets for sensitive data
- Run containers as non-root users (already configured)
- Regularly update base images
- Use SSL/TLS in production with reverse proxy