# Docker Deployment Guide

## Quick Start (5 minutes)

### Prerequisites
- Docker Desktop installed ([download](https://www.docker.com/products/docker-desktop))
- 2GB free disk space
- Ports 80 and 5432 available

### One-Command Deployment

**Windows (PowerShell):**
```powershell
.\deploy.ps1 -Action up -BuildImages
```

**Linux/macOS (Bash):**
```bash
chmod +x deploy.sh
./deploy.sh --action up --build
```

That's it! Your application will be running at:
- **Frontend:** http://localhost
- **Backend API:** http://localhost:8080
- **PostgreSQL:** localhost:5432

---

## Manual Docker Deployment

### Step 1: Prepare Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings (optional)
# Default values are already configured for local development
```

### Step 2: Build Images
```bash
# Option A: Build with Docker Compose (automatic)
docker compose build

# Option B: Build manually
docker build -t hardware-ecommerce-backend ./backend
docker build -t hardware-ecommerce-frontend ./frontend
```

### Step 3: Start Services
```bash
# Start all services
docker compose up -d

# Wait 30 seconds for database initialization
# Check status
docker compose ps
```

### Step 4: Verify Deployment
```bash
# Check backend health
curl http://localhost:8080/api/health

# Check frontend
curl http://localhost/index.html

# View logs
docker compose logs -f
```

---

## Access Your Application

| Component | URL | Credentials |
|-----------|-----|-------------|
| Frontend | http://localhost | - |
| Backend API | http://localhost:8080 | - |
| PostgreSQL | localhost:5432 | See `.env` file |
| H2 Console (if enabled) | http://localhost:8080/h2-console | sa / (no password) |

### Demo Account
```
Email:    dev@example.com
Password: P@ssw0rd
```

---

## Common Docker Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Last 100 lines
docker compose logs --tail=100 backend
```

### Stop Services
```bash
# Graceful shutdown
docker compose down

# Stop and remove volumes (warning: deletes database)
docker compose down -v
```

### Restart Services
```bash
# Restart specific service
docker compose restart backend
docker compose restart frontend
docker compose restart postgres

# Restart all services
docker compose restart
```

### Execute Commands in Container
```bash
# Connect to database
docker compose exec postgres psql -U ecommerce -d hardware_ecommerce

# Run backend command
docker compose exec backend java -version

# View backend logs in container
docker compose exec backend cat /app/logs/app.log
```

### Scale Services
```bash
# Scale backend to 3 instances (requires load balancer)
docker compose up -d --scale backend=3
```

---

## Environment Variables

### Database Configuration
```env
DB_USER=ecommerce              # PostgreSQL username
DB_PASSWORD=secure_password    # PostgreSQL password (CHANGE THIS!)
DB_NAME=hardware_ecommerce     # Database name
DB_PORT=5432                   # PostgreSQL port
```

### Application Configuration
```env
JWT_SECRET=your_secret_key     # JWT signing secret (CHANGE THIS!)
JWT_EXPIRATION=86400000        # Token expiration (24 hours)
JPA_DDL_AUTO=validate          # JPA schema generation (validate|update|create|create-drop)
```

### Server Configuration
```env
BACKEND_PORT=8080              # Backend service port
FRONTEND_PORT=80               # Frontend service port
API_BASE_URL=http://localhost/api  # API URL for frontend
```

### Optional Configuration
```env
SPRING_PROFILES_ACTIVE=production  # Spring Boot profile
LOG_LEVEL=INFO                     # Logging level
```

---

## Production Deployment

### AWS Deployment

**Using ECR (Elastic Container Registry):**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag hardware-ecommerce-backend:latest ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/hardware-ecommerce-backend:latest

# Push to ECR
docker push ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/hardware-ecommerce-backend:latest

# Deploy to ECS/EKS
# Configure in AWS console or use AWS CLI
```

**Using Docker Hub:**
```bash
# Login to Docker Hub
docker login

# Tag image
docker tag hardware-ecommerce-backend:latest YOUR_USERNAME/hardware-ecommerce-backend:latest

# Push to Docker Hub
docker push YOUR_USERNAME/hardware-ecommerce-backend:latest
```

### Azure Deployment

**Using Azure Container Registry:**
```bash
# Login to ACR
az acr login --name myregistry

# Tag image
docker tag hardware-ecommerce-backend:latest myregistry.azurecr.io/hardware-ecommerce-backend:latest

# Push to ACR
docker push myregistry.azurecr.io/hardware-ecommerce-backend:latest

# Deploy to Azure Container Instances or App Service
az container create --resource-group mygroup --name backend --image myregistry.azurecr.io/hardware-ecommerce-backend:latest
```

### Kubernetes Deployment

See `kubernetes-deployment.yml` for full Kubernetes manifest.

```bash
# Deploy to Kubernetes
kubectl apply -f kubernetes-deployment.yml

# Check status
kubectl get pods
kubectl get services

# View logs
kubectl logs -f deployment/hardware-ecommerce-backend
```

---

## Performance Optimization

### Image Size Reduction
```bash
# Check image size
docker images

# Multi-stage builds are already implemented
# Frontend: ~10MB
# Backend: ~300MB
```

### Network Optimization
```bash
# Enable Bridge mode in Docker Desktop settings
# Set memory limit in docker-compose.yml
# Adjust CPU shares if needed
```

### Database Optimization
```sql
-- Create indexes for faster queries
CREATE INDEX idx_user_email ON "User"(email);
CREATE INDEX idx_product_category ON Product(category_id);
CREATE INDEX idx_order_user ON "Order"(user_id);
```

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :8080
lsof -i :5432

# Kill process
kill -9 <PID>

# Or use different port in .env
BACKEND_PORT=8081
FRONTEND_PORT=8000
```

### Containers Won't Start

**Check logs:**
```bash
docker compose logs backend
docker compose logs postgres
docker compose logs frontend
```

**Common issues:**
```bash
# Database connection failed
# → Check DB_PASSWORD in .env
# → Wait for postgres to be healthy: docker compose ps

# Port conflicts
# → Change port in .env or kill process

# Out of memory
# → Increase Docker Desktop memory limit
# → Reduce container resource limits
```

### Database Issues

**Reset database:**
```bash
# Remove volumes (WARNING: deletes all data)
docker compose down -v

# Restart with fresh database
docker compose up -d
```

**Connect to database:**
```bash
# PostgreSQL
docker compose exec postgres psql -U ecommerce -d hardware_ecommerce

# MySQL (if using MySQL backend)
docker compose exec mysql mysql -u root -p
```

**Backup database:**
```bash
# PostgreSQL backup
docker compose exec postgres pg_dump -U ecommerce hardware_ecommerce > backup.sql

# PostgreSQL restore
docker compose exec -T postgres psql -U ecommerce hardware_ecommerce < backup.sql
```

### Application Issues

**Check application logs:**
```bash
# View all logs
docker compose logs

# Follow backend logs
docker compose logs -f backend

# Specific number of lines
docker compose logs --tail=50 backend
```

**Restart stuck container:**
```bash
docker compose restart backend
# Wait 10 seconds for Java startup
```

---

## Monitoring

### Health Checks
```bash
# Backend health
curl http://localhost:8080/api/health

# Frontend health  
curl -I http://localhost

# Database health
docker compose exec postgres pg_isready
```

### Container Stats
```bash
# Real-time stats
docker stats

# Specific container
docker stats hardware-ecommerce-backend
```

### Docker Events
```bash
# Watch Docker events
docker events --filter type=container
```

---

## Cleanup

### Remove Containers
```bash
# Stop and remove containers
docker compose down

# Remove images
docker rmi hardware-ecommerce-backend hardware-ecommerce-frontend
```

### Prune Unused Resources
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune

# Complete cleanup
docker system prune -a --volumes
```

---

## Security Best Practices

1. **Change Default Passwords**
   - Always update `JWT_SECRET` in `.env`
   - Change `DB_PASSWORD`
   - Use strong, unique passwords

2. **Environment Variables**
   - Never commit `.env` file to git
   - Use `.env.example` for template
   - Rotate secrets regularly

3. **Image Security**
   - Scan images for vulnerabilities: `docker scan IMAGE_ID`
   - Keep base images updated
   - Use specific version tags, not `latest`

4. **Runtime Security**
   - Use read-only filesystems where possible
   - Run containers as non-root user
   - Limit container capabilities
   - Use network policies

5. **Access Control**
   - Use private registries
   - Restrict Docker socket access
   - Enable authentication for registries
   - Use HTTPS for all communications

---

## Documentation

- **API Reference:** See `documentation/api_docs.md`
- **Deployment Guide:** See `DEPLOYMENT_QUICK_START.md`
- **Architecture:** See `documentation/diagrams.md`
- **Requirements:** See `documentation/srs.md`

---

## Support

For issues or questions:
1. Check logs: `docker compose logs -f`
2. Review troubleshooting section above
3. Check Docker documentation: https://docs.docker.com
4. Create GitHub issue with logs

---

**Last Updated:** June 16, 2026  
**Version:** 1.0.0
