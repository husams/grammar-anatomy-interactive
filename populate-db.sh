#!/bin/bash

# Grammar Anatomy Database Population Script
# This script populates the database with sample content for testing

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_info() {
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

print_info "Grammar Anatomy Database Population"
echo "======================================="

# Check if we're in the right directory
if [ ! -f "backend/populate_db.py" ]; then
    print_error "populate_db.py not found. Please run this script from the project root directory."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "backend/venv" ]; then
    print_warning "Virtual environment not found. Creating one..."
    cd backend
    python -m venv venv
    cd ..
fi

print_info "Activating virtual environment..."
source backend/venv/bin/activate || {
    print_error "Failed to activate virtual environment"
    exit 1
}

print_info "Installing/updating dependencies..."
pip install -r backend/requirements.txt || {
    print_error "Failed to install dependencies"
    exit 1
}

print_info "Running database population script..."
cd backend
python populate_db.py || {
    print_error "Database population failed"
    exit 1
}

print_success "Database population completed successfully!"
print_info "You can now start the application with: ./start.sh"