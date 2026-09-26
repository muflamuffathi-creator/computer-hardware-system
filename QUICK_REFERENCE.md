# Quick Reference Card

## 🚀 Start Application (Local)

### Development Mode
```bash
# Backend (Terminal 1)
cd backend && mvn spring-boot:run

# Frontend (Terminal 2)
cd frontend && npm run dev

# Access: http://localhost:5173
```

### Docker Mode (Recommended)
```bash
# Start everything
docker compose up -d

# View logs
docker compose logs -f

# Stop everything
docker compose down

# Access: http://localhost
```

---

## 🧪 Testing

### Unit Tests
```bash
cd backend && mvn test
```

### E2E Tests
```bash
cd frontend
npx playwright install --with-deps
npm run test:e2e
```

### Manual Testing
```
Frontend: http://localhost:5173
Backend:  http://localhost:8080
API:      http://localhost:8080/api
```

---

## 📦 Build for Production

### Backend JAR
```bash
cd backend
mvn clean package
# Output: target/ecommerce-ai-0.0.1-SNAPSHOT.jar
```

### Frontend Bundle
```bash
cd frontend
npm run build
# Output: dist/
```

### Docker Images
```bash
docker compose build
# or
docker build -t hw-backend ./backend
docker build -t hw-frontend ./frontend
```

---

## 🐳 Docker Commands

| Command | Purpose |
|---------|---------|
| `docker compose up -d` | Start services |
| `docker compose down` | Stop services |
| `docker compose ps` | View status |
| `docker compose logs -f` | Follow logs |
| `docker compose exec backend bash` | Shell access |
| `docker compose restart backend` | Restart service |
| `docker compose down -v` | Stop + delete volumes |

---

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/register           
POST   /api/auth/login              
POST   /api/auth/refresh            
POST   /api/auth/logout             
```

### Products
```
GET    /api/products                
GET    /api/products/{id}           
GET    /api/categories              
GET    /api/brands                  
```

### Shopping
```
GET    /api/cart                    
POST   /api/cart/add                
PUT    /api/cart/update             
DELETE /api/cart/remove/{id}        
POST   /api/orders                  
GET    /api/orders                  
```

### AI Features
```
POST   /api/chat                    
GET    /api/chat/history            
POST   /api/compatibility-check     
```

---

## 🔐 Default Credentials

```
Email:    dev@example.com
Password: P@ssw0rd
Role:     USER

Admin:    admin@example.com
Password: Admin@123
Role:     ADMIN
```

---

## 📝 Configuration Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables |
| `backend/application.properties` | Backend config |
| `frontend/vite.config.js` | Frontend build config |
| `docker-compose.yml` | Docker Compose config |
| `.github/workflows/ci.yml` | CI/CD workflow |

---

## 🛠️ Database Access

### PostgreSQL (Docker)
```bash
docker compose exec postgres psql -U ecommerce -d hardware_ecommerce

# Common commands
\dt                     # List tables
\d table_name          # Describe table
SELECT * FROM "User";  # Query users
\q                     # Exit
```

### H2 Console (Local Dev)
```
URL: http://localhost:8080/h2-console
Username: sa
Password: (empty)
```

---

## 📊 Important Ports

| Port | Service | Access |
|------|---------|--------|
| 80 | Frontend (Docker) | http://localhost |
| 5173 | Frontend (Dev) | http://localhost:5173 |
| 8080 | Backend API | http://localhost:8080 |
| 5432 | PostgreSQL | localhost:5432 |
| 3306 | MySQL | localhost:3306 (if used) |

---

## 🚢 Deployment Quick Start

### Docker Compose (5 min)
```bash
docker compose up -d
# http://localhost
```

### Kubernetes (15 min)
```bash
kubectl apply -f kubernetes-deployment.yml
kubectl get pods -n hardware-ecommerce
```

### AWS (30 min)
```bash
# See CI_CD_GUIDE.md for full instructions
```

### Azure (30 min)
```bash
# See CI_CD_GUIDE.md for full instructions
```

---

## 🔍 Debugging

### Check Service Status
```bash
docker compose ps
curl http://localhost:8080/api/health
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f postgres

# Last 50 lines
docker compose logs --tail=50 backend
```

### Clear Everything
```bash
docker compose down -v
rm -rf frontend/node_modules
rm -rf backend/target
```

---

## 📁 Important Files

```
.
├── backend/
│   ├── src/main/java/com/hardware/ecommerce/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── database/
│   ├── schema.sql
│   └── seed_data.sql
├── documentation/
│   ├── api_docs.md
│   └── deployment_guide.md
├── .github/workflows/
│   └── ci.yml
├── docker-compose.yml
├── .env.example
├── deploy.ps1
├── deploy.sh
├── kubernetes-deployment.yml
└── README.md
```

---

## ⚡ Performance Tips

1. **Use Docker** for consistent environments
2. **Cache dependencies** to speed up builds
3. **Use .dockerignore** to reduce image size
4. **Enable Kubernetes HPA** for auto-scaling
5. **Use CDN** for static assets
6. **Enable compression** in NGINX
7. **Use connection pooling** for database
8. **Monitor metrics** regularly

---

## 🔒 Security Checklist

- [ ] Change JWT_SECRET in .env
- [ ] Change database password
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall
- [ ] Set up backups
- [ ] Enable logging
- [ ] Add rate limiting
- [ ] Update dependencies regularly

---

## 📚 Full Documentation

- **Project Overview:** `README.md`
- **Deployment:** `DEPLOYMENT_QUICK_START.md`
- **Docker:** `DOCKER_GUIDE.md`
- **CI/CD:** `CI_CD_GUIDE.md`
- **Production:** `PRODUCTION_READY.md`
- **Project Status:** `COMPLETION_REPORT.md`
- **Handoff:** `PROJECT_HANDOFF.md`

---

## 🆘 Quick Help

**App won't start?**
```bash
docker compose logs -f
```

**Database error?**
```bash
docker compose restart postgres
```

**Port in use?**
```bash
lsof -i :8080
kill -9 <PID>
```

**Need to reset?**
```bash
docker compose down -v
docker compose up -d
```

---

## 🎯 Useful Links

- **Docker Docs:** https://docs.docker.com
- **Spring Boot:** https://spring.io/projects/spring-boot
- **React:** https://react.dev
- **PostgreSQL:** https://postgresql.org
- **Kubernetes:** https://kubernetes.io
- **GitHub Actions:** https://github.com/features/actions

---

**Bookmark this page! Last Updated: June 16, 2026**
