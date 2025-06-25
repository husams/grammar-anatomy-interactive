#!/bin/bash

# Grammar Anatomy Application Startup Script
# This script starts the entire application using Docker Compose

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Function to wait for service to be healthy
wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=0
    
    print_status "Waiting for $service to be healthy..."
    
    while [ $attempt -lt $max_attempts ]; do
        if docker-compose ps --services --filter "status=running" | grep -q "^${service}$"; then
            if [ "$(docker-compose ps -q $service | xargs docker inspect --format='{{.State.Health.Status}}' 2>/dev/null)" = "healthy" ]; then
                print_success "$service is healthy!"
                return 0
            fi
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    print_error "$service failed to become healthy within $((max_attempts * 2)) seconds"
    return 1
}

# Function to display usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --env ENV          Environment (development|production) [default: development]"
    echo "  -d, --detach           Run in detached mode"
    echo "  -b, --build            Force rebuild of images"
    echo "  -p, --pull             Pull latest images before starting"
    echo "  -l, --logs             Show logs after starting"
    echo "  -s, --stop             Stop the application"
    echo "  -r, --restart          Restart the application"
    echo "  -c, --clean            Clean up containers, networks, and volumes"
    echo "  -h, --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                     Start in development mode"
    echo "  $0 -e production -d    Start in production mode, detached"
    echo "  $0 -b -l               Build and start with logs"
    echo "  $0 --stop              Stop the application"
    echo "  $0 --clean             Clean up everything"
}

# Default values
ENVIRONMENT="development"
DETACHED=false
BUILD=false
PULL=false
LOGS=false
STOP=false
RESTART=false
CLEAN=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -d|--detach)
            DETACHED=true
            shift
            ;;
        -b|--build)
            BUILD=true
            shift
            ;;
        -p|--pull)
            PULL=true
            shift
            ;;
        -l|--logs)
            LOGS=true
            shift
            ;;
        -s|--stop)
            STOP=true
            shift
            ;;
        -r|--restart)
            RESTART=true
            shift
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ "$ENVIRONMENT" != "development" && "$ENVIRONMENT" != "production" ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Must be 'development' or 'production'"
    exit 1
fi

print_status "Grammar Anatomy Application Manager"
print_status "Environment: $ENVIRONMENT"

# Check prerequisites
print_status "Checking prerequisites..."

if ! command_exists docker; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! command_exists docker-compose; then
    print_error "Docker Compose is not installed or not in PATH"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker daemon is not running"
    exit 1
fi

print_success "Prerequisites check passed"

# Handle clean operation
if [ "$CLEAN" = true ]; then
    print_warning "This will remove all containers, networks, and volumes for this project"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up..."
        docker-compose down --volumes --remove-orphans
        docker system prune -f
        print_success "Cleanup complete"
    else
        print_status "Cleanup cancelled"
    fi
    exit 0
fi

# Handle stop operation
if [ "$STOP" = true ]; then
    print_status "Stopping Grammar Anatomy application..."
    docker-compose down
    print_success "Application stopped"
    exit 0
fi

# Handle restart operation
if [ "$RESTART" = true ]; then
    print_status "Restarting Grammar Anatomy application..."
    docker-compose restart
    print_success "Application restarted"
    exit 0
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found"
    if [ "$ENVIRONMENT" = "production" ]; then
        if [ -f ".env.production" ]; then
            print_status "Copying .env.production to .env"
            cp .env.production .env
        else
            print_error ".env.production file not found. Please create environment configuration."
            exit 1
        fi
    else
        print_status "Creating .env from template..."
        cat > .env << EOF
# Database Configuration
POSTGRES_DB=grammar_anatomy
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password123

# Backend Configuration
SECRET_KEY=your-secret-key-change-in-production-environment
ENVIRONMENT=development
DEBUG=true

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8000

# Docker Development Settings
COMPOSE_PROJECT_NAME=grammar-anatomy
EOF
        print_success "Created .env file with default values"
    fi
fi

# Check for port conflicts
print_status "Checking for port conflicts..."
PORTS_TO_CHECK=(3000 8000 5432)
CONFLICTS=false

for port in "${PORTS_TO_CHECK[@]}"; do
    if ! check_port $port; then
        print_warning "Port $port is already in use"
        CONFLICTS=true
    fi
done

if [ "$CONFLICTS" = true ]; then
    print_warning "Some ports are in use. The application may fail to start."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Startup cancelled"
        exit 1
    fi
fi

# Build compose command
COMPOSE_CMD="docker-compose"

# Add production override if needed
if [ "$ENVIRONMENT" = "production" ]; then
    COMPOSE_CMD="$COMPOSE_CMD -f docker-compose.yml -f docker-compose.prod.yml"
fi

# Pull images if requested
if [ "$PULL" = true ]; then
    print_status "Pulling latest images..."
    $COMPOSE_CMD pull
fi

# Build images if requested
if [ "$BUILD" = true ]; then
    print_status "Building images..."
    $COMPOSE_CMD build --no-cache
fi

# Start the application
print_status "Starting Grammar Anatomy application..."

if [ "$DETACHED" = true ]; then
    $COMPOSE_CMD up -d
else
    # Start in foreground, but handle Ctrl+C gracefully
    trap 'print_status "Shutting down..."; $COMPOSE_CMD down; exit 0' SIGINT SIGTERM
    
    if [ "$LOGS" = true ]; then
        $COMPOSE_CMD up
    else
        $COMPOSE_CMD up -d
        
        # Wait for services to be healthy
        wait_for_service "db"
        wait_for_service "backend"
        wait_for_service "frontend"
        
        print_success "All services are running and healthy!"
        echo ""
        print_status "Application URLs:"
        echo "  Frontend:        http://localhost:3000"
        echo "  Backend API:     http://localhost:8000"
        echo "  API Documentation: http://localhost:8000/docs"
        echo "  Database:        localhost:5432"
        echo ""
        print_status "To view logs: docker-compose logs -f"
        print_status "To stop: $0 --stop"
        echo ""
        
        if [ "$LOGS" = false ]; then
            read -p "Show logs now? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                docker-compose logs -f
            fi
        fi
    fi
fi