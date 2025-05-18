# Load env vars
set -a
source .env
set +a

# Get branch name from argument
BRANCH=$1

# Set ports based on branch
if [ "$BRANCH" = "iteration1" ]; then
  FRONTEND_PORT=3001
  FRONTEND_TAG="iteration1"
  BACKEND_TAG="iteration1"
  FRONTEND_NAME="frontend-iteration1"
  BACKEND_NAME="backend-iteration1"
elif [ "$BRANCH" = "iteration2" ]; then
  FRONTEND_PORT=3002
  FRONTEND_TAG="iteration2"
  BACKEND_TAG="iteration2"
  FRONTEND_NAME="frontend-iteration2"
  BACKEND_NAME="backend-iteration2"
elif [ "$BRANCH" = "iteration3" ]; then
  FRONTEND_PORT=3003
  FRONTEND_TAG="iteration3"
  BACKEND_TAG="iteration3"
  FRONTEND_NAME="frontend-iteration3"
  BACKEND_NAME="backend-iteration3"
elif [ "$BRANCH" = "develop" ]; then
  FRONTEND_PORT=3004
  FRONTEND_TAG="develop"
  BACKEND_TAG="develop"
  FRONTEND_NAME="frontend-develop"
  BACKEND_NAME="backend-develop"
else
  FRONTEND_PORT=3000
  FRONTEND_TAG="latest"
  BACKEND_TAG="latest"
  FRONTEND_NAME="frontend"
  BACKEND_NAME="backend"
fi

# Check and create network
if ! docker network ls | grep -q bestbefore-network; then
  docker network create bestbefore-network
fi

# Stop and remove containers
sudo docker stop $FRONTEND_NAME || true
sudo docker rm $FRONTEND_NAME || true
sudo docker stop $BACKEND_NAME || true
sudo docker rm $BACKEND_NAME || true
sudo docker stop nginx || true
sudo docker rm nginx || true

# Pull latest images
docker pull $DOCKER_USERNAME/bestbefore-frontend:$FRONTEND_TAG
docker pull $DOCKER_USERNAME/bestbefore-backend:$BACKEND_TAG
docker pull nginx:stable-alpine

# Remove old Docker images
docker image prune -f

# Run backend container (not exposed to host, only accessible within Docker network)
docker run -d --name $BACKEND_NAME --network bestbefore-network \
  --env-file .env \
  $DOCKER_USERNAME/bestbefore-backend:$BACKEND_TAG
echo "Backend deployed successfully (only accessible within Docker network)"

# Run frontend container - expose it on frontend port
docker run -d --name $FRONTEND_NAME --network bestbefore-network \
  -p $FRONTEND_PORT:3000 \
  -e NEXT_PUBLIC_API_URL="/api" \
  -e NEXT_PUBLIC_API_KEY="$NEXT_PUBLIC_API_KEY" \
  -e NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" \
  -e NEXT_PUBLIC_MAP_ID="$NEXT_PUBLIC_MAP_ID" \
  -e NEXT_PUBLIC_BRANCH_NAME="$BRANCH" \
  -e NEXT_PUBLIC_SITE_PASSWORD="$NEXT_PUBLIC_SITE_PASSWORD" \
  $DOCKER_USERNAME/bestbefore-frontend:$FRONTEND_TAG
echo "Frontend deployed successfully and exposed on port $FRONTEND_PORT"

# Create nginx conf directory if it doesn't exist
mkdir -p ./nginx

# Create a basic nginx.conf file
cat > ./nginx/nginx.conf << EOF
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                     '\$status \$body_bytes_sent "\$http_referer" '
                     '"\$http_user_agent" "\$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    sendfile on;
    keepalive_timeout 65;

    # Backend API proxy
    upstream backend {
        server $BACKEND_NAME:8000;
    }
    
    server {
        listen 8080;
        
        # API endpoints
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
        
        # Redirect everything else to the frontend
        location / {
            return 301 http://\$host:$FRONTEND_PORT;
        }
    }
}
EOF

# Check if port 8080 is in use
if netstat -tuln | grep -q ":8080 "; then
  echo "Warning: Port 8080 is already in use. Using port 8081 instead."
  sed -i 's/listen 8080;/listen 8081;/' ./nginx/nginx.conf
  NGINX_PORT=8081
else
  NGINX_PORT=8080
fi

# Run nginx container
docker run -d --name nginx --network bestbefore-network \
  -p $NGINX_PORT:$NGINX_PORT \
  -v $(pwd)/nginx/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:stable-alpine
echo "Nginx deployed successfully on port $NGINX_PORT"

# Get the EC2 instance public IP address
EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

echo "Deployment complete!"
echo "Access your application at:"
echo "- Frontend: http://$EC2_PUBLIC_IP:$FRONTEND_PORT"
echo "- API (through Nginx): http://$EC2_PUBLIC_IP:$NGINX_PORT/api/"