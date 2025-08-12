# EcoX Backend Testing Guide

This guide covers testing procedures for the EcoX Node.js Express backend API.

## Test Setup

### Prerequisites
- Node.js 20+
- PostgreSQL database (for integration tests)
- Firebase project credentials (for authentication tests)

### Installation

```bash
# Install dependencies
npm install

# Install test dependencies
npm install --save-dev jest supertest @types/jest @types/supertest

# Set up test environment
cp .env.example .env.test
```

### Environment Configuration

Create `.env.test` with test-specific values:

```bash
NODE_ENV=test
DATABASE_URL=postgresql://test_user:test_pass@localhost:5432/ecox_test
FIREBASE_PROJECT_ID=ecox-test-project
# ... other test configurations
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Structure

```
tests/
├── unit/                 # Unit tests
│   ├── services/
│   ├── middleware/
│   └── utils/
├── integration/          # Integration tests
│   ├── api/
│   ├── database/
│   └── auth/
└── fixtures/            # Test data and mocks
```

## API Testing Examples

### Authentication Tests

```typescript
describe('Authentication', () => {
  test('should register new user', async () => {
    const userData = {
      firebaseUid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(200);

    expect(response.body.email).toBe(userData.email);
  });
});
```

### Green Actions Tests

```typescript
describe('Green Actions API', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Get test auth token
    authToken = await getTestAuthToken();
  });

  test('should create green action', async () => {
    const actionData = {
      title: 'Test Recycling',
      category: 'recycling',
      tokensEarned: '25.00000000'
    };

    const response = await request(app)
      .post('/api/green-actions')
      .set('Authorization', `Bearer ${authToken}`)
      .send(actionData)
      .expect(200);

    expect(response.body.title).toBe(actionData.title);
    expect(response.body.status).toBeDefined();
  });
});
```

## Mock Services

### Firebase Mock

```typescript
// tests/mocks/firebase.ts
export const mockFirebaseAuth = {
  verifyIdToken: jest.fn().mockResolvedValue({
    uid: 'test-uid',
    email: 'test@example.com'
  }),
  getUser: jest.fn().mockResolvedValue({
    uid: 'test-uid',
    email: 'test@example.com'
  })
};
```

### Blockchain Mock

```typescript
// tests/mocks/blockchain.ts
export const mockBlockchainService = {
  mintTokens: jest.fn().mockResolvedValue({
    txHash: '0xmocktxhash',
    success: true
  }),
  getTokenBalance: jest.fn().mockResolvedValue('100.00000000')
};
```

### AI Service Mock

```typescript
// tests/mocks/ai-verification.ts
export const mockAIService = {
  verifyGreenAction: jest.fn().mockResolvedValue({
    verified: true,
    confidence: 0.95,
    reason: 'Mock verification success'
  })
};
```

## Database Testing

### Test Database Setup

```typescript
// tests/setup/database.ts
import { Pool } from 'pg';

export async function setupTestDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  // Run migrations
  await pool.query('DROP SCHEMA IF EXISTS test CASCADE');
  await pool.query('CREATE SCHEMA test');
  
  // Insert test data
  await seedTestData(pool);
  
  return pool;
}
```

### Database Tests

```typescript
describe('Database Operations', () => {
  let db: Pool;
  
  beforeAll(async () => {
    db = await setupTestDatabase();
  });
  
  afterAll(async () => {
    await db.end();
  });

  test('should create user in database', async () => {
    const userData = {
      firebaseUid: 'test-uid',
      email: 'test@example.com',
      name: 'Test User'
    };
    
    const user = await storage.createUser(userData);
    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
  });
});
```

## Load Testing

### Artillery.js Configuration

```yaml
# artillery.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: 'API Load Test'
    requests:
      - get:
          url: '/api/status/firebase'
      - post:
          url: '/api/auth/register'
          json:
            firebaseUid: '{{ $randomUuid() }}'
            email: '{{ $randomString() }}@test.com'
            name: 'Load Test User'
```

Run load tests:

```bash
# Install Artillery
npm install -g artillery

