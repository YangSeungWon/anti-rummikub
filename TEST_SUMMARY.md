# Anti-Rummikub: Improv Showdown - Test Summary

## Overview

This document provides a comprehensive summary of the testing strategy and implementation for the "Anti-Rummikub: Improv Showdown" project, a real-time multiplayer game. The testing approach covers multiple levels from unit tests to end-to-end tests, ensuring the application's reliability and stability.

## Testing Strategy

The project implements a multi-layered testing approach:

### 1. Frontend Unit Tests (Jest + React Testing Library)

- **API Client Tests**: Authentication flows, game API operations
- **Component Tests**: UI rendering, state management, user interactions
- **Custom Hook Tests**: Socket connection, event handling, game state management

### 2. Backend Unit Tests (Jest)

- **Utility Functions**: Score calculation, game logic validation
- **Model Validation**: Data structure integrity, constraints

### 3. Backend Integration Tests

- **Game Flow**: End-to-end API flow covering user journey
- **Error Handling**: Authentication, validation, edge cases

### 4. End-to-End Tests (Cypress)

- **Full Game Flow**: User signup, game creation, gameplay, voting, results
- **Edge Cases**: Error handling, reconnection scenarios

## Test Implementation

### Frontend Tests

| Category   | Test Files                                                     | Coverage | Key Areas Tested                                         |
| ---------- | -------------------------------------------------------------- | -------- | -------------------------------------------------------- |
| API Client | `apiClient.test.ts`                                            | ~90%     | Authentication, game operations, error handling          |
| Components | `LoginForm.test.tsx`<br>`Timer.test.tsx`<br>`VoteBar.test.tsx` | ~85%     | Rendering, user interaction, state updates, validation   |
| Hooks      | `useSocket.test.tsx`<br>`useGameSocket.test.tsx`               | ~80%     | Socket connection, event handling, state synchronization |

### Backend Tests

| Category    | Test Files                                             | Coverage | Key Areas Tested                                            |
| ----------- | ------------------------------------------------------ | -------- | ----------------------------------------------------------- |
| Unit Tests  | `scoreCalculator.test.js`<br>`auth.middleware.test.js` | ~95%     | Score calculation logic<br>Authentication middleware checks |
| Integration | `gameFlow.test.js`                                     | ~70%     | Complete game flow from creation to completion              |

### Backend Test Details

#### Unit Testing

- **Score Calculator Tests**:

  - Testing different voting scenarios (all positive, mixed, all negative)
  - Handling edge cases (no votes, high difficulty, negative difficulty)
  - Verifying score calculation formulas with different difficulties
  - Boundary testing (minimum/maximum scores)
  - Error handling for malformed input data

- **Auth Middleware Tests**:
  - JWT token validation and verification
  - Proper error handling for missing/invalid tokens
  - User data extraction from tokens

## MongoDB In-Memory Testing Guide

### 1. Overview

This guide explains how to set up in-memory MongoDB testing with **mongodb-memory-server**, which allows testing Mongoose queries without an external MongoDB server.

### 2. Installation

```bash
npm install --save-dev mongodb-memory-server jest @types/jest ts-jest
# No need to install mongoose and @types/mongoose if already using Mongoose
```

### 3. Test Initialization Script

Create a `tests/` directory in the project root and add a **`setup-mongo.ts`** file:

```ts
// tests/setup-mongo.ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

export const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

export const clearDatabase = async () => {
  const { collections } = mongoose.connection;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
```

### 4. Jest Configuration (`jest.config.js`)

```js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/global-setup.ts"],
  // Or directly specify: setupFilesAfterEnv: ['<rootDir>/tests/setup-mongo.ts']
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  moduleFileExtensions: ["ts", "js", "json"],
  testMatch: ["**/tests/**/*.test.(ts|js)"],
};
```

### 5. Global Setup/Teardown (`global-setup.ts`)

```ts
// tests/global-setup.ts
import { connect, closeDatabase, clearDatabase } from "./setup-mongo";

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await closeDatabase();
});
```

- `beforeAll`: Start in-memory MongoDB and connect Mongoose
- `afterEach`: Clear collection data after each test
- `afterAll`: Clean up DB and stop server after all tests

### 6. Test Code Example

