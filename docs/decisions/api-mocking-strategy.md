# API Mocking Strategy Decision

**Context:** Hexagonal architecture monorepo (Vue 3 → domain → infra adapters). Infra adapters use `fetch` for HTTP calls. Need mock API data during dev and in tests.

**Goal:** Single mocking tool that works for both development (browser) and automated tests (Node). No external dependency for mock data.

---

## Candidates Evaluated

| Solution | Type | Verdict |
|----------|------|---------|
| **MSW (Mock Service Worker)** | Network interception (SW + Node) | ✅ **Adopt** |
| mocki.io | External static JSON hosting | ❌ Skip (external dep, breaks offline, no test integration) |
| faux-api.com | External rich mock API | ❌ Skip (same cons as mocki.io) |
| Own Fastify mock service | Custom Node.js server | ⏳ Future stretch goal |

---

## Recommendation

### 🥇 MSW — Adopt

MSW intercepts network requests at the service worker level in browser and at the Node level in tests. This means:

- **Dev:** MSW runs in the browser via service worker. Infra adapters make real `fetch` calls → MSW returns mock responses. No CORS concerns, no external API needed.
- **Test:** MSW runs in Node (vitest). Same handlers as dev. Tests exercise real `fetch` through infra adapters.
- **Type safety:** Handlers share types with domain models.
- **No external dependency:** Everything runs locally.
- **Offline:** Full dev flow without internet.

### Architecture fit

MSW sits between infra adapters (which call `fetch`) and the network. The adapters remain unchanged — they don't know MSW exists. This is clean hexagonal separation: adapters call `fetch` → MSW intercepts → returns mock data.

### ⏳ Own Fastify mock service — Future stretch

If fullstack BE experience is desired later, build a Fastify `apps/mock-api/` service. MSW can still stub it during tests. This is a future enhancement, not current scope.

---

## Key Decisions

| # | Decision | Choice | Rationale |
|---|----------|--------|-----------|
| 1 | API mocking strategy | MSW | Single tool for dev + test, realistic `fetch` interception, type-safe handlers, no external dep, works offline |
| 2 | Fastify mock server | Postpone | Future stretch goal if fullstack BE exp desired. MSW covers current needs |

## Resolved Questions

| Question | Decision |
|----------|----------|
| Where do MSW handlers live? | `packages/infra/mocks/` |
| Static fixtures vs factory functions? | Factories (no faker, sequential counter + sensible defaults). Static fixtures for edge-case scenarios. Hybrid approach. |
| Type sharing? | Handlers import domain types directly (`@repo/domain`). Handler response shape matches real API envelope. KISSME-SINE — no extra abstraction layer until needed. |

## References

- [Design Patterns and Principles ADR](../ADRS/design-patterns.md) — KISSME and SINE principles
- [MSW docs](https://mswjs.io)
- [Mocking APIs with MSW (dev.to)](https://dev.to/kevin-uehara/mocking-your-apis-calls-using-mocking-service-worker-msw-7k6)

*Decision recorded 2026-05-27.*
