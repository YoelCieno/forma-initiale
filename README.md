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

## Documentation

- `docs/dependency-management.md` — Dependency update strategies (taze + turbo, Renovate)
- `docs/decisions/docs-solution.md` — Docs solution decision record

## Tech stack

- **Framework:** Vue 3 (`apps/web-vue`)
- **Language:** TypeScript 5.5.4
- **Build:** Vite 6 (via Vite+ `vp` CLI), Turborepo 2.9.14
- **Package manager:** bun 1.3.13
- **Test:** Vitest (via Vite+), Vue Test Utils, jsdom
- **Lint:** ESLint 8 (CJS), Prettier 3
- **Tools:** unplugin-auto-import, unplugin-vue-components
