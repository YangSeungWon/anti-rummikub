# Anti-Rummikub Backend

This is the backend service for the Anti-Rummikub: Improv Showdown game.

## Architecture

The backend is built with:

- **Node.js** and **Express** for the REST API
- **MongoDB** for data persistence
- **Socket.io** for real-time communication
- **Jest** for testing

## Directory Structure

```
backend/
├── src/
│   ├── config/        # Configuration settings
│   ├── controllers/   # Request handlers
│   ├── middlewares/   # Express middleware
│   ├── models/        # MongoDB schemas and models
│   ├── routes/        # API route definitions
│   └── websocket/     # Socket.io implementation
├── tests/
│   ├── config/        # Test configuration
│   ├── integration/   # Integration tests
│   └── unit/          # Unit tests
└── utils/             # Utility functions
```

## Getting Started

### Installation

```bash
cd backend
npm install
```

### Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Testing

The project uses Jest for testing with MongoDB in-memory server for database tests.

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/path/to/file.test.js
```

### Testing Strategy

1. **Unit Tests**: Test individual functions and modules in isolation.
2. **Integration Tests**: Test API endpoints and database operations.
3. **In-memory Database**: Tests use MongoDB Memory Server for database testing.

### In-memory MongoDB Testing

Our testing infrastructure uses `mongodb-memory-server` to create isolated MongoDB instances for each test run. This approach provides several advantages:

- No need for a dedicated test database
- Isolated test environment for each test suite
- Fast and reliable tests that don't depend on external services
- Simplified CI/CD integration

See the detailed documentation in [MongoDB In-Memory Testing Guide](../docs/mongodb_in_memory_testing.md).

## API Documentation

The backend API is documented using Swagger. Access the documentation at:

```
http://localhost:3000/api-docs
```

When the server is running.

## Environment Variables

Create a `.env` file in the root of the backend directory with the following variables:

```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/anti-rummikub
JWT_SECRET=your_jwt_secret
```

For testing, environment variables are automatically set in `tests/config/test-env.js`.
