# Phase 3 — Presenter Layer + White-Label Extend

**Status:** ❌ PENDING

## Granular Breakdown

See [`phase-3/README.md`](./phase-3/README.md) for full task breakdown with sub-docs per deliverable.

| Letter | Deliverable | Doc | Status |
|--------|------------|-----|--------|
| A | `@repo/presenter` (pre-req) | [`phase-3/A-presenter.md`](./phase-3/A-presenter.md) | ❌ PENDING |
| B | Rename web-vue → white-label-vue + layer factory | [`phase-3/B-white-label-rename.md`](./phase-3/B-white-label-rename.md) | ❌ PENDING |
| C | `fake-plants-vue` example tenant (manual) | [`phase-3/C-fake-plants-vue.md`](./phase-3/C-fake-plants-vue.md) | ❌ PENDING |
| D | `@repo/generator` + Vue tenant Pinion generator | [`phase-3/D-generator.md`](./phase-3/D-generator.md) | ❌ PENDING |
| E | Turborepo pipeline update | [`phase-3/E-turbo-pipeline.md`](./phase-3/E-turbo-pipeline.md) | ❌ PENDING |
| F | Documentation updates | [`phase-3/F-documentation.md`](./phase-3/F-documentation.md) | ❌ PENDING |

## Goal

Complete the hexagonal architecture stack with a Presenter layer, then enable multi-tenant white-label apps via a Nuxt-style layer system + Pinion generator.

## Architecture (after Phase 3)

```
domain → infra → presenter → apps/white-label-* → apps/tenant-*
```

Packages:
- `@repo/domain` — pure TS models/ports (exists)
- `@repo/infra` — adapters (exists)
- `@repo/presenter` — DomainModel → ViewModel transformations **(NEW)**
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
    overrides/
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
- Type-safe transformations (presenter)
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
| Presenter package name | @repo/presenter |
| Presenter placement | Phase 3 pre-req |
