#!/bin/bash

# Quick application management script
# Simplified wrapper around start.sh for common operations

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

case "${1:-start}" in
    "start"|"up")
        print_info "Starting Grammar Anatomy application..."
        ./start.sh -d
        ;;
    "dev")
        print_info "Starting in development mode with logs..."
        ./start.sh -l
        ;;
    "prod")
        print_info "Starting in production mode..."
        ./start.sh -e production -d
        ;;
    "stop"|"down")
        print_info "Stopping application..."
        ./start.sh --stop
        ;;
    "restart")
        print_info "Restarting application..."
        ./start.sh --restart
        ;;
    "logs")
        print_info "Showing application logs..."
        docker-compose logs -f
        ;;
    "status")
        print_info "Application status:"
        docker-compose ps
        ;;
    "build")
        print_info "Rebuilding application..."
        ./start.sh -b -d
        ;;
    "clean")
        print_info "Cleaning up application..."
        ./start.sh --clean
        ;;
    "shell-backend")
        print_info "Opening backend shell..."
        docker-compose exec backend bash
        ;;
    "shell-frontend")
        print_info "Opening frontend shell..."
        docker-compose exec frontend sh
        ;;
    "shell-db")
        print_info "Opening database shell..."
        docker-compose exec db psql -U postgres grammar_anatomy
        ;;
    "migrate")
        print_info "Running database migrations..."
        docker-compose exec backend alembic upgrade head
        ;;
    "test")
        print_info "Running tests..."
        docker-compose exec backend pytest
        docker-compose exec frontend npm test -- --watchAll=false
        ;;
    "help"|*)
        echo "Grammar Anatomy App Quick Commands"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  start, up      Start the application (detached)"
        echo "  dev            Start in development mode with logs"
        echo "  prod           Start in production mode"
        echo "  stop, down     Stop the application"
        echo "  restart        Restart the application"
        echo "  logs           Show application logs"
        echo "  status         Show service status"
        echo "  build          Rebuild and start"
        echo "  clean          Clean up everything"
        echo "  shell-backend  Open backend container shell"
        echo "  shell-frontend Open frontend container shell"
        echo "  shell-db       Open database shell"
        echo "  migrate        Run database migrations"
        echo "  test           Run all tests"
        echo "  help           Show this help"
        echo ""
        echo "Examples:"
        echo "  $0              Start application"
        echo "  $0 dev          Start with logs"
        echo "  $0 logs         View logs"
        echo "  $0 status       Check status"
        ;;
esac