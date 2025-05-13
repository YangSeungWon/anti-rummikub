# Key Learnings: MongoDB In-Memory Testing Example

Below is an annotated example showcasing key learnings from our implementation of MongoDB in-memory testing.

```javascript
// File: example_with_learnings.test.js
const mongoose = require("mongoose");

// Define schema within the test file - this keeps the test isolated
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
});

describe("Product Model Tests", () => {
  let Product;

  beforeAll(() => {
    // LEARNING 1: Safe model initialization to avoid "OverwriteModelError"
    // Always check if model already exists before creating a new one
    try {
      Product = mongoose.model("Product");
    } catch (e) {
      Product = mongoose.model("Product", ProductSchema);
    }

    // LEARNING 2: No need to connect to MongoDB here
    // The global setup in global-setup.js handles this automatically
  });

  // LEARNING 3: Clear database between tests
  // The global setup's afterEach hook handles this automatically
  // No need to manually clear collections in individual tests

  it("should create a new product", async () => {
    // Create test data
    const productData = {
      name: "Test Product",
      price: 29.99,
      description: "A test product",
    };

    // Save to database
    const product = new Product(productData);
    await product.save();

    // Retrieve and verify
    const savedProduct = await Product.findOne({ name: "Test Product" });
    expect(savedProduct).toBeTruthy();
    expect(savedProduct.price).toBe(29.99);

    // LEARNING 4: Add explicit timeout for database operations
  }, 10000); // 10 second timeout

  it("should update product price", async () => {
    // Create product
    const product = new Product({
      name: "Price Test",
      price: 10.99,
    });
    await product.save();

    // LEARNING 5: Use proper MongoDB update methods
    await Product.updateOne({ name: "Price Test" }, { $set: { price: 15.99 } });

    // Verify update
    const updatedProduct = await Product.findOne({ name: "Price Test" });
    expect(updatedProduct.price).toBe(15.99);
  }, 10000);

  it("should delete a product", async () => {
    // Create product
    const product = new Product({
      name: "Delete Test",
      price: 5.99,
    });
    await product.save();

    // Verify it exists
    let foundProduct = await Product.findOne({ name: "Delete Test" });
    expect(foundProduct).toBeTruthy();

    // Delete product
    await Product.deleteOne({ name: "Delete Test" });

    // LEARNING 6: Verify deletion with appropriate assertion
    foundProduct = await Product.findOne({ name: "Delete Test" });
    expect(foundProduct).toBeNull();
  }, 10000);

  // LEARNING 7: Test error cases too
  it("should fail to create product without required fields", async () => {
    const invalidProduct = new Product({ name: "Invalid Product" });

    // LEARNING 8: Use try-catch to test for validation errors
    let error;
    try {
      await invalidProduct.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeTruthy();
    expect(error.name).toBe("ValidationError");
    expect(error.errors.price).toBeDefined();
  }, 10000);
});
```

## Key Learnings Summary

1. **Safe model initialization:** Use try-catch to prevent duplicate model registration errors.
2. **Let global setup handle connections:** Don't manually connect to MongoDB in individual test files.
3. **Automatic database clearing:** The global setup automatically clears the database between tests.
4. **Test timeouts:** Set appropriate timeouts for database operations.
5. **Proper MongoDB operations:** Use correct MongoDB methods for CRUD operations.
6. **Appropriate assertions:** Use the right assertions to verify database operations.
7. **Test error cases:** Don't just test the happy path - verify error handling works too.
8. **Validation testing:** Test that schema validation correctly prevents invalid data.

## Common Mistakes to Avoid

1. ❌ **Connecting to database in each test file**

   ```javascript
   // Don't do this - let global setup handle it
   beforeAll(async () => {
     await mongoose.connect(mongoUri);
   });
   ```

2. ❌ **Not handling model registration errors**

   ```javascript
   // Will fail if called twice
   const Model = mongoose.model("Model", Schema);
   ```

3. ❌ **Manually clearing database in each test**

   ```javascript
   // Don't do this - let global setup handle it
   afterEach(async () => {
     await Model.deleteMany({});
   });
   ```

4. ❌ **Not setting timeouts for database operations**
   ```javascript
   // May fail if operation takes longer than default timeout
   it("should complete database operation", async () => {
     // Long-running operation
   }); // No timeout specified
   ```
