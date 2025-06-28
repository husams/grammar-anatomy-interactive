# Docker Compose Setup TODO List

## Plan
Convert the Grammar Anatomy Application's Docker Compose configuration into a reproducible setup with three services: PostgreSQL database, FastAPI backend, and React frontend.

## TODO List

### Database Service Setup
- [ ] Create PostgreSQL 15 Alpine container named `grammar-anatomy-db`
- [ ] Set environment variables: POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
- [ ] Configure port mapping 5432:5432
- [ ] Create named volume `postgres_data` for data persistence
- [ ] Mount init.sql file for database initialization
- [ ] Add health check with pg_isready command
- [ ] Set restart policy to unless-stopped
- [ ] Connect to grammar-anatomy-network

### Backend Service Setup  
- [ ] Build FastAPI container from ./backend/Dockerfile
- [ ] Name container `grammar-anatomy-backend`
- [ ] Configure DATABASE_URL environment variable pointing to db service
- [ ] Set SECRET_KEY, ENVIRONMENT, DEBUG environment variables
- [ ] Configure CORS origins for frontend communication
- [ ] Map port 8000:8000
- [ ] Add dependency on database service with health condition
- [ ] Mount ./content directory read-only to /app/content
- [ ] Add health check using Python requests to /health endpoint
- [ ] Set restart policy to unless-stopped
- [ ] Connect to grammar-anatomy-network

### Frontend Service Setup
- [ ] Build React container from ./frontend/Dockerfile  
- [ ] Name container `grammar-anatomy-frontend`
- [ ] Set REACT_APP_API_URL environment variable
- [ ] Map port 3000:80
- [ ] Add dependency on backend service
- [ ] Add health check using wget to /health endpoint
- [ ] Set restart policy to unless-stopped
- [ ] Connect to grammar-anatomy-network

### Network and Volume Configuration
- [ ] Create custom bridge network named `grammar-anatomy-network`
- [ ] Create local driver volume `postgres_data`
- [ ] Create production volume `postgres_prod_data` for prod override

### Development Override Configuration
- [ ] Mount backend source code for hot reloading (./backend:/app)
- [ ] Exclude __pycache__ and venv directories from mount
- [ ] Set DEBUG=true and ENVIRONMENT=development for backend
- [ ] Override backend command with uvicorn reload flag
- [ ] Set NODE_ENV=development for frontend

### Production Override Configuration
- [ ] Change all restart policies to always
- [ ] Use postgres_prod_data volume instead of postgres_data
- [ ] Remove default environment variable values
- [ ] Set DEBUG=false and ENVIRONMENT=production for backend
- [ ] Remove development volume mounts
- [ ] Set NODE_ENV=production for frontend

### Environment Variables Setup
- [ ] Create .env file template with all required variables
- [ ] Document POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
- [ ] Document SECRET_KEY for JWT authentication
- [ ] Document ENVIRONMENT and DEBUG flags
- [ ] Document REACT_APP_API_URL for frontend API communication

### Testing and Validation
- [ ] Test development setup with docker-compose up
- [ ] Test production setup with prod override file
- [ ] Verify health checks are working for all services
- [ ] Verify service dependencies and startup order
- [ ] Test volume persistence and data retention
- [ ] Verify network connectivity between services