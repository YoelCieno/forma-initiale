# Phase 3 — Presenter Layer + White-Label Extend

**Status:** ✅ PARTIALLY COMPLETED (3.1-3.3, 3.5, 3.6 done; 3.4 PENDING)

## Granular Breakdown

See [`phase-3/README.md`](./phase-3/README.md) for full task breakdown with sub-docs per deliverable.

| # | Deliverable | Doc | Status |
|--------|------------|-----|--------|
| 3.1 | `@repo/presenters` (pre-req) | [`phase-3/3.1-presenters.md`](./phase-3/3.1-presenters.md) | ✅ COMPLETED |
| 3.2 | Rename web-vue → white-label-vue + layer factory | [`phase-3/3.2-white-label-rename.md`](./phase-3/3.2-white-label-rename.md) | ✅ COMPLETED |
| 3.3 | `fake-plants-vue` example tenant (manual) | [`phase-3/3.3-fake-plants-vue.md`](./phase-3/3.3-fake-plants-vue.md) | ✅ COMPLETED |
| 3.4 | `@repo/generator` + Vue tenant Pinion generator | [`phase-3/3.4-generator.md`](./phase-3/3.4-generator.md) | ❌ PENDING |
| 3.5 | Turborepo pipeline update | [`phase-3/3.5-turbo-pipeline.md`](./phase-3/3.5-turbo-pipeline.md) | ✅ COMPLETED |
| 3.6 | Documentation updates | [`phase-3/3.6-documentation.md`](./phase-3/3.6-documentation.md) | ✅ PARTIALLY (CODEMAPS done, AGENTS.md/README.md synced) |

## Goal

Complete the hexagonal architecture stack with a Presenter layer, then enable multi-tenant white-label apps via a Nuxt-style layer system + Pinion generator.

## Architecture (after Phase 3)

```
domain → infra → presenters → apps/white-label-* → apps/tenant-*
```

Packages:
- `@repo/domain` — pure TS models/ports (exists)
- `@repo/infra` — adapters (exists)
- `@repo/presenters` — DomainModel → ViewModel transformations **(NEW)**
- `@repo/ui` — WA web components (exists)
- `@repo/generator` — Pinion-based code generator **(NEW)**

Apps:
- `white-label-vue` — renamed from web-vue (layer base)
- `tenant-<name>-vue` — generated via Pinion (extends white-label)
- `fake-plants-vue` — demo tenant (manual, validates mechanism)

## Layer Mechanism (No Vite Plugin Package)

Phase 3 uses white-label-vue's own exported config + factory. No separate `@repo/vite-plugin-layer` package. Layer utility code lives inside white-label-vue itself.

### White-label app structure

```
apps/white-label-vue/
  layer.config.ts         ← exports component dirs, route config, Vite extensions
  src/
    app.ts                ← exports createWhiteLabelApp() factory
    main.ts               ← standalone entry (calls factory with defaults)
    components/           ← default components
    pages/                ← default pages
    styles/tokens.css     ← default brand tokens
    styles/wa-theme.ts    ← WA theme import
```

### Tenant app structure

```
apps/tenant-acme-vue/
  package.json            ← deps: { "@repo/white-label-vue": "workspace:*" }
  vite.config.ts          ← imports layer.config, configures component dirs, aliases
  index.html
  src/
    main.ts               ← calls createWhiteLabelApp({ overrides })
    components/          ← ONLY files that differ from white-label
    pages/               ← ONLY files that differ
    styles/tokens.css    ← tenant brand (overrides white-label tokens)
```

### Resolution order (highest → lowest priority)

1. Tenant app's own files (components, pages, styles)
2. White-label layer files (fallback defaults)

Implemented via:
- `layer.config.ts` exports white-label's component dirs, route config, Vite extensions
- Tenant `vite.config.ts` imports layer config and configures `unplugin-vue-components` with both dirs
- `createWhiteLabelApp()` factory merges routes (tenant pages override white-label by path)
- CSS cascade via import order (tenant tokens.css imported after white-label's)

### No file duplication

Tenant only holds override files. White-label is a workspace dependency. Changes to white-label auto-propagate to tenants.

## Key Constraints

- One codebase, multiple tenants
- Build-time overrides (no runtime switching)
- Type-safe transformations (presenters)
- Minimal duplication — tenants only hold diff files
- White-label changes auto-propagate to tenants
- Tenant apps checked into git
- Layer utility code lives in white-label-vue (no separate package)

## Non-goals (Phase 3)

- Angular white-label (Phase 4)
- React white-label (Phase 5)
- CI/CD tenant pipeline

## Decisions Log

| Decision | Choice |
|---|---|
| Override mechanism | Layer system (layer.config.ts + app factory) |
| Vite plugin package? | No separate package — inline in white-label-vue |
| Scaffolder name | `@repo/generator` (not scaffolder — Pinion is a code generator) |
| Layer utility location | Inside white-label-vue |
| Angular base | Bare Angular CLI (no AnalogJS) — Phase 4 |
| Tenant lifecycle | Checked into git |
| Generator UX | Per-framework commands (vue, angular, react) |
| Tenant file model | Reference + override (no full copy) |
| White-label app structure | Factory (app.ts) + Standalone entry (main.ts) |
| Example app | fake-plants-vue (manual creation, validates mechanism before generator) |
| Presenter package name | @repo/presenters |
| Presenter placement | Phase 3 pre-req |
