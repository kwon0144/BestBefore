# Load env vars
set -a
source .env
set +a

# Get branch name from argument
BRANCH=$1

# Set ports based on branch
if [ "$BRANCH" = "iteration1" ]; then
  FRONTEND_PORT=3001
  BACKEND_PORT=8001
  FRONTEND_TAG="iteration1"
  BACKEND_TAG="iteration1"
  FRONTEND_NAME="frontend-iteration1"
  BACKEND_NAME="backend-iteration1"
elif [ "$BRANCH" = "iteration2" ]; then
  FRONTEND_PORT=3002
  BACKEND_PORT=8002
  FRONTEND_TAG="iteration2"
  BACKEND_TAG="iteration2"
  FRONTEND_NAME="frontend-iteration2"
  BACKEND_NAME="backend-iteration2"
elif [ "$BRANCH" = "iteration3" ]; then
  FRONTEND_PORT=3003
  BACKEND_PORT=8003
  FRONTEND_TAG="iteration3"
  BACKEND_TAG="iteration3"
  FRONTEND_NAME="frontend-iteration3"
  BACKEND_NAME="backend-iteration3"
elif [ "$BRANCH" = "develop" ]; then
  FRONTEND_PORT=3004
  BACKEND_PORT=8004
  FRONTEND_TAG="develop"
  BACKEND_TAG="develop"
  FRONTEND_NAME="frontend-develop"
  BACKEND_NAME="backend-develop"
else
  FRONTEND_PORT=3000
  BACKEND_PORT=8000
  FRONTEND_TAG="latest"
  BACKEND_TAG="latest"
  FRONTEND_NAME="frontend"
  BACKEND_NAME="backend"
fi

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
docker pull $DOCKER_USERNAME/bestbefore-frontend:$FRONTEND_TAG
docker pull $DOCKER_USERNAME/bestbefore-backend:$BACKEND_TAG

# Remove old Docker images
docker image prune -f

# Run frontend container
docker run -d --name $FRONTEND_NAME --network app-network -p $FRONTEND_PORT:3000 \
  -e NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  -e NEXT_PUBLIC_API_KEY="$NEXT_PUBLIC_API_KEY" \
  -e NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" \
  -e NEXT_PUBLIC_MAP_ID="$NEXT_PUBLIC_MAP_ID" \
  -e NEXT_PUBLIC_BRANCH_NAME="$BRANCH" \
  -e NEXT_PUBLIC_SITE_PASSWORD="$NEXT_PUBLIC_SITE_PASSWORD" \
  $DOCKER_USERNAME/bestbefore-frontend:$FRONTEND_TAG
echo "Frontend deployed successfully on HTTP (port $FRONTEND_PORT)"

# Run backend container
docker run -d --name $BACKEND_NAME --network app-network -p $BACKEND_PORT:8000 \
  --env-file .env \
  $DOCKER_USERNAME/bestbefore-backend:$BACKEND_TAG
echo "Backend deployed successfully (port $BACKEND_PORT)"