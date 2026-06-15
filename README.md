# forma-initiale

Build systems monorepo scaffold using hexagonal architecture with Turborepo + bun.

## Architecture

Hexagonal (Ports & Adapters):

```
domain → presenters → infra → packages/ui (agnostic) → apps (framework-specific)
```

- **domain** — core business logic, pure TS, zero framework deps
- **presenters** — presentation layer transforming domain models into view models
- **infra** — adapters implementing domain contracts (API clients, storage, etc.)
- **packages/ui** — shared components, framework-agnostic (vanilla TS)
- **apps** — framework-specific application wrappers

| App | Stack | Status |
|-----|-------|--------|
| `apps/white-label-vue` | Vue 3 + Vite 6 | Active (layer base) |
| `apps/docs` | Astro + Starlight | Active |
| `apps/web-angular` | Angular | Future |
| `apps/web-react` | React | Future |

## Project structure

```
forma-initiale/
├── apps/
│   ├── white-label-vue/    # Vue 3 app (Vite 6 via Vite+), layer base for tenants
│   └── docs/             # Documentation site
├── packages/
│   ├── domain/           # Pure TS models, ports
│   ├── presenters/       # Presentation layer (domain → view models)
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

Starts all apps in dev mode (white-label-vue on localhost:5173, docs on localhost:4321).

## Commands

| Command | Action |
|---------|--------|
| `bun run dev` | Start all apps (dev mode, persistent) |
| `bun run build` | Build all apps |
| `bun run lint` | Lint all packages |
| `bun run test` | Run tests (Vitest) |
| `bun run format` | Format code (Prettier) |

## Dependency Automation

This repo uses **Renovate** via GitHub Actions to automatically create and merge PRs for outdated dependencies.

### Configuration

- **Schedule:** Every Monday at 5:00 AM UTC
- **Auto-merge:** Enabled for minor & patch updates (CI must pass)
- **Manual trigger:** Go to GitHub → Actions → `Renovate Dependencies` → `Run workflow`
- **Config:** `.github/workflows/renovate.yml` + `renovate.json`

### Requirements

- **GitHub Secret:** `RENOVATE_TOKEN` (PAT with `repo` scope) — required for PR creation & auto-merge
- **Lockfile:** `bun.lock` (detected automatically via `renovate.json` `bun.enabled: true`)

### Major Updates

Major version bumps require **manual approval** (disabled auto-merge) to prevent breaking changes. Review PRs carefully before merging.

## Environment variables

Copy `apps/white-label-vue/.env.example` to `apps/white-label-vue/.env` and adjust:

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
bun x msw init apps/white-label-vue/public/

# Review changes and commit
git diff apps/white-label-vue/public/mockServiceWorker.js
git add apps/white-label-vue/public/mockServiceWorker.js
git commit -m "chore(web): update MSW worker"
```

> ⚠️ **Do not use `npx`** — the root `package.json` overrides vitest to `@voidzero-dev/vite-plus-test`, which causes an npm `EOVERRIDE` error. Use `bun x` instead.

## Documentation

- `docs/dependency-management.md` — Dependency update strategies (taze + turbo, Renovate)
- `docs/decisions/docs-solution.md` — Docs solution decision record

## Theming & Design Tokens

The project uses WebAwesome 3.7 as its design system. Styles are split into three layers:

1. **WA base** (`@repo/ui/styles`) — imports `native.css` + `utilities.css` (theme-agnostic reset + utilities)
2. **WA theme** (`@repo/ui/styles/themes/<name>`) — each app imports its chosen theme (default, awesome, shoelace)
3. **DS tokens** (`apps/*/src/styles/tokens/`) — app-level `--wa-*` CSS custom property overrides (brand colors, typography, spacing)

All apps load them via `main.ts`:

```typescript
import '@repo/ui/styles'           // WA base (no theme)
import '@repo/ui/styles/themes/default'  // WA default theme
import './styles/tokens.css'         // DS token overrides
```

**Rule**: Never hardcode colors/spacing/typography — always use `var(--wa-*)` CSS custom properties.

## Tech stack

- **Framework:** Vue 3 (`apps/white-label-vue`)
- **Language:** TypeScript 5.5.4
- **Build:** Vite 6 (via Vite+ `vp` CLI), Turborepo 2.9.14
- **Package manager:** bun 1.3.13
- **Test:** Vitest (via Vite+), Vue Test Utils, jsdom
- **Mock:** MSW (Mock Service Worker) — handlers, browser worker, Node server
- **Lint:** ESLint 8 (CJS), Prettier 3
- **Tools:** unplugin-auto-import, unplugin-vue-components
