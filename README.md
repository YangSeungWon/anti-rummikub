# Anti-Rummikub: Improv Showdown

실시간 즉흥 게임으로 친구들과 창의성을 발휘해보세요!

## 테스트 전략

프로젝트 안정성을 위해 다양한 수준의 테스트를 구현했습니다:

### 1. 유닛 테스트 (Unit Tests)

- **프론트엔드 테스트**: Jest + React Testing Library

  - API 클라이언트 (인터셉터, 인증 로직)
  - 훅 (useSocket, useGameSocket)
  - 컴포넌트 (LoginForm, Timer, VoteBar)

- **백엔드 테스트**: Jest
  - 점수 계산 로직 (scoreCalculator)
  - 조인/시작/투표/종료 흐름 유닛 테스트
  - 모델 검증 로직

### 2. 통합 테스트 (Integration Tests)

- **백엔드 API 통합 테스트**:
  - 전체 게임 흐름: 로그인 → 방 생성 → 참가 → 게임시작 → 라운드 진행 → 투표 → 종료
  - 오류 처리: 권한, 유효성 검증, 중복 참가

### 3. E2E 테스트 (End-to-End Tests)

- **실제 사용자 흐름**: Cypress
  - 회원가입, 로그인, 방 생성, 참가
  - 게임 플레이, 투표, 점수 확인
  - 로그아웃

### 4. MongoDB 인메모리 테스팅

- **MongoDB Memory Server** 활용:
  - 외부 DB 의존성 없는 독립적인 테스트 환경
  - 테스트 간 독립성 보장 (데이터 간섭 방지)
  - CI/CD 환경에서 쉬운 통합

[MongoDB 인메모리 테스팅 상세 가이드](docs/mongodb_in_memory_testing.md)

## 테스트 실행 방법

### 프론트엔드 테스트

```bash
# 유닛 테스트 실행
cd frontend
npm test

# 특정 파일만 테스트
npm test -- -t "apiClient"

# 테스트 커버리지 확인
npm test -- --coverage
```

### 백엔드 테스트

```bash
# 유닛 테스트 실행
cd backend
npm test

# 통합 테스트만 실행
npm test -- tests/integration

# 커버리지 확인
npm test -- --coverage
```

### E2E 테스트

```bash
# Cypress 열기
cd frontend
npm run cypress:open

# 헤드리스 모드에서 실행
npm run cypress:run
```

## MongoDB 인메모리 테스팅 주요 특징

### 설치

```bash
npm install --save-dev mongodb-memory-server mongoose
```

### 주요 구성 요소

1. **설정 파일**:
   - `tests/config/setup-mongo.js`: 인메모리 서버 관리
   - `tests/config/global-setup.js`: Jest 설정과 DB 연결
   - `tests/config/test-env.js`: 테스트 환경 변수 설정

2. **특징**:
   - 테스트마다 깨끗한 DB 환경 제공
   - 외부 MongoDB 서버 불필요
   - 빠른 테스트 실행 속도
   - 동시 테스트 실행 시 충돌 방지 (`maxWorkers: 1`)

3. **학습된 모범 사례**:
   - 모델 등록 시 중복 오류 방지 (`try-catch` 사용)
   - 개별 테스트 파일에서 수동 연결 지양
   - 적절한 타임아웃 설정 (테스트당 10초, 글로벌 30초)
   - 테스트 간 자동 데이터 정리 사용

## 수동 테스트 체크리스트

자동화 테스트 외에 아래 항목들은 수동으로 테스트하는 것이 좋습니다:

1. **크로스 브라우저 호환성**:

   - Chrome, Firefox, Safari에서 동일하게 작동하는지 확인
   - 모바일 기기 및 다양한 화면 크기에서 레이아웃 확인

2. **실시간 기능**:

   - 여러 사용자 간 실시간 통신 확인
   - 네트워크 지연/재연결 상황에서의 동작 확인

3. **에러 처리**:
   - 서버 다운 상황에서의 사용자 경험
   - 네트워크 오류 시 적절한 피드백 제공

## 개선 방향

- CI/CD 파이프라인과 테스트 자동화 통합
- Percy 등을 활용한 시각적 회귀 테스트 추가
- 성능 테스트: 동시 사용자 수 증가에 따른 영향 측정
