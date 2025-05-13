# MongoDB In-Memory Testing Guide

## Overview

This guide documents our approach to testing MongoDB operations in isolation using the `mongodb-memory-server` package. This implementation allows developers to run tests without requiring an external MongoDB instance, making tests more reliable, isolated, and easier to set up in CI/CD environments.

## Benefits

- **Isolation**: Each test runs with its own clean database instance
- **Performance**: Faster than connecting to external databases
- **Consistency**: No test pollution between test runs
- **CI/CD Friendly**: No need to set up external MongoDB in build pipelines

## Implementation Details

### Required Packages

```bash
npm install --save-dev mongodb-memory-server mongoose
```

### Key Components

1. **MongoDB Memory Server Setup**: `backend/tests/config/setup-mongo.js`
   - Handles creating and connecting to in-memory MongoDB servers
   - Provides methods for database cleanup and server shutdown
2. **Test Environment Configuration**: `backend/tests/config/test-env.js`
   - Sets environment variables specific to testing
   - Configures logging behavior during tests
3. **Global Jest Setup**: `backend/tests/config/global-setup.js`

   - Initializes database connections before all tests
   - Cleans up the database between individual tests
   - Closes connections after all tests complete

4. **Jest Configuration**: `backend/jest.config.js`
   - Increased timeout for database operations (`testTimeout: 30000`)
   - Single worker mode to prevent parallel test conflicts (`maxWorkers: 1`)
   - Sets up global configuration files

## Best Practices

1. **Model Initialization**

   ```javascript
   // Check if model exists before creating it to avoid duplicate model errors
   try {
     Model = mongoose.model("ModelName");
   } catch (e) {
     Model = mongoose.model("ModelName", Schema);
   }
   ```

2. **Test Timeouts**

   - Add explicit timeouts to database tests that might take longer

   ```javascript
   it("should perform database operation", async () => {
     // Test code here
   }, 10000); // 10 second timeout
   ```

3. **Database Cleanup**

   - Let the global setup handle database clearing between tests
   - Avoid manual connection management in individual test files

4. **Use Appropriate Assertions**
   - Verify connection status: `expect(mongoose.connection.readyState).toBe(1)`
   - Check for database objects: `expect(result).toBeTruthy()`
   - Validate specific fields: `expect(user.username).toBe('testuser')`

## Common Issues and Solutions

### Connection Conflicts

**Problem**: Multiple tests try to create separate connections causing conflicts.

**Solution**: Use global setup for database connection and avoid connecting in individual test files.

### Timeout Errors

**Problem**: Database operations exceed default Jest timeout.

**Solution**:

- Increase global timeout in Jest config
- Add per-test timeouts for longer operations

### Duplicate Model Errors

**Problem**: `OverwriteModelError: Cannot overwrite model once compiled`

**Solution**: Use the try-catch pattern when defining models in tests (see Best Practices section).

## Example Test

```javascript
const mongoose = require("mongoose");

// Define your schema
const ItemSchema = new mongoose.Schema({
  name: String,
  value: Number,
});

describe("Item operations", () => {
  let Item;

  beforeAll(() => {
    // Safe model initialization
    try {
      Item = mongoose.model("Item");
    } catch (e) {
      Item = mongoose.model("Item", ItemSchema);
    }
  });

  it("should create a new item", async () => {
    const newItem = new Item({ name: "Test Item", value: 100 });
    await newItem.save();

    const savedItem = await Item.findOne({ name: "Test Item" });
    expect(savedItem.value).toBe(100);
  }, 10000);
});
```

## Additional Resources

- [MongoDB Memory Server Documentation](https://github.com/nodkz/mongodb-memory-server)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
