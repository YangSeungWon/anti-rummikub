# Anti-Rummikub: Improv Showdown – 시스템 아키텍처 설계

---

## 1. 아키텍처 다이어그램 (Mermaid)

```mermaid
graph TD
  A[클라이언트 (웹/모바일)]
  B[API 서버 (Node.js/Express)]
  C[WebSocket 서버 (Socket.IO)]
  D[DB (PostgreSQL)]
  E[Redis (Pub/Sub, 세션, 캐시)]

  A -- REST API --> B
  A -- 실시간 통신 --> C
  B -- DB 쿼리 --> D
  C -- 게임 상태/이벤트 --> E
  B -- 캐시/세션 --> E
  C -- DB 동기화 --> D
```

---

## 2. 구성요소별 역할

- **클라이언트 (웹/모바일)**: UI/UX, 사용자 입력, 실시간 이벤트 처리
- **API 서버**: 회원가입/로그인, 게임방 관리, 점수 집계 등 REST API 제공
- **WebSocket 서버**: 실시간 게임 이벤트(투표, 타이머, 채팅 등) 중계
- **DB (PostgreSQL)**: 사용자, 게임, 라운드, 투표 등 영속 데이터 저장
- **Redis**: 실시간 Pub/Sub, 세션 관리, 캐싱, 장애 복구 지원

---

## 3. 부가 설명

- 서버는 확장성(수평 확장)과 장애 대응(이중화) 고려
- 실시간 동기화는 Redis Pub/Sub 기반
- 인증/인가(토큰, 세션 등)는 API 서버에서 처리
