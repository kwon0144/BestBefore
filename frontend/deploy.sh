# Source environment variables
set -a
source .env
set +a

# Pull the latest Docker images
docker pull $DOCKER_USERNAME/react-django-frontend:latest
docker pull $DOCKER_USERNAME/react-django-backend:latest
echo "Images pulled successfully"

# Stop and remove the existing frontend container if it is running
if [ "$(docker ps -a -q -f name=frontend)" ]; then
    docker stop frontend
    docker rm frontend
    echo "Frontend container stopped and removed"
fi

# Stop and remove the existing backend container if it is running
if [ "$(docker ps -a -q -f name=backend)" ]; then
    docker stop backend
    docker rm backend
    echo "Backend container stopped and removed"
fi

# Remove old Docker images, only keep the most recent one
docker image prune -f
echo "Unnecessary images deleted"

# Create a custom bridge network
docker network create app-network

# Run the frontend container on port 443 for HTTP
docker run -d --name frontend --network app-network -p 443:3000 \
  -e NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  -e NEXT_PUBLIC_API_KEY="$NEXT_PUBLIC_API_KEY" \
  $DOCKER_USERNAME/react-django-frontend:latest
echo "Frontend deployed successfully on HTTP (port 443)"

# Run the backend container on port 8000
docker run -d --name backend --network app-network -p 8000:8000 \
  $DOCKER_USERNAME/react-django-backend:latest
echo "Backend deployed successfully on port 8000"

echo "Deployment completed successfully"