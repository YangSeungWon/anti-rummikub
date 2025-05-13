# Anti-Rummikub Docker Setup

This guide explains how to set up and run Anti-Rummikub using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your system
- Git repository cloned to your local machine

## Quick Start

1. Run the setup script:

```bash
chmod +x docker-setup.sh
./docker-setup.sh
```

This script will:

- Create necessary environment files
- Start all containers in detached mode

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Manual Setup

If you prefer to set up manually:

1. Create environment files:

   - Create `backend/.env` with database connection details
   - Create `frontend/.env` with API URLs

2. Build and start containers:

```bash
docker-compose build
docker-compose up -d
```

3. To view logs:

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

## Services

The setup includes:

- **MongoDB**: Data persistence (port 27017)
- **PostgreSQL**: Relational database (port 5432)
- **Redis**: Caching and session management (port 6379)
- **Backend**: Node.js Express API (port 3001)
- **Frontend**: React application (port 3000)

## Development Workflow

- The Docker configuration mounts local code as volumes, so changes to source files will be reflected in containers.
- Backend uses nodemon for auto-reloading
- Frontend uses Vite's hot module replacement

## Troubleshooting

If you encounter issues:

1. Check container status:

```bash
docker-compose ps
```

2. Check container logs:

```bash
docker-compose logs -f [service_name]
```

3. Restart services:

```bash
docker-compose restart [service_name]
```

4. Rebuild containers after major changes:

```bash
docker-compose down
docker-compose build
docker-compose up -d
```

## Database Initialization

To initialize the database:

```bash
# Access the backend container
docker-compose exec backend sh

# Run the database setup script
npm run db:setup
```

## Testing with Docker

To run tests in Docker:

```bash
# Run backend tests
docker-compose exec backend npm test

# Run frontend tests
docker-compose exec frontend npm test
```

## Cleanup

To stop and remove all containers, networks, and volumes:

```bash
docker-compose down -v
```

To keep the volumes (preserve data):

```bash
docker-compose down
```
