#!/bin/bash

# Dax Learning Platform Deployment Script
# This script handles both development and production deployment

set -e

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

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    local missing_deps=()
    
    if ! command_exists node; then
        missing_deps+=("Node.js")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists docker; then
        missing_deps+=("Docker")
    fi
    
    if ! command_exists docker-compose; then
        missing_deps+=("Docker Compose")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
            print_warning "Please edit .env file with your configuration"
        else
            print_error ".env.example not found"
            exit 1
        fi
    else
        print_status ".env file already exists"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    npm install
    
    # Install client dependencies
    cd client && npm install && cd ..
    
    # Install server dependencies
    cd server && npm install && cd ..
    
    print_success "Dependencies installed successfully"
}

# Function to build application
build_application() {
    print_status "Building application..."
    
    # Build client
    cd client && npm run build && cd ..
    
    print_success "Application built successfully"
}

# Function to start development environment
start_development() {
    print_status "Starting development environment..."
    
    # Start MongoDB if not running
    if ! docker ps | grep -q mongodb; then
        print_status "Starting MongoDB..."
        docker run -d --name dax-mongodb-dev \
            -p 27017:27017 \
            -e MONGO_INITDB_ROOT_USERNAME=daxadmin \
            -e MONGO_INITDB_ROOT_PASSWORD=daxpassword123 \
            -e MONGO_INITDB_DATABASE=dax-learning \
            mongo:6.0
    fi
    
    # Start Redis if not running
    if ! docker ps | grep -q redis; then
        print_status "Starting Redis..."
        docker run -d --name dax-redis-dev \
            -p 6379:6379 \
            redis:7-alpine
    fi
    
    # Start the application
    npm run dev
}

# Function to start production environment
start_production() {
    print_status "Starting production environment with Docker Compose..."
    
    # Create SSL certificates for development
    if [ ! -d nginx/ssl ]; then
        mkdir -p nginx/ssl
        print_status "Generating SSL certificates for development..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    fi
    
    # Create logs directory
    mkdir -p nginx/logs
    
    # Start all services
    docker-compose up -d
    
    print_success "Production environment started successfully"
    print_status "Access the application at:"
    print_status "  - Frontend: http://localhost:3000"
    print_status "  - Backend API: http://localhost:5000"
    print_status "  - MongoDB Express: http://localhost:8081"
    print_status "  - Nginx (HTTPS): https://localhost"
}

# Function to stop production environment
stop_production() {
    print_status "Stopping production environment..."
    docker-compose down
    print_success "Production environment stopped"
}

# Function to view logs
view_logs() {
    local service=${1:-"all"}
    
    case $service in
        "frontend"|"backend"|"mongodb"|"redis"|"nginx")
            docker-compose logs -f $service
            ;;
        "all")
            docker-compose logs -f
            ;;
        *)
            print_error "Invalid service: $service"
            print_status "Available services: frontend, backend, mongodb, redis, nginx, all"
            exit 1
            ;;
    esac
}

# Function to backup database
backup_database() {
    print_status "Creating database backup..."
    
    local backup_dir="./backups"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$backup_dir/dax_backup_$timestamp.gz"
    
    mkdir -p $backup_dir
    
    docker exec dax-mongodb mongodump --archive --gzip > "$backup_file"
    
    print_success "Database backup created: $backup_file"
}

# Function to restore database
restore_database() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify backup file"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_status "Restoring database from: $backup_file"
    
    docker exec -i dax-mongodb mongorestore --archive --gzip < "$backup_file"
    
    print_success "Database restored successfully"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Run backend tests
    cd server && npm test && cd ..
    
    # Run frontend tests
    cd client && npm test -- --watchAll=false && cd ..
    
    print_success "Tests completed"
}

# Function to show status
show_status() {
    print_status "Application Status:"
    
    if docker ps | grep -q dax; then
        print_success "Production containers are running"
        docker ps --filter "name=dax"
    else
        print_warning "No production containers are running"
    fi
    
    # Check if development servers are running
    if pgrep -f "node.*server" > /dev/null; then
        print_success "Development server is running"
    else
        print_warning "Development server is not running"
    fi
}

# Function to show help
show_help() {
    echo "Dax Learning Platform Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev          Start development environment"
    echo "  prod         Start production environment with Docker"
    echo "  stop         Stop production environment"
    echo "  build        Build the application"
    echo "  install      Install dependencies"
    echo "  test         Run tests"
    echo "  logs [SERVICE] View logs (services: frontend, backend, mongodb, redis, nginx, all)"
    echo "  backup       Create database backup"
    echo "  restore FILE Restore database from backup file"
    echo "  status       Show application status"
    echo "  help         Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev                    # Start development"
    echo "  $0 prod                   # Start production"
    echo "  $0 logs backend           # View backend logs"
    echo "  $0 backup                 # Create database backup"
    echo "  $0 restore backup.gz      # Restore from backup"
}

# Main script logic
case "${1:-help}" in
    "dev")
        check_prerequisites
        setup_environment
        install_dependencies
        start_development
        ;;
    "prod")
        check_prerequisites
        setup_environment
        start_production
        ;;
    "stop")
        stop_production
        ;;
    "build")
        check_prerequisites
        install_dependencies
        build_application
        ;;
    "install")
        check_prerequisites
        install_dependencies
        ;;
    "test")
        check_prerequisites
        run_tests
        ;;
    "logs")
        view_logs $2
        ;;
    "backup")
        backup_database
        ;;
    "restore")
        restore_database $2
        ;;
    "status")
        show_status
        ;;
    "help"|*)
        show_help
        ;;
esac