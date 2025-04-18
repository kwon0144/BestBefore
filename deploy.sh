# Load env vars
set -a
source .env
set +a

# Set ports based on branch
if [ "$BRANCH" = "iteration1" ]; then
  FRONTEND_PORT=3001
  BACKEND_PORT=8001
  FRONTEND_TAG="iteration1"
  BACKEND_TAG="iteration1"
  FRONTEND_NAME="frontend-iteration1"
  BACKEND_NAME="backend-iteration1"
else
  FRONTEND_PORT=3000
  BACKEND_PORT=8000
  FRONTEND_TAG="latest"
  BACKEND_TAG="latest"
  FRONTEND_NAME="frontend"
  BACKEND_NAME="backend"
fi

# # Restart Docker services
# sudo systemctl restart docker.socket docker.service
# docker network prune -f

# Check and create network
if ! docker network ls | grep -q app-network; then
  docker network create app-network
fi

# Stop and remove containers
sudo docker stop $FRONTEND_NAME || true
sudo docker rm $FRONTEND_NAME || true
sudo docker stop $BACKEND_NAME || true
sudo docker rm $BACKEND_NAME || true

# Pull latest images
docker pull $DOCKER_USERNAME/react-django-frontend:$FRONTEND_TAG
docker pull $DOCKER_USERNAME/react-django-backend:$BACKEND_TAG

# Remove old Docker images
docker image prune -f

# Run frontend container
docker run -d --name $FRONTEND_NAME --network app-network -p $FRONTEND_PORT:3000 \
  -e NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  -e NEXT_PUBLIC_API_KEY="$NEXT_PUBLIC_API_KEY" \
  -e NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" \
  -e NEXT_PUBLIC_MAP_ID="$NEXT_PUBLIC_MAP_ID" \
  $DOCKER_USERNAME/react-django-frontend:$FRONTEND_TAG
echo "Frontend deployed successfully on HTTP (port $FRONTEND_PORT)"

# Run backend container
docker run -d --name $BACKEND_NAME --network app-network -p $BACKEND_PORT:8000 \
  --env-file .env \
  $DOCKER_USERNAME/react-django-backend:$BACKEND_TAG
echo "Backend deployed successfully (port $BACKEND_PORT)"
