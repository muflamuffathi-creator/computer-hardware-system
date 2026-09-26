# Hardware E-Commerce AI - Docker Deployment Script (Windows PowerShell)
# This script automates Docker deployment with PostgreSQL

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [string]$Action = "up",
    
    [Parameter(Mandatory=$false)]
    [switch]$Clean,
    
    [Parameter(Mandatory=$false)]
    [switch]$BuildImages,
    
    [Parameter(Mandatory=$false)]
    [switch]$Logs
)

# Color output
$Green = [char]27 + "[32m"
$Red = [char]27 + "[31m"
$Yellow = [char]27 + "[33m"
$Blue = [char]27 + "[34m"
$Reset = [char]27 + "[0m"

function Write-Header {
    param([string]$Message)
    Write-Host "`n$Blue╔════════════════════════════════════════════════╗$Reset"
    Write-Host "$Blue║ $Message$Reset"
    Write-Host "$Blue╚════════════════════════════════════════════════╝$Reset"
}

function Write-Success {
    param([string]$Message)
    Write-Host "$Green✓ $Message$Reset"
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "$Red✗ $Message$Reset"
}

function Write-Info {
    param([string]$Message)
    Write-Host "$Yellow→ $Message$Reset"
}

# Check Docker installation
function Check-Docker {
    Write-Header "Checking Docker Installation"
    
    try {
        $dockerVersion = docker --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker installed: $dockerVersion"
            
            # Check Docker Compose
            $composeVersion = docker compose version 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Docker Compose installed"
            } else {
                Write-Error-Custom "Docker Compose not found. Please install Docker Desktop."
                exit 1
            }
        } else {
            Write-Error-Custom "Docker not found. Please install Docker Desktop."
            exit 1
        }
    } catch {
        Write-Error-Custom "Error checking Docker: $_"
        exit 1
    }
}

# Check environment file
function Check-Env-File {
    Write-Header "Checking Environment Configuration"
    
    if (-not (Test-Path ".env")) {
        Write-Info ".env file not found. Creating from .env.example..."
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Success "Created .env file. Please update sensitive values!"
            Write-Info "Edit .env file and set:"
            Write-Info "  - DB_PASSWORD: Change to a secure password"
            Write-Info "  - JWT_SECRET: Generate a strong secret"
            return $false
        } else {
            Write-Error-Custom ".env.example not found!"
            exit 1
        }
    } else {
        Write-Success ".env file found"
        return $true
    }
}

# Clean up containers and volumes
function Clean-Environment {
    Write-Header "Cleaning Environment"
    
    Write-Info "Stopping containers..."
    docker compose down 2>$null
    
    if ($Clean) {
        Write-Info "Removing volumes..."
        docker compose down -v 2>$null
        Write-Success "Containers and volumes removed"
    } else {
        Write-Success "Containers stopped"
    }
}

# Build Docker images
function Build-Images {
    Write-Header "Building Docker Images"
    
    Write-Info "Building backend image..."
    docker build -t hardware-ecommerce-backend ./backend --progress plain
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to build backend image"
        exit 1
    }
    Write-Success "Backend image built"
    
    Write-Info "Building frontend image..."
    docker build -t hardware-ecommerce-frontend ./frontend --progress plain
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Failed to build frontend image"
        exit 1
    }
    Write-Success "Frontend image built"
}

# Start containers
function Start-Containers {
    Write-Header "Starting Containers"
    
    Write-Info "Starting services with Docker Compose..."
    docker compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Containers started successfully"
        
        # Wait for services to be healthy
        Write-Info "Waiting for services to be ready..."
        Start-Sleep -Seconds 5
        
        Check-Health
    } else {
        Write-Error-Custom "Failed to start containers"
        exit 1
    }
}

