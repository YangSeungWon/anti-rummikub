#!/bin/bash

# Create .env file for backend
cat > ./backend/.env << EOL
# Server
PORT=3001
NODE_ENV=development

# PostgreSQL Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=antirummikub
DB_USER=postgres
DB_PASSWORD=postgres

# MongoDB
MONGODB_URI=mongodb://mongodb:27017/antirummikub

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=anti_rummikub_secret_key
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000
EOL

# Create .env file for frontend
cat > ./frontend/.env << EOL
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
EOL

echo "Environment files created."
echo "Starting Docker Compose..."

# Start Docker Compose
docker-compose up -d

echo "Docker Compose started successfully!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001" 