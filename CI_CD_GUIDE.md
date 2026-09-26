# CI/CD & Production Deployment Guide

## Overview

This guide explains how to set up continuous integration and continuous deployment (CI/CD) for the Hardware E-Commerce AI platform using GitHub Actions.

---

## GitHub Actions Workflow

### Current Workflow Location
`.github/workflows/ci.yml`

### What It Does

1. **Checkout Code** - Pull latest code from repository
2. **Set up Java 17** - Prepare Java environment for backend
3. **Set up Node 18** - Prepare Node environment for frontend
4. **Build Backend** - Compile Spring Boot application with Maven
5. **Start Backend** - Run backend service (port 8080)
6. **Install Frontend Dependencies** - npm ci for frontend
7. **Build Frontend** - Create production build with Vite
8. **Start Frontend Preview** - Run frontend preview server (port 5173)
9. **Install Playwright** - Download browser for E2E tests
10. **Run E2E Tests** - Execute Playwright end-to-end tests

### Trigger Events

The workflow runs automatically on:
- Push to `main` branch
- Pull requests to `main` branch
- Manual trigger via GitHub UI

---

## Setting Up GitHub Actions Secrets

### Required Secrets for Production

Create these secrets in GitHub repository settings:

```
Settings → Secrets and variables → Actions → New repository secret
```

**Required Secrets:**

| Secret | Value | Example |
|--------|-------|---------|
| `DB_PASSWORD` | PostgreSQL password | `MySecurePassword123!` |
| `JWT_SECRET` | JWT signing key (32+ chars) | `your_super_secret_jwt_key_here` |
| `DOCKER_REGISTRY_USERNAME` | Docker Hub username | `yourusername` |
| `DOCKER_REGISTRY_PASSWORD` | Docker Hub token | `dckr_pat_xxx` |
| `AWS_ACCESS_KEY_ID` | AWS credentials | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret | `aws_secret...` |
| `STRIPE_API_KEY` | Stripe API key (optional) | `sk_live_...` |
| `DEPLOYMENT_SSH_KEY` | SSH key for deployment | (private key) |

### Optional Secrets

```
OPENAI_API_KEY=sk_your_openai_key
SENDGRID_API_KEY=SG_your_key
```

---

## Advanced Workflow Configuration

### Deploy to AWS on Push to Main

Add this job to `.github/workflows/ci.yml`:

```yaml
  deploy-aws:
    needs: e2e
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push backend image to ECR
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: ${{ steps.login-ecr.outputs.registry }}/hardware-ecommerce-backend:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster production \
            --service backend \
            --force-new-deployment
```

### Deploy to Azure on Push to Main

Add this job to `.github/workflows/ci.yml`:

```yaml
  deploy-azure:
    needs: e2e
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Deploy to Azure Container Instances
        run: |
          az container create \
            --resource-group mygroup \
            --name hardware-ecommerce-backend \
            --image myregistry.azurecr.io/hardware-ecommerce-backend:latest \
            --environment-variables \
              SPRING_DATASOURCE_URL=${{ secrets.DB_URL }} \
              JWT_SECRET=${{ secrets.JWT_SECRET }}
```

### Deploy to Kubernetes

Add this job to `.github/workflows/ci.yml`:

```yaml
  deploy-k8s:
    needs: e2e
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up kubectl
        uses: azure/setup-kubectl@v3
        with:
          version: 'latest'
      
      - name: Configure kubeconfig
        run: |
          mkdir -p $HOME/.kube
          echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > $HOME/.kube/config
      
      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f kubernetes-deployment.yml
          kubectl set image deployment/backend \
            backend=myregistry.azurecr.io/hardware-ecommerce-backend:${{ github.sha }} \
            -n hardware-ecommerce
```

---

## Manual Deployment Scripts

### Deploy to Docker Hub

```bash
#!/bin/bash

# Variables
DOCKER_USERNAME="your-username"
VERSION=$(date +%Y%m%d-%H%M%S)

# Login to Docker Hub
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

# Build backend
docker build -t $DOCKER_USERNAME/hardware-ecommerce-backend:$VERSION ./backend
docker tag $DOCKER_USERNAME/hardware-ecommerce-backend:$VERSION $DOCKER_USERNAME/hardware-ecommerce-backend:latest
docker push $DOCKER_USERNAME/hardware-ecommerce-backend:$VERSION
docker push $DOCKER_USERNAME/hardware-ecommerce-backend:latest

# Build frontend
docker build -t $DOCKER_USERNAME/hardware-ecommerce-frontend:$VERSION ./frontend
docker tag $DOCKER_USERNAME/hardware-ecommerce-frontend:$VERSION $DOCKER_USERNAME/hardware-ecommerce-frontend:latest
docker push $DOCKER_USERNAME/hardware-ecommerce-frontend:$VERSION
docker push $DOCKER_USERNAME/hardware-ecommerce-frontend:latest

echo "Deployment complete!"
```

### Deploy to Production Server via SSH

```bash
#!/bin/bash

# Variables
REMOTE_HOST="your-server.com"
REMOTE_USER="deploy"
APP_DIR="/app/hardware-ecommerce"

# SSH commands
ssh -i deploy_key.pem $REMOTE_USER@$REMOTE_HOST << 'EOF'
  cd $APP_DIR
  
  # Stop old containers
  docker compose down
  
  # Pull latest images
  docker pull your-registry/hardware-ecommerce-backend:latest
  docker pull your-registry/hardware-ecommerce-frontend:latest
  
  # Update environment
  cp .env.backup .env
  
  # Start new containers
  docker compose up -d
  
  # Verify deployment
  sleep 10
  curl http://localhost:8080/api/health
EOF
```

---

## GitHub Actions Secrets for Deployments

### AWS Deployment Secrets

```yaml
AWS_ACCESS_KEY_ID: AKIA...
AWS_SECRET_ACCESS_KEY: aws_secret...
AWS_REGION: us-east-1
```

### Azure Deployment Secrets

```yaml
AZURE_CREDENTIALS: # Run: az ad sp create-for-rbac --sdk-auth
AZURE_RESOURCE_GROUP: my-resource-group
AZURE_REGISTRY_URL: myregistry.azurecr.io
```

### Kubernetes Deployment Secrets

```yaml
KUBE_CONFIG: # Base64 encoded kubeconfig file
KUBE_NAMESPACE: hardware-ecommerce
```

### Docker Hub Deployment Secrets

```yaml
DOCKER_USERNAME: your-username
DOCKER_PASSWORD: your-docker-token
```

---

## Release Management

### Version Tagging

```bash
# Create release tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### Release Workflow (Optional)

Add to `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Get version
        id: version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT
      
      - name: Build and push Docker images
        run: |
          docker build -t hardware-ecommerce-backend:${{ steps.version.outputs.VERSION }} ./backend
          docker push hardware-ecommerce-backend:${{ steps.version.outputs.VERSION }}
      
      - name: Create Release Notes
        run: |
          echo "Release ${{ steps.version.outputs.VERSION }} deployed!" > release-notes.md
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ steps.version.outputs.VERSION }}
          body_path: release-notes.md
```

---

## Monitoring Deployments

### GitHub Actions Monitoring

1. Go to repository → Actions tab
2. Click on workflow run to see details
3. Check individual step logs
4. View artifacts if any

### Application Monitoring After Deployment

**AWS CloudWatch:**
```bash
aws logs tail /aws/ecs/hardware-ecommerce --follow
```

**Azure Monitor:**
```bash
az monitor app-insights metrics show \
  --resource-group mygroup \
  --app myappinsights
```

**Kubernetes:**
```bash
kubectl logs -f deployment/backend -n hardware-ecommerce
kubectl describe pod <pod-name> -n hardware-ecommerce
```

---

## Rollback Strategy

### Automatic Rollback on Test Failure

The current workflow will fail the build if E2E tests fail, preventing deployment of broken code.

### Manual Rollback

**Docker Compose:**
```bash
docker compose down
git checkout v1.0.0  # Previous version
docker compose up -d
```

**Kubernetes:**
```bash
kubectl rollout history deployment/backend -n hardware-ecommerce
kubectl rollout undo deployment/backend -n hardware-ecommerce
```

**AWS ECS:**
```bash
aws ecs update-service \
  --cluster production \
  --service backend \
  --task-definition backend:PREVIOUS_REVISION
```

---

## Performance Optimization

### Caching in GitHub Actions

```yaml
- uses: actions/cache@v3
  with:
    path: ~/.m2/repository
    key: ${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}
    restore-keys: |
      ${{ runner.os }}-maven-
```

### Matrix Testing (Optional)

```yaml
strategy:
  matrix:
    java-version: [17, 21]
    node-version: [18, 20]
```

---

## Security Best Practices

1. **Never commit secrets** - Use GitHub Secrets
2. **Use branch protection** - Require approvals before merge
3. **Restrict deployment** - Only from main branch
4. **Audit logs** - Monitor who deployed what
5. **Rotate secrets** - Update credentials regularly
6. **Scan dependencies** - Use Dependabot
7. **Code scanning** - Use GitHub Advanced Security

---

## Troubleshooting CI/CD

### Build Fails

Check:
- Maven/npm build locally first
- Dependencies are available
- Java/Node versions match
- Environment variables set

### Tests Fail

Check:
- Backend running on port 8080
- Frontend running on port 5173
- Database initialized
- All services healthy

### Deployment Fails

Check:
- AWS/Azure credentials valid
- Docker images built successfully
- Network connectivity to cloud provider
- Sufficient permissions in target environment

---

## Documentation

- **Docker Guide:** See `DOCKER_GUIDE.md`
- **Deployment Quick Start:** See `DEPLOYMENT_QUICK_START.md`
- **API Reference:** See `documentation/api_docs.md`

---

**Last Updated:** June 16, 2026  
**Version:** 1.0.0