# Check service health
function Check-Health {
    Write-Header "Checking Service Health"
    
    $maxAttempts = 30
    $attempt = 0
    
    # Check database
    Write-Info "Checking PostgreSQL..."
    while ($attempt -lt $maxAttempts) {
        $result = docker compose exec -T postgres pg_isready -U ecommerce 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "PostgreSQL is ready"
            break
        }
        $attempt++
        if ($attempt -eq 1) { Write-Info "Waiting for database..." }
        Start-Sleep -Seconds 2
    }
    
    if ($attempt -eq $maxAttempts) {
        Write-Error-Custom "PostgreSQL failed to start"
        return $false
    }
    
    # Check backend
    Write-Info "Checking Backend API..."
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        $result = curl.exe -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/health" 2>$null
        if ($result -eq "200") {
            Write-Success "Backend API is ready"
            break
        }
        $attempt++
        if ($attempt -eq 1) { Write-Info "Waiting for backend..." }
        Start-Sleep -Seconds 2
    }
    
    # Check frontend
    Write-Info "Checking Frontend..."
    $attempt = 0
    while ($attempt -lt $maxAttempts) {
        $result = curl.exe -s -o /dev/null -w "%{http_code}" "http://localhost/index.html" 2>$null
        if ($result -eq "200") {
            Write-Success "Frontend is ready"
            break
        }
        $attempt++
        if ($attempt -eq 1) { Write-Info "Waiting for frontend..." }
        Start-Sleep -Seconds 2
    }
    
    return $true
}

# Show logs
function Show-Logs {
    Write-Header "Service Logs"
    Write-Info "Press Ctrl+C to exit logs view"
    docker compose logs -f
}

# Display access information
function Show-Access-Info {
    Write-Header "✓ Deployment Complete!"
    
    Write-Host "`n$Green═══════════════════════════════════════════════$Reset`n"
    Write-Host "$Blue📍 Access Points:$Reset"
    Write-Host "  Frontend:        $Green http://localhost$Reset"
    Write-Host "  Backend API:     $Green http://localhost:8080$Reset"
    Write-Host "  PostgreSQL:      $Green localhost:5432$Reset"
    Write-Host ""
    Write-Host "$Blue📝 Demo Account:$Reset"
    Write-Host "  Email:    $Green dev@example.com$Reset"
    Write-Host "  Password: $Green P@ssw0rd$Reset"
    Write-Host ""
    Write-Host "$Blue🛠️ Useful Commands:$Reset"
    Write-Host "  View logs:       $Yellow docker compose logs -f$Reset"
    Write-Host "  Stop services:   $Yellow docker compose down$Reset"
    Write-Host "  Restart backend: $Yellow docker compose restart backend$Reset"
    Write-Host "  Connect to DB:   $Yellow psql -h localhost -U ecommerce -d hardware_ecommerce$Reset"
    Write-Host "`n$Green═══════════════════════════════════════════════$Reset`n"
}

# Main execution
function Main {
    Write-Header "Hardware E-Commerce AI - Docker Deployment"
    
    Write-Info "Environment: $Environment"
    Write-Info "Action: $Action"
    
    # Check Docker
    Check-Docker
    
    # Check environment file
    $envReady = Check-Env-File
    
    if (-not $envReady) {
        Write-Info "Please update .env file with your configuration and run again"
        exit 0
    }
    
    # Handle different actions
    switch ($Action.ToLower()) {
        "up" {
            if ($BuildImages) {
                Build-Images
            }
            Start-Containers
            Show-Access-Info
        }
        "down" {
            Clean-Environment
        }
        "rebuild" {
            Clean-Environment
            Build-Images
            Start-Containers
            Show-Access-Info
        }
        "restart" {
            Clean-Environment
            Start-Containers
            Show-Access-Info
        }
        "logs" {
            Show-Logs
        }
        "status" {
            Write-Header "Container Status"
            docker compose ps
        }
        default {
            Write-Error-Custom "Unknown action: $Action"
            Write-Info "Available actions: up, down, rebuild, restart, logs, status"
            exit 1
        }
    }
}

# Run main function
try {
    Main
} catch {
    Write-Error-Custom "An error occurred: $_"
    exit 1
}