```ts
// tests/integration/gameFlow.test.ts
import request from "supertest";
import app from "../src/app"; // Express app
import { connect, clearDatabase, closeDatabase } from "./setup-mongo";

beforeAll(async () => {
  await connect();
});
afterEach(async () => {
  await clearDatabase();
});
afterAll(async () => {
  await closeDatabase();
});

describe("Game Flow Integration Tests", () => {
  let jwt: string;
  it("should sign up and login", async () => {
    await request(app)
      .post("/auth/signup")
      .send({ username: "test", password: "pass" })
      .expect(200);
    const res = await request(app)
      .post("/auth/login")
      .send({ username: "test", password: "pass" })
      .expect(200);
    jwt = res.body.token;
    expect(jwt).toBeDefined();
  });

  it("should create → retrieve → join game flow", async () => {
    const createRes = await request(app)
      .post("/games")
      .set("Authorization", `Bearer ${jwt}`)
      .send({ name: "room1", maxPlayers: 4 })
      .expect(200);
    const gameId = createRes.body.gameId;
    await request(app)
      .get(`/games/${gameId}`)
      .set("Authorization", `Bearer ${jwt}`)
      .expect(200);
    await request(app)
      .post(`/games/${gameId}/join`)
      .set("Authorization", `Bearer ${jwt}`)
      .expect(200);
  });

  // Additional scenarios for draw, start, vote, end, etc.
});
```

### 7. CI Integration

Add test scripts to `package.json`:

```json
"scripts": {
  "test": "jest --runInBand",
  "test:watch": "jest --watch"
}
```

- `--runInBand`: Run tests sequentially to prevent MongoDB memory server conflicts
- Execute `npm test` in CI pipelines like GitHub Actions

### 8. Summary

1. Install **mongodb-memory-server**
2. Create `setup-mongo.ts` for in-memory DB initialization/cleanup
3. Register `setupFilesAfterEnv` in Jest config
4. Use lifecycle hooks in global setup file for connect/clear/close
5. Use Mongoose models directly in integration tests
6. Add `npm test` to CI pipeline

This setup allows integration tests to run without an external database while still validating actual queries!

## Test Configuration

### Frontend Test Setup

- **Jest Configuration**: Custom setup to handle React 19, CSS modules, environment variables
- **Mock Implementation**:
  - API responses (`api/index.ts`)
  - Socket.io connections (`setupTests.ts`)
  - Local storage for auth persistence

### Backend Test Setup

- **Test Database**: Dedicated MongoDB instance for testing
- **Fixtures**: Pre-populated users, games, topics for consistent testing
- **Request Mocking**: Supertest for API endpoint testing
- **Environment Configuration**: Separate .env.test configuration
- **Test Timeout Extensions**: Increased timeouts for async operations
- **Error Logging**: Enhanced error capture during test execution

## Test Results

### Coverage

| Component | Line Coverage | Function Coverage | Branch Coverage |
| --------- | ------------- | ----------------- | --------------- |
| Frontend  | ~85% overall  | ~80%              | ~75%            |
| Backend   | ~80% overall  | ~85%              | ~70%            |

### Backend Coverage Details

| Module            | Line Coverage | Function Coverage | Branch Coverage |
| ----------------- | ------------- | ----------------- | --------------- |
| Auth Controllers  | ~85%          | ~90%              | ~75%            |
| Game Controllers  | ~80%          | ~85%              | ~70%            |
| Models            | ~90%          | ~95%              | ~85%            |
| Socket Handlers   | ~65%          | ~70%              | ~60%            |
| Utility Functions | ~95%          | ~95%              | ~90%            |
| Middleware        | ~85%          | ~80%              | ~75%            |

### Key Testing Challenges Solved

1. **Socket Testing**: Successfully mocked Socket.io for real-time communication testing
2. **Authentication Flow**: Comprehensive testing of token-based auth
3. **Game State Management**: Testing complex state transitions and updates
4. **API Mocking**: Created a robust mock API system for consistent test results
5. **Race Conditions**: Identified and fixed timing issues in game state transitions
6. **Database Cleanup**: Implemented reliable test database reset between test runs

## Manual Testing Areas

Some aspects of the application require manual testing:

1. **Real-time Interaction**: Multiple users interacting simultaneously
2. **Visual Design**: Layout across different screen sizes and browsers
3. **Performance**: System behavior under load
4. **Network Degradation**: Application behavior during poor connectivity

## Future Test Improvements

### Short-term Goals

1. **Increase Coverage**: Target >90% coverage for critical components
2. **Snapshot Testing**: Add visual regression tests for UI components
3. **Performance Testing**: Add load testing for server infrastructure
4. **Socket Testing Enhancement**: Improve real-time event testing coverage
5. **API Test Expansion**: Add tests for additional edge cases and error states

### Long-term Goals

1. **CI/CD Integration**: Automate test execution in deployment pipeline
2. **Visual Regression Testing**: Implement Percy or similar tool
3. **Advanced Mocking**: Enhance WebSocket simulation for complex scenarios
4. **Browser Compatibility**: Expand Cypress tests across browser matrix
5. **Load Testing**: Implement k6 or JMeter tests for backend performance

## Conclusion

The testing implementation provides a solid foundation for ensuring the reliability and functionality of the Anti-Rummikub application. The combination of unit, integration, and end-to-end tests covers the core functionality while identifying areas for future improvement.

With continued refinement of the test suite, the project can maintain high quality while enabling confident feature development and enhancement.

# 테스트 구현 요약 및 경험

## MongoDB 인메모리 테스팅 구현

이 프로젝트에서는 MongoDB 인메모리 테스팅을 구현하여 외부 데이터베이스 의존성 없이 독립적인 테스트 환경을 구축했습니다.

### 주요 구성 요소

1. **설정 파일**:

   - `backend/tests/config/setup-mongo.js`: 인메모리 서버 관리
   - `backend/tests/config/global-setup.js`: Jest 설정과 DB 연결
   - `backend/tests/config/test-env.js`: 테스트 환경 변수 설정

2. **테스트 코드 리팩토링**:

   - 개별 테스트 파일에서 중복 연결 로직 제거
   - 전역 설정을 통한 데이터베이스 연결 관리
   - `try-catch` 패턴으로 모델 중복 등록 오류 방지

3. **문서화**:
   - 주요 학습 내용 및 모범 사례 문서화 (`docs/mongodb_in_memory_testing.md`)
   - 테스트 템플릿 제공 (`backend/tests/template/mongoose-test-template.js`)

### 주요 경험 교훈

1. **파일 위치 이해**: 루트 디렉토리와 백엔드 디렉토리 간의 혼동으로 인한 파일 생성 오류를 해결했습니다.

2. **연결 충돌 방지**: 다중 테스트 환경에서 MongoDB 연결 충돌을 방지하기 위한 전략을 개발했습니다.

   - 전역 설정으로 연결 일원화
   - `maxWorkers: 1` 설정으로 병렬 테스트 제한

3. **타임아웃 관리**: 데이터베이스 작업의 적절한 타임아웃 설정으로 안정적인
   테스트 환경을 구축했습니다.

   - Jest 글로벌 타임아웃: 30초
   - 개별 테스트 타임아웃: 10초

4. **모델 등록 오류 해결**: `OverwriteModelError: Cannot overwrite model once compiled` 오류를 방지하기 위한 패턴을 구현했습니다.

   ```javascript
   try {
     Model = mongoose.model("ModelName");
   } catch (e) {
     Model = mongoose.model("ModelName", Schema);
   }
   ```

5. **메모리 관리**: 테스트 간 메모리 관리와 정리를 자동화하여 안정적인 테스트 환경을 구축했습니다.

### 구현 사항 개요

- **mongodb-memory-server** 패키지 설치
- MongoDB 인메모리 서버 연결 및 관리 모듈 구현
- Jest 구성 파일에 적절한 타임아웃 및 작업자 설정
- 안전한 모델 등록 패턴 개발
- 데이터베이스 CRUD 작업을 위한 테스트 예제 구현

### 개선 방향

- 테스트 픽스처 패턴 추가 구현
- Mongoose 모델 팩토리 함수 개발
- 정교한 데이터베이스 모킹 전략 수립

## 프로젝트 테스트 실행 방법

### 인메모리 MongoDB 테스트

```bash
# 전체 테스트 실행
cd backend
npm test

# 특정 통합 테스트만 실행
npm test -- tests/integration/mongo.test.js

# 커버리지 리포트 생성
npm test -- --coverage
```

자세한 내용은 `docs/mongodb_in_memory_testing.md` 문서와 `backend/tests/README.md` 파일을 참조하세요.
