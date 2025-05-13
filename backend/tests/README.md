# Backend Testing Guide

This directory contains all tests for the Anti-Rummikub backend.

## Directory Structure

```
tests/
├── config/              # Test configuration files
│   ├── global-setup.js  # Jest global setup hooks
│   ├── setup-mongo.js   # MongoDB in-memory server setup
│   └── test-env.js      # Test environment variables
├── integration/         # Integration tests
└── unit/                # Unit tests
```

## Configuration Files

### setup-mongo.js

This module manages the MongoDB in-memory server:

- `connect()`: Starts the MongoDB in-memory server and establishes connection
- `closeDatabase()`: Cleans up database and stops the server
- `clearDatabase()`: Clears all collections between tests

### test-env.js

Sets up the test environment:

- Configures `NODE_ENV=test`
- Sets test-specific JWT secret
- Optionally silences console logs during tests

### global-setup.js

Configures Jest hooks:

- `beforeAll`: Connects to the in-memory database
- `afterEach`: Clears the database between tests
- `afterAll`: Closes the database connection

## Writing Tests

### Model Tests

When testing MongoDB models, follow these practices:

1. **Model Initialization**:

```javascript
// Avoid duplicate model registration errors
try {
  Model = mongoose.model("ModelName");
} catch (e) {
  Model = mongoose.model("ModelName", ModelSchema);
}
```

2. **Timeouts**:

```javascript
it("should complete a database operation", async () => {
  // Test code
}, 10000); // Set appropriate timeout
```

3. **Cleanup**: Don't worry about clearing data between tests - the global setup handles it.

### Integration Tests

For API endpoint testing:

1. **Test Setup**:

```javascript
const request = require("supertest");
const app = require("../../src/app");

describe("API Endpoint", () => {
  it("should return correct response", async () => {
    const response = await request(app)
      .get("/api/endpoint")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
  });
});
```

2. **Database Assertions**: Verify data was correctly stored or modified

```javascript
// After API call
const user = await User.findById(userId);
expect(user.username).toBe("updated_username");
```

## Examples

See `integration/mongo.test.js` for a complete example of MongoDB in-memory testing with:

- User creation and retrieval
- Data updates
- Data deletion

## Best Practices

1. **Isolated Tests**: Each test should be independent and not rely on state from other tests
2. **Realistic Data**: Use fixtures or factories to create realistic test data
3. **Clear Assertions**: Make assertions specific about what you're testing
4. **Clean Models**: Register models carefully to avoid duplicate model errors
5. **Error Testing**: Test both success and error cases

## Common Issues

### Connection Errors

If you see connection errors, ensure:

- You're not manually connecting to MongoDB in your tests
- You're letting the global setup handle connections

### Timeout Issues

Database operations can sometimes exceed the default Jest timeout:

- Increase the global timeout in `jest.config.js`
- Set per-test timeouts for long-running operations

### Model Registration Errors

The error `OverwriteModelError: Cannot overwrite model once compiled` means you're trying to register a model that's already registered:

- Use the try-catch pattern shown above
- Ensure models are registered only once
