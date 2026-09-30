# API Mocking Strategy — Decision Record

## Context

forma-initiale uses hexagonal architecture (domain → infra adapters → apps). Infra adapters use `fetch` for HTTP calls. Need a strategy for providing mock API data during dev and in tests.

## Options Considered

### 1. mocki.io

Simple external JSON hosting. Zero setup. But: external dependency, breaks offline, no test integration, static only.

### 2. MSW (Mock Service Worker)

Intercepts network at service worker level. Works for both dev (browser SW) and test (Node). Type-safe handlers, realistic `fetch` interception, no external dependency, huge ecosystem. Some setup complexity.

### 3. faux-api.com

Richer mock API hosting. Same cons as mocki.io — external, offline breaks, no test integration.

### 4. Own Fastify mock service

Custom Node.js Fastify server. Full control, fullstack learning opportunity, no external dep, can evolve into real BE. Downsides: more code to maintain, needs separate process in dev, doesn't help in tests.

## Recommendation

**Primary: MSW.** Single tool covers dev + test. Infra adapters make real `fetch` calls → MSW intercepts. Type-safe. No external dep. Works offline.

**Future stretch goal: Own Fastify mock service** as `apps/mock-api/` when fullstack BE experience is desired. MSW can still stub it during tests.

## Architecture Fit

```
┌─────────────┐     fetch     ┌──────────────┐
│  App (Vue)  │ ──────────▶  │  MSW Handler  │
│  (dev/test) │ ◀──────────  │  (browser/Node)│
└─────────────┘              └──────────────┘
       │                            │
       │ domain contracts           │ mock data
       ▼                            ▼
┌─────────────┐              ┌──────────────┐
│ Infra       │              │  fixtures/   │
│ adapters    │              │  handlers/   │
└─────────────┘              └──────────────┘
```

## Key Decision

Adopt MSW as the API mocking strategy. Keep option of Fastify mock service open as a future enhancement.

## Open Questions

- Where do MSW handlers live? (`packages/infra/mock/` or a new `packages/mock-api/`?)
- How do handlers get their data (static fixtures vs factory fns)?
- Type sharing: domain types → mock handlers → infra adapters

## References

- [MSW docs](https://mswjs.io)
- [Mocking APIs with MSW (dev.to)](https://dev.to/kevin-uehara/mocking-your-apis-calls-using-mocking-service-worker-msw-7k6)