# Run load test
artillery run artillery.yml
```

## Performance Testing

### Response Time Tests

```typescript
describe('Performance', () => {
  test('API endpoints should respond quickly', async () => {
    const start = Date.now();
    
    await request(app)
      .get('/api/status/firebase')
      .expect(200);
    
    const responseTime = Date.now() - start;
    expect(responseTime).toBeLessThan(200); // 200ms
  });
});
```

### Memory Leak Detection

```typescript
describe('Memory Usage', () => {
  test('should not leak memory with repeated requests', async () => {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Make 1000 requests
    for (let i = 0; i < 1000; i++) {
      await request(app).get('/api/status/firebase');
    }
    
    // Force garbage collection
    if (global.gc) global.gc();
    
    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Memory increase should be reasonable
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
  });
});
```

## Security Testing

### Authentication Security

```typescript
describe('Security', () => {
  test('should reject invalid tokens', async () => {
    await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
  
  test('should prevent SQL injection', async () => {
    const maliciousData = {
      firebaseUid: "'; DROP TABLE users; --",
      email: 'hack@test.com',
      name: 'Hacker'
    };
    
    await request(app)
      .post('/api/auth/register')
      .send(maliciousData)
      .expect(400); // Should be rejected by validation
  });
});
```

### Rate Limiting Tests

```typescript
describe('Rate Limiting', () => {
  test('should enforce rate limits', async () => {
    // Make requests up to the limit
    for (let i = 0; i < 100; i++) {
      await request(app).get('/api/status/firebase');
    }
    
    // Next request should be rate limited
    await request(app)
      .get('/api/status/firebase')
      .expect(429);
  });
});
```

## Test Data Management

### Fixtures

```typescript
// tests/fixtures/users.ts
export const testUsers = [
  {
    firebaseUid: 'test-user-1',
    email: 'user1@test.com',
    name: 'Test User 1'
  },
  {
    firebaseUid: 'test-user-2', 
    email: 'user2@test.com',
    name: 'Test User 2'
  }
];
```

### Factory Functions

```typescript
// tests/factories/user-factory.ts
export function createTestUser(overrides = {}) {
  return {
    firebaseUid: faker.datatype.uuid(),
    email: faker.internet.email(),
    name: faker.name.fullName(),
    ...overrides
  };
}
```

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - run: npm run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          NODE_ENV: test
      
      - run: npm run test:coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
```

## Test Coverage Goals

- **Overall**: > 80%
- **Critical paths**: > 95% 
- **API endpoints**: > 90%
- **Business logic**: > 95%

## Best Practices

### Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Keep tests independent and isolated
- Clean up test data after each test

### Mocking Strategy
- Mock external services (Firebase, blockchain, AI)
- Use real database for integration tests
- Mock time-dependent functions
- Verify mock interactions

### Error Testing
- Test both success and error scenarios
- Verify error messages and status codes
- Test edge cases and boundary conditions
- Validate error handling middleware

### Performance Considerations
- Set reasonable timeouts for tests
- Use `beforeAll` for expensive setup
- Clean up resources in `afterAll`
- Run tests in parallel when possible

## Debugging Tests

### Common Issues

1. **Database connection errors**
   ```bash
   # Check database connection
   psql $DATABASE_URL -c "SELECT 1"
   ```

2. **Authentication failures**
   ```bash
   # Verify Firebase credentials
   echo $FIREBASE_PRIVATE_KEY | base64 -d
   ```

3. **Port conflicts**
   ```bash
   # Find processes using port 5000
   lsof -i :5000
   ```

### Debug Output

```typescript
// Enable debug logging in tests
process.env.DEBUG = 'ecox:*';
process.env.LOG_LEVEL = 'debug';
```

### Test Debugging Tools

```bash
# Run single test file
npm test -- --testPathPattern=auth.test.ts

# Run tests with verbose output
npm test -- --verbose

# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Reporting

### Coverage Reports

```bash
# Generate HTML coverage report
npm run test:coverage -- --coverageReporters=html

# View report
open coverage/index.html
```

### Test Results

```bash
# Generate JUnit XML report
npm test -- --reporters=jest-junit

# Generate JSON report
npm test -- --json --outputFile=test-results.json
```

This comprehensive testing guide ensures the EcoX backend maintains high quality, reliability, and performance standards.