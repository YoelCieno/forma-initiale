# Research: `createWhiteLabelApp` SRP Decomposition

**Date:** 2026-06-30
**Mode:** Deep Dive
**Topic:** Refactoring `createWhiteLabelApp()` into single-responsibility modules — naming, structure, and tradeoffs.

---

## Motivation

`createWhiteLabelApp()` in `apps/white-label-vue/src/app.ts` performs 4 distinct concerns in one function:

1. **Mock bootstrap** — env check + MSW worker start (side effect)
2. **AppShell resolution** — default `App.vue` import or custom shell (async import)
3. **Router setup** — route merging logic + `createRouter` call (config + instantiation)
4. **Metadata injection** — Vue `provide` for product meta overrides (side effect)

This violates SRP: the function is hard to test (mocks, routing, injection all coupled), hard to reason about (4 concerns interleaved), and hard to extend (adding a 5th concern requires modifying the same function).

## Core Concepts

### SRP in Factory Functions

A factory function should orchestrate, not implement. The distinction:

| Role             | Responsibility                                          |
| ---------------- | ------------------------------------------------------- |
| **Orchestrator** | Calls sub-functions in sequence, wires outputs together |
| **Implementer**  | Contains actual logic for one concern                   |

Current `createWhiteLabelApp` is both — it imports nothing from a local support module and implements all 4 concerns inline.

### Vue App Bootstrap Patterns

Common patterns in Vue 3 ecosystem for app initialization:

| Pattern                   | Examples                       | When                   |
| ------------------------- | ------------------------------ | ---------------------- |
| `src/bootstrap/`          | Nuxt plugins, Vite SSR setups  | Multi-stage app init   |
| `src/init/`               | Vue 3 app setup guides         | Simple linear setup    |
| `src/app/` config objects | Vite SSR, create-vue templates | Config-driven setup    |
| Plugin-based              | Vue.use(), app.use()           | For library consumers  |
| Hook/pipeline             | BeforeMount hooks              | Complex startup chains |

The **config-object** pattern (what exists now) is simplest for consumers but pushes complexity into the factory internals.

## How It Works (Current Code Flow)

```
createWhiteLabelApp(opts)
  │
  ├─ 1. MOCK CHECK
  │     if (DEV && VITE_ENABLE_MOCKS === 'true')
  │       → dynamic import('@repo/infra/mocks/browser')
  │       → worker.start()
  │
  ├─ 2. SHELL RESOLVE
  │     opts.appShell ? await opts.appShell()
  │                    : await import('./App.vue')
  │     → Component
  │
  ├─ 3. ROUTER SETUP
  │     opts.routes ? use directly
  │     : merge wlRoutes + opts.extendRoutes
  │     : filter by opts.omitRoutePaths
  │     → createRouter({ history: hash, routes })
  │
  ├─ 4. APP CREATE + PROVIDE
  │     createApp(AppShell)
  │     app.use(router)
  │     if (opts.metaMap) app.provide(KEY, metaMap)
  │
  └─ return { app, router }
```

All 4 steps are **sequential but not interdependent** — no step needs the result of a previous step (except step 4 needs shell + router from steps 2–3). This makes decomposition straightforward.

## Key Findings

### 1. Public API must remain `white-label-vue/app`

The `package.json` exports `"./app": "./src/app.ts"`. Both `main.ts` and `fake-plants-vue/src/main.ts` import from `white-label-vue/app`. The export path is stable and documented. **Refactoring MUST preserve this** — `app.ts` stays as the public entry.

### 2. Each concern is independently testable today

Existing tests in `app.spec.ts` confirm:

- Route merging can be tested without mocks starting (test mocks `@repo/infra/mocks/browser`)
- Shell override is cleanly injected via opts
- metaMap injection is independently assertable via `_context.provides`

But: all tests go through the full `createWhiteLabelApp` function. Extracting concerns would allow **unit tests** for route merging logic without the full bootstrap context.

### 3. `META_MAP_INJECTION_KEY` is consumed in `composables/useProducts.ts`

The injection key is imported from `../app`. After refactoring, this import would move to the new metadata module. This is a trivial import path change.

### 4. `bootstrap/` is the strongest folder name

Analysis of ecosystem conventions:

| Name         | Familiarity                  | Clarity                                                           | Collision risk                                  |
| ------------ | ---------------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| `bootstrap/` | High (JS/TS ecosystem)       | High — "app bootstrap" = startup                                  | Low                                             |
| `init/`      | High (Vue, Node)             | Medium — could mean file init                                     | Low                                             |
| `boot/`      | Medium (Spring, but not Vue) | Lower — obscure for Vue devs                                      | Low                                             |
| `factory/`   | High                         | Medium — too generic, codebase already calls `app.ts` the factory | Medium — collides with "design pattern" meaning |
| `setup/`     | Medium                       | Good                                                              | None                                            |
| `startup/`   | Low                          | Good                                                              | None                                            |
| `app-init/`  | Low                          | Good                                                              | Medium — "app" is redundant under `src/`        |

**Winner: `bootstrap/`** — most conventional in JS ecosystem for app initialization steps. It's used in Vite SSR templates, `create-vue` (early versions), and Nuxt plugin system documentation. It clearly signals "things that run once before the app mounts."

### 5. The "orchestrator in app.ts" pattern is clean

The extraction should keep `app.ts` as the thin orchestrator that imports from `./bootstrap/*`. This preserves:

- Public API path (`white-label-vue/app`)
- Single entry point for consumers
- Import chaining for internal consumers (`useProducts.ts` importing from `../bootstrap/metadata`)

## Relation to Codebase

### Existing `src/` structure

```
src/
├── app.ts           ← factory (this is the target)
├── main.ts          ← entry (calls factory)
├── routes.ts        ← route definitions (already extracted)
├── app.spec.ts      ← factory tests
├── composables/     ← Vue composables
├── components/      ← Vue SFCs
├── pages/           ← route pages
├── helpers/         ← misc helpers
├── utils/           ← empty
├── styles/          ← CSS
```

The `routes.ts` extraction precedent is instructive: routes were historically in `app.ts`, then extracted to `routes.ts`. This shows the team already understands the value of extracting concerns from the factory.

### Current `app.spec.ts` test surface

- **Route merging**: 6 tests (defaults, extend, override, precedence, omit)
- **Meta injection**: 2 tests (provided, not provided)
- **Shell override**: 1 test (custom shell mounts correctly)

After decomposition, each extracted module would have its own spec:

- `bootstrap/router.spec.ts` — pure function tests for route merging logic (no `async`, no `createApp`)
- `bootstrap/metadata.spec.ts` — test `injectMetaMap` standalone
- `bootstrap/mocks.spec.ts` — test conditional import logic
- `bootstrap/shell.spec.ts` — test dynamic import resolution

## Actionable Insights

### Recommended structure

```
src/bootstrap/
├── mocks.ts          ← setupMocks(): conditional MSW bootstrap
├── shell.ts          ← resolveShell(opts): shell component resolution
├── router.ts         ← createWlRouter(opts): route merge + createRouter
├── metadata.ts       ← injectMetaMap(app, metaMap): provide injection
└── index.ts          ← (optional) barrel re-export

src/app.ts            ← thin orchestrator, imports from ./bootstrap/*
```

### Decomposed `app.ts` would look like:

```ts
import { createApp } from 'vue'
import { setupMocks } from './bootstrap/mocks'
import { resolveAppShell } from './bootstrap/shell'
import { createWlRouter } from './bootstrap/router'
import { injectMetaMap } from './bootstrap/metadata'
import type { WhiteLabelAppOptions, WhiteLabelApp } from './bootstrap/types'

export { META_MAP_INJECTION_KEY } from './bootstrap/metadata'

export async function createWhiteLabelApp(
  opts: WhiteLabelAppOptions,
): Promise<WhiteLabelApp> {
  await setupMocks()
  const AppShell = await resolveAppShell(opts)
  const router = createWlRouter(opts)
  const app = createApp(AppShell)
  app.use(router)
  injectMetaMap(app, opts.metaMap)
  return { app, router }
}
```

Each import is a single-responsibility module that can be tested, typed, and understood independently.

### Module details

#### `bootstrap/mocks.ts`

```ts
export async function setupMocks(): Promise<void> {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { worker } = await import('@repo/infra/mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }
}
```

- Pure function (no app dependency)
- Testable by mocking dynamic import + env vars

#### `bootstrap/shell.ts`

```ts
import type { Component } from 'vue'
import type { WhiteLabelAppOptions } from './types'

export async function resolveAppShell(
  opts: WhiteLabelAppOptions,
): Promise<Component> {
  if (opts.appShell) {
    return (await opts.appShell()).default
  }
  return (await import('../App.vue')).default
}
```

- Pure async function, no side effects beyond dynamic import
- Testable by passing custom shell or default

#### `bootstrap/router.ts`

```ts
import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { WhiteLabelAppOptions } from './types'
import { routes as wlRoutes } from '../routes'

export function createWlRouter(opts: WhiteLabelAppOptions) {
  const mergedRoutes =
    opts.routes ??
    [...wlRoutes, ...(opts.extendRoutes ?? [])].filter(
      (r) => !(opts.omitRoutePaths ?? []).includes(r.path ?? ''),
    )

  return createRouter({
    history: createWebHashHistory(),
    routes: mergedRoutes,
  })
}
```

- Synchronous (pure config transform + Router instantiation)
- Route merging logic now fully testable without `createApp`

#### `bootstrap/metadata.ts`

```ts
import type { App } from 'vue'
import type { ProductMeta } from '@repo/presenters'

export const META_MAP_INJECTION_KEY = 'metaMap'

export function injectMetaMap(
  app: App,
  metaMap?: Record<string, ProductMeta>,
): void {
  if (metaMap) {
    app.provide(META_MAP_INJECTION_KEY, metaMap)
  }
}
```

- Simple pure function + injection key
- `useProducts.ts` imports `META_MAP_INJECTION_KEY` from `../bootstrap/metadata` instead of `../app`

#### `bootstrap/types.ts`

Move `WhiteLabelAppOptions` and `WhiteLabelApp` interfaces from `app.ts` to here. `app.ts` re-exports them.

### Migration path

1. Create `src/bootstrap/` dir + 5 files (mocks, shell, router, metadata, types)
2. Refactor `app.ts` to thin orchestrator
3. Update imports in `app.spec.ts` and `useProducts.ts`
4. Verify `white-label-vue/app` export path still works
5. Run full test suite

## Open Questions

1. **`boot/` vs `bootstrap/`?** — `boot/` is shorter but less conventional in Vue ecosystem. `bootstrap/` wins for clarity.
2. **Should `types.ts` live in `bootstrap/` or stay in `app.ts`?** — Moving to `bootstrap/types.ts` keeps types colocated with their consumers. Exports from `bootstrap/types` and `app.ts` re-exports them for public API.
3. **Barrel export?** — `bootstrap/index.ts` re-exporting all modules is optional; `app.ts` imports directly from individual modules (tree-shake friendly, explicit deps).
4. **Does the existing `app.spec.ts` need restructuring too?** — Yes, but can be done incrementally: add new spec files for each extracted module, then clean up the original.

## References

- Codebase: `apps/white-label-vue/src/app.ts` (primary target)
- Codebase: `apps/white-label-vue/src/app.spec.ts` (test surface)
- Codebase: `apps/white-label-vue/src/routes.ts` (extraction precedent)
- Codebase: `apps/white-label-vue/src/composables/useProducts.ts` (consumer of META_MAP_INJECTION_KEY)
- Codebase: `apps/white-label-vue/package.json` (export path: `"./app"`)
- Codebase: `apps/fake-plants-vue/src/main.ts` (consumer of factory)
- AGENTS.md: App factory pattern documentation
- docs/CODEMAPS/ARCHITECTURE.md: Layer factory pattern ADR (line 135)

Source/s: forma-initiale codebase inspection at `/data/sites/build-systems/forma-initiale/apps/white-label-vue/src/app.ts`
