#!/bin/bash

# Set directory for SSL certificates
SSL_DIR="./nginx/ssl"

# Create directory if it doesn't exist
mkdir -p $SSL_DIR

# Generate self-signed certificate and key
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout $SSL_DIR/server.key \
  -out $SSL_DIR/server.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

# Set permissions
chmod 600 $SSL_DIR/server.key

echo "Self-signed SSL certificate and key have been generated in $SSL_DIR."
echo "Note: This is for development only. Use proper certificates for production." 