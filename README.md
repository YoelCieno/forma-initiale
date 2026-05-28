# forma-initiale

Build systems monorepo scaffold using hexagonal architecture with Turborepo + bun.

## Architecture

Hexagonal (Ports & Adapters):

```
domain → infra → packages/ui (agnostic) → apps (framework-specific)
```

- **domain** — core business logic, pure TS, zero framework deps
- **infra** — adapters implementing domain contracts (API clients, storage, etc.)
- **packages/ui** — shared components, framework-agnostic (vanilla TS)
- **apps** — framework-specific application wrappers

| App | Stack | Status |
|-----|-------|--------|
| `apps/web-vue` | Vue 3 + Vite 6 | Active |
| `apps/docs` | Astro + Starlight | Active |
| `apps/web-angular` | Angular | Future |
| `apps/web-react` | React | Future |

## Project structure

```
forma-initiale/
├── apps/
│   ├── web-vue/          # Vue 3 app (Vite 6 via Vite+)
│   └── docs/             # Documentation site
├── packages/
│   ├── domain/           # Pure TS models, ports
│   ├── infra/            # Adapters (domain contracts)
│   ├── ui/               # Framework-agnostic shared components
│   ├── eslint-config/    # Shared ESLint 8 config (CJS)
│   └── typescript-config/# Shared tsconfigs (base.json, vite.json)
├── package.json          # Root workspace config
├── turbo.json            # Turborepo pipeline
└── .mise.toml            # Tool version manager
```

## Getting started

```bash
bun install
bun run dev
```

Starts all apps in dev mode (web-vue on localhost:5173, docs on localhost:4321).

## Commands

| Command | Action |
|---------|--------|
| `bun run dev` | Start all apps (dev mode, persistent) |
| `bun run build` | Build all apps |
| `bun run lint` | Lint all packages |
| `bun run test` | Run tests (Vitest) |
| `bun run format` | Format code (Prettier) |

## Environment variables

Copy `apps/web-vue/.env.example` to `apps/web-vue/.env` and adjust:

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `https://api.example.com/api` | API base URL (no trailing slash) |
| `VITE_ENABLE_MOCKS` | `true` | Enable mock service worker in dev |

Vite requires the `VITE_` prefix for client-exposed variables. All `.env` files are gitignored; commit only `.env.example`.

## MSW (Mock Service Worker)

[Mock Service Worker](https://mswjs.io/) intercepts HTTP requests at the network level, used for development and testing.

### Mocks location

Mocks live in `packages/infra/src/mocks/` — separated by domain feature:

```
packages/infra/src/mocks/
├── browser.ts       # Browser worker (for dev mode)
├── server.ts        # Node server (for tests)
├── handlers/        # Request handlers per domain
└── factories/       # Test data factories
```

### Usage in development

Set `VITE_ENABLE_MOCKS=true` (default in `.env`). MSW worker starts automatically in the browser on `bun run dev`.

### Usage in tests

Import MSW server directly in spec files:

```ts
import { setupServer } from 'msw/node'
import { handlers } from '@repo/infra/mocks/server'  // adjust import path

const server = setupServer(...handlers)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Updating the service worker

When upgrading MSW, regenerate the worker script:

```bash
# ✅ Use bun x (not npx — npm has override conflicts with this project)
bun x msw init apps/web-vue/public/

# Review changes and commit
git diff apps/web-vue/public/mockServiceWorker.js
git add apps/web-vue/public/mockServiceWorker.js
git commit -m "chore(web): update MSW worker"
```

> ⚠️ **Do not use `npx`** — the root `package.json` overrides vitest to `@voidzero-dev/vite-plus-test`, which causes an npm `EOVERRIDE` error. Use `bun x` instead.

## Documentation

- `docs/dependency-management.md` — Dependency update strategies (taze + turbo, Renovate)
- `docs/decisions/docs-solution.md` — Docs solution decision record

## Tech stack

- **Framework:** Vue 3 (`apps/web-vue`)
- **Language:** TypeScript 5.5.4
- **Build:** Vite 6 (via Vite+ `vp` CLI), Turborepo 2.9.14
- **Package manager:** bun 1.3.13
- **Test:** Vitest (via Vite+), Vue Test Utils, jsdom
- **Mock:** MSW (Mock Service Worker) — handlers, browser worker, Node server
- **Lint:** ESLint 8 (CJS), Prettier 3
- **Tools:** unplugin-auto-import, unplugin-vue-components
