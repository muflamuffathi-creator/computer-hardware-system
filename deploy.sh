#!/bin/bash

# Hardware E-Commerce AI - Docker Deployment Script (Linux/macOS)
# This script automates Docker deployment with PostgreSQL

set -euo pipefail

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="production"
ACTION="up"
CLEAN_VOLUMES=false
BUILD_IMAGES=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --action)
            ACTION="$2"
            shift 2
            ;;
        --clean)
            CLEAN_VOLUMES=true
            shift
            ;;
        --build)
            BUILD_IMAGES=true
            shift
            ;;
        --logs)
            ACTION="logs"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Helper functions
write_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║ $1${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
}

write_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

write_error() {
    echo -e "${RED}✗ $1${NC}"
}

write_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Check Docker installation
check_docker() {
    write_header "Checking Docker Installation"
    
    if ! command -v docker &> /dev/null; then
        write_error "Docker not found. Please install Docker Desktop."
        exit 1
    fi
    
    docker_version=$(docker --version)
    write_success "Docker installed: $docker_version"
    
    if ! docker compose version &> /dev/null; then
        write_error "Docker Compose not found. Please install Docker Desktop."
        exit 1
    fi
    
    write_success "Docker Compose installed"
}

# Check environment file
check_env_file() {
    write_header "Checking Environment Configuration"
    
    if [ ! -f .env ]; then
        write_info ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            write_success "Created .env file. Please update sensitive values!"
            write_info "Edit .env file and set:"
            write_info "  - DB_PASSWORD: Change to a secure password"
            write_info "  - JWT_SECRET: Generate a strong secret"
            return 1
        else
            write_error ".env.example not found!"
            exit 1
        fi
    else
        write_success ".env file found"
        return 0
    fi
}

# Clean up containers and volumes
clean_environment() {
    write_header "Cleaning Environment"
    
    write_info "Stopping containers..."
    docker compose down 2>/dev/null || true
    
    if [ "$CLEAN_VOLUMES" = true ]; then
        write_info "Removing volumes..."
        docker compose down -v 2>/dev/null || true
        write_success "Containers and volumes removed"
    else
        write_success "Containers stopped"
    fi
}

# Build Docker images
build_images() {
    write_header "Building Docker Images"
    
    write_info "Building backend image..."
    docker build -t hardware-ecommerce-backend ./backend --progress plain
    write_success "Backend image built"
    
    write_info "Building frontend image..."
    docker build -t hardware-ecommerce-frontend ./frontend --progress plain
    write_success "Frontend image built"
}

# Start containers
start_containers() {
    write_header "Starting Containers"
    
    write_info "Starting services with Docker Compose..."
    docker compose up -d
    
    write_success "Containers started successfully"
    
    write_info "Waiting for services to be ready..."
    sleep 5
    
    check_health
}

# Check service health
check_health() {
    write_header "Checking Service Health"
    
    local max_attempts=30
    local attempt=0
    
    # Check database
    write_info "Checking PostgreSQL..."
    while [ $attempt -lt $max_attempts ]; do
        if docker compose exec -T postgres pg_isready -U ecommerce &> /dev/null; then
            write_success "PostgreSQL is ready"
            break
        fi
        attempt=$((attempt + 1))
        if [ $attempt -eq 1 ]; then
            write_info "Waiting for database..."
        fi
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        write_error "PostgreSQL failed to start"
        return 1
    fi
    
    # Check backend
    write_info "Checking Backend API..."
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/health" | grep -q "200"; then
            write_success "Backend API is ready"
            break
        fi
        attempt=$((attempt + 1))
        if [ $attempt -eq 1 ]; then
            write_info "Waiting for backend..."
        fi
        sleep 2
    done
    
    # Check frontend
    write_info "Checking Frontend..."
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost/index.html" | grep -q "200"; then
            write_success "Frontend is ready"
            break
        fi
        attempt=$((attempt + 1))
        if [ $attempt -eq 1 ]; then
            write_info "Waiting for frontend..."
        fi
        sleep 2
    done
}

# Show logs
show_logs() {
    write_header "Service Logs"
    write_info "Press Ctrl+C to exit logs view"
    docker compose logs -f
}

# Display access information
show_access_info() {
    write_header "✓ Deployment Complete!"
    
    cat << EOF

${GREEN}═══════════════════════════════════════════════${NC}

${BLUE}📍 Access Points:${NC}
  Frontend:        ${GREEN}http://localhost${NC}
  Backend API:     ${GREEN}http://localhost:8080${NC}
  PostgreSQL:      ${GREEN}localhost:5432${NC}

${BLUE}📝 Demo Account:${NC}
  Email:    ${GREEN}dev@example.com${NC}
  Password: ${GREEN}P@ssw0rd${NC}

${BLUE}🛠️ Useful Commands:${NC}
  View logs:       ${YELLOW}docker compose logs -f${NC}
  Stop services:   ${YELLOW}docker compose down${NC}
  Restart backend: ${YELLOW}docker compose restart backend${NC}
  Connect to DB:   ${YELLOW}psql -h localhost -U ecommerce -d hardware_ecommerce${NC}

${GREEN}═══════════════════════════════════════════════${NC}

EOF
}

# Main execution
main() {
    write_header "Hardware E-Commerce AI - Docker Deployment"
    
    write_info "Environment: $ENVIRONMENT"
    write_info "Action: $ACTION"
    
    # Check Docker
    check_docker
    
    # Check environment file
    if ! check_env_file; then
        write_info "Please update .env file with your configuration and run again"
        exit 0
    fi
    
    # Handle different actions
    case "$ACTION" in
        up)
            if [ "$BUILD_IMAGES" = true ]; then
                build_images
            fi
            start_containers
            show_access_info
            ;;
        down)
            clean_environment
            ;;
        rebuild)
            clean_environment
            build_images
            start_containers
            show_access_info
            ;;
        restart)
            clean_environment
            start_containers
            show_access_info
            ;;
        logs)
            show_logs
            ;;
        status)
            write_header "Container Status"
            docker compose ps
            ;;
        *)
            write_error "Unknown action: $ACTION"
            write_info "Available actions: up, down, rebuild, restart, logs, status"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
