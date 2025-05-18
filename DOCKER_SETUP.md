# Docker Setup for BestBefore Application

This document provides instructions for setting up and running the BestBefore application using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- OpenSSL for generating self-signed certificates (for development)

## Setup and Run

### 1. Generate SSL Certificates (Development Only)

Generate self-signed SSL certificates for development:

```bash
./generate-certs.sh
```

For production, replace the certificates in `nginx/ssl/` with proper certificates.

### 2. Start the Application

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Access the Application

- Frontend: https://localhost/
- Backend API: https://localhost/api/

## Docker Network Configuration

The application uses a custom Docker network called `bestbefore-network` which allows containers to communicate with each other using their service names:

- `backend-iteration1`: Backend service running on port 8000
- `frontend-iteration1`: Frontend service running on port 3000
- `nginx`: Reverse proxy service exposed on ports 80 (HTTP) and 443 (HTTPS)

## Manual Container Setup (Alternative to docker-compose)

If you prefer to run containers individually:

```bash
# Create network
docker network create bestbefore-network

# Run backend
docker run --name backend-iteration1 --network bestbefore-network \
  -v ./backend:/app \
  -e DEBUG=True \
  -p 8000:8000 \
  --restart unless-stopped \
  -d \
  bestbefore-backend

# Run frontend
docker run --name frontend-iteration1 --network bestbefore-network \
  -v ./frontend:/usr/src/app \
  -p 3000:3000 \
  --restart unless-stopped \
  -d \
  bestbefore-frontend

# Run nginx
docker run --name nginx --network bestbefore-network \
  -p 80:80 -p 443:443 \
  -v ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
  -v ./nginx/ssl:/etc/nginx/ssl:ro \
  --restart unless-stopped \
  -d \
  nginx:stable-alpine
```

## Troubleshooting

### Container Access

To check if containers can communicate with each other:

```bash
# Access bash in nginx container
docker exec -it nginx sh

# Ping other containers by name
ping backend-iteration1
ping frontend-iteration1
```

### Viewing Logs

```bash
# View logs for a specific container
docker logs backend-iteration1
docker logs frontend-iteration1
docker logs nginx
``` 