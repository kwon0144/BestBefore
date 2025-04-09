# Load env vars
set -a
source .env
set +a

# Restart Docker services
sudo systemctl restart docker.socket docker.service
docker network prune -f

# Check and create network
if ! docker network ls | grep -q app-network; then
  docker network create app-network
fi

# Stop and remove containers
sudo docker stop frontend || true
sudo docker rm frontend || true
sudo docker stop backend || true
sudo docker rm backend || true

# Pull latest images
docker pull $DOCKER_USERNAME/react-django-frontend:latest
docker pull $DOCKER_USERNAME/react-django-backend:latest

# Remove old Docker images
docker image prune -f

# Run frontend container
docker run -d --name frontend --network app-network -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  -e NEXT_PUBLIC_API_KEY="$NEXT_PUBLIC_API_KEY" \
  -e NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" \
  -e NEXT_PUBLIC_MAP_ID="$NEXT_PUBLIC_MAP_ID" \
  $DOCKER_USERNAME/react-django-frontend:latest
echo "Frontend deployed successfully on HTTP (port 3000)"

# Run backend container
docker run -d --name backend --network app-network -p 8000:8000 \
  --env-file .env \
  $DOCKER_USERNAME/react-django-backend:latest
echo "Backend deployed successfully (port 8000)"
