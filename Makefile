# Grammar Anatomy Application Makefile
# Provides convenient commands for managing the Docker-based application

.PHONY: help start stop restart status logs build clean dev prod test migrate shell-backend shell-frontend shell-db

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "Grammar Anatomy Application Management"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  %-15s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

start: ## Start the application in detached mode
	@./start.sh -d

dev: ## Start in development mode with logs
	@./start.sh -l

prod: ## Start in production mode
	@./start.sh -e production -d

stop: ## Stop the application
	@./start.sh --stop

restart: ## Restart the application
	@./start.sh --restart

status: ## Show service status
	@docker-compose ps

logs: ## Show application logs
	@docker-compose logs -f

build: ## Rebuild and start the application
	@./start.sh -b -d

clean: ## Clean up containers, networks, and volumes
	@./start.sh --clean

test: ## Run all tests
	@docker-compose exec backend pytest
	@docker-compose exec frontend npm test -- --watchAll=false

migrate: ## Run database migrations
	@docker-compose exec backend alembic upgrade head

shell-backend: ## Open backend container shell
	@docker-compose exec backend bash

shell-frontend: ## Open frontend container shell
	@docker-compose exec frontend sh

shell-db: ## Open database shell
	@docker-compose exec db psql -U postgres grammar_anatomy

# Docker Compose shortcuts
up: start ## Alias for start
down: stop ## Alias for stop
ps: status ## Alias for status

# Development helpers
install-backend: ## Install backend dependencies
	@docker-compose exec backend pip install -r requirements.txt

install-frontend: ## Install frontend dependencies
	@docker-compose exec frontend npm install

lint-backend: ## Run backend linting
	@docker-compose exec backend black app/
	@docker-compose exec backend isort app/
	@docker-compose exec backend flake8 app/

lint-frontend: ## Run frontend linting
	@docker-compose exec frontend npm run lint:fix

format: lint-backend lint-frontend ## Format all code

# Database operations
db-backup: ## Create database backup
	@docker-compose exec db pg_dump -U postgres grammar_anatomy > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Database backup created: backup_$(shell date +%Y%m%d_%H%M%S).sql"

db-restore: ## Restore database from backup (requires BACKUP_FILE variable)
	@if [ -z "$(BACKUP_FILE)" ]; then echo "Usage: make db-restore BACKUP_FILE=backup.sql"; exit 1; fi
	@docker-compose exec -T db psql -U postgres grammar_anatomy < $(BACKUP_FILE)
	@echo "Database restored from $(BACKUP_FILE)"

# Monitoring
health: ## Check service health
	@echo "Checking service health..."
	@docker-compose exec backend python -c "import requests; requests.get('http://localhost:8000/health')" && echo "✓ Backend healthy"
	@docker-compose exec frontend wget --no-verbose --tries=1 --spider http://localhost:80/health && echo "✓ Frontend healthy"
	@docker-compose exec db pg_isready -U postgres && echo "✓ Database healthy"

# Cleanup operations
clean-images: ## Remove unused Docker images
	@docker image prune -f

clean-volumes: ## Remove unused Docker volumes
	@docker volume prune -f

clean-all: clean clean-images clean-volumes ## Complete cleanup