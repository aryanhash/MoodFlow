# 🐳 MoodFlow Docker Setup

This document explains how to containerize and run the MoodFlow application using Docker.

## 📋 Prerequisites

- Docker Desktop installed
- Docker Compose installed
- At least 4GB RAM available for Docker

## 🚀 Quick Start

### Production Mode
```bash
# Build and start all services
npm run docker:build
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### Development Mode
```bash
# Start development environment with hot reload
npm run docker:dev
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React +      │◄──►│   (FastAPI +     │◄──►│   (PostgreSQL)  │
│    Nginx)       │    │    Python)      │    │                 │
│   Port: 80      │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Docker Files Structure

```
├── Dockerfile.backend          # Python FastAPI backend
├── Dockerfile.frontend          # React frontend (production)
├── Dockerfile.frontend.dev     # React frontend (development)
├── docker-compose.yml          # Production orchestration
├── docker-compose.dev.yml      # Development orchestration
├── nginx.conf                  # Nginx configuration
└── .dockerignore              # Files to ignore in Docker build
```

## 🔧 Services

### Backend Service
- **Image**: Custom Python 3.11-slim
- **Port**: 5000
- **Features**:
  - FastAPI with Uvicorn
  - Mood analysis with ML
  - Health checks
  - Auto-restart on failure

### Frontend Service
- **Image**: Custom React + Nginx
- **Port**: 80 (production) / 3000 (development)
- **Features**:
  - React SPA with routing
  - Nginx reverse proxy
  - Static asset caching
  - API proxy to backend

### Database Service (Optional)
- **Image**: PostgreSQL 15-alpine
- **Port**: 5432
- **Features**:
  - Persistent data storage
  - Health checks
  - Volume mounting

### Redis Service (Optional)
- **Image**: Redis 7-alpine
- **Port**: 6379
- **Features**:
  - Session storage
  - Caching layer
  - Health checks

## 🛠️ Available Commands

```bash
# Build all images
npm run docker:build

# Start all services (detached)
npm run docker:up

# Start development environment
npm run docker:dev

# View logs
npm run docker:logs

# Restart services
npm run docker:restart

# Stop services
npm run docker:down

# Clean up (remove volumes and images)
npm run docker:clean
```

## 🌐 Access Points

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **Database**: localhost:5432 (if enabled)
- **Redis**: localhost:6379 (if enabled)

## 📊 Monitoring & Health Checks

All services include health checks:
- Backend: `GET /` endpoint
- Frontend: Nginx status
- Database: `pg_isready`
- Redis: `redis-cli ping`

## 🔒 Security Features

- Non-root user execution
- Security headers in Nginx
- Network isolation
- Resource limits
- Health checks

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale backend instances
docker-compose up --scale backend=3

# Scale frontend instances
docker-compose up --scale frontend=2
```

### Load Balancing
Use a load balancer (nginx, traefik) in front of multiple frontend instances.

## 🚀 Deployment Options

### Cloud Platforms
- **AWS**: ECS, EKS, EC2
- **Google Cloud**: GKE, Cloud Run
- **Azure**: AKS, Container Instances
- **DigitalOcean**: App Platform, Droplets

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Build and push
  run: |
    docker build -f Dockerfile.backend -t ${{ secrets.REGISTRY }}/moodflow-backend .
    docker build -f Dockerfile.frontend -t ${{ secrets.REGISTRY }}/moodflow-frontend .
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml
2. **Memory issues**: Increase Docker Desktop memory limit
3. **Build failures**: Check .dockerignore and Dockerfile syntax
4. **Network issues**: Verify network configuration

### Debug Commands
```bash
# Check container status
docker ps

# View container logs
docker logs <container_name>

# Execute commands in container
docker exec -it <container_name> /bin/bash

# Check resource usage
docker stats
```

## 📝 Environment Variables

Create `.env` file for customization:
```env
# Database
POSTGRES_DB=moodflow
POSTGRES_USER=moodflow
POSTGRES_PASSWORD=your_password

# Backend
PYTHONPATH=/app
ENVIRONMENT=production

# Frontend
NODE_ENV=production
```

## 🎯 Benefits Achieved

✅ **Consistency**: Same environment everywhere  
✅ **Scalability**: Easy horizontal scaling  
✅ **Portability**: Run anywhere Docker runs  
✅ **Isolation**: No dependency conflicts  
✅ **Automation**: Easy CI/CD integration  
✅ **Monitoring**: Built-in health checks  
✅ **Security**: Container isolation  
✅ **Efficiency**: Resource optimization
