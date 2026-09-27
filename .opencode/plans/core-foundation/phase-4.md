# Phase 4 — Angular Implementation

**Status:** 🔧 IN PROGRESS

## Granular Breakdown

See [`phase-4/README.md`](./phase-4/README.md) for full task breakdown with sub-docs per deliverable.

| #   | Deliverable                                    | Doc                                                        | Status                            |
| --- | ---------------------------------------------- | ---------------------------------------------------------- | --------------------------------- |
| 4.1 | Risks & mitigations register (R1–R11)          | [`phase-4/4.1-risks-mitigations.md`](./phase-4/4.1-risks-mitigations.md) | ✅ COMPLETED (R1–R10 verified) |
| 4.2 | Scaffold `apps/white-label-angular/` (Angular CLI 22) | [`phase-4/4.2-scaffold.md`](./phase-4/4.2-scaffold.md)     | ✅ COMPLETED                     |
| 4.3 | Angular factory (`createWhiteLabelApp` equivalent)    | [`phase-4/4.3-factory.md`](./phase-4/4.3-factory.md)       | ✅ COMPLETED                     |
| 4.4 | Angular base components (fe-* compositing, CUSTOM_ELEMENTS_SCHEMA) | [`phase-4/4.4-base-components.md`](./phase-4/4.4-base-components.md) | 🔶 IN PROGRESS |
| 4.5 | Port pages (Products, Components, AppShell, metaMap)   | [`phase-4/4.5-pages-port.md`](./phase-4/4.5-pages-port.md) | ⏳ PENDING                       |
| 4.6 | `fake-plants-angular` tenant (manual parity check)     | [`phase-4/4.6-fake-plants-angular.md`](./phase-4/4.6-fake-plants-angular.md) | ⏳ PENDING |
| 4.7 | `@repo/generator` Angular tenant generator             | [`phase-4/4.7-generator-angular.md`](./phase-4/4.7-generator-angular.md) | ⏳ PENDING |
| 4.8 | Build & verify + documentation                         | [`phase-4/4.8-verify-docs.md`](./phase-4/4.8-verify-docs.md) | ⏳ PENDING |

## Goal

Complete the hexagonal stack on a second framework: deliver the exact same product as white-label-vue / fake-plants-vue on Angular. End state = same product rendered on 3 front-end frameworks (Vue ✅, Angular ← this phase, React → Phase 5) plus a Pinion generator emitting the pattern per framework. Angular implementation must replicate the white-label layer mechanism (app factory, routes, styles, presenters, fe-* components, MSW mocks) and validate it via a manual `fake-plants-angular` tenant before building the Angular generator.

## Architecture (after Phase 4)

```
domain → infra → presenters → packages/ui (fe-*) → apps/white-label-* → apps/tenant-*
```

Packages:

- `@repo/domain` — pure TS models/ports (exists)
- `@repo/infra` — adapters (exists)
- `@repo/presenters` — DomainModel → ViewModel transformations (exists)
- `@repo/ui` — WA web components via hybridJS (exists)
- `@repo/generator` — Pinion-based code generator, gains Angular template (extends)

Apps:

- `white-label-vue` — Vue layer base (exists)
- `white-label-angular` — Angular layer base **(NEW)**
- `fake-plants-vue` — Vue demo tenant (exists)
- `fake-plants-angular` — Angular demo tenant **(NEW, manual, validates mechanism)**
- `<name>-vue` / `<name>-angular` — generated via Pinion

## Layer Mechanism (Angular version)

Phase 4 replicates white-label-vue's factory pattern on Angular. The factory returns a `Promise<{ root, config }>` where `root` is a `ComponentRef<WhiteLabelRoot>` created via `createComponent` and `config` is the merged WhiteLabelConfig (routes, metaMap). Bootstrap uses Angular's `bootstrapApplication(rootComponent, { providers: [...], })`.

Angular DI replaces Vue's option-passing and provide/inject replaces component-tree config flow. `metaMap` (Vue option) becomes `META_MAP_INJECTION_KEY` — an Angular `InjectionToken<MetaMap>` provided at the factory layer, overridable by tenants. Route merge (`routes` / `extendRoutes` / `omitRoutePaths`) happens in the factory at bootstrap time, mirroring `createWhiteLabelApp`. `fe-*` custom elements are registered via `CUSTOM_ELEMENTS_SCHEMA` (see 4.4). Mocks gating uses Angular's `fileReplacements` + `src/environments/environment*.ts` (see 4.3) — Angular CLI has no `NG_APP_`-style env-var prefix. App is zoneless (v22 default) + signals + OnPush change detection.

### White-label app structure

```
apps/white-label-angular/
  angular.json            ← build/test config, fileReplacements, serve.options --prebundle=false
  src/
    bootstrap/            ← factory layer (app.ts + init.ts)
    main.ts               ← standalone entry (calls factory with defaults)
    routes.ts             ← default route array
    environments/         ← environment.ts / environment.development.ts (mocks gating)
    app/                  ← root + shared components (fe-* compositing)
    pages/                ← default pages
    styles/               ← default brand tokens + WA theme
    index.html            ← theme class on <html>
```

### Tenant app structure

```
apps/acme-angular/
  package.json            ← deps: { "white-label-angular": "workspace:*" } (no @repo scope)
  angular.json            ← consumes white-label-angular as workspace dep
  src/
    main.ts               ← calls createWhiteLabelApp({ overrides })
    app/                  ← ONLY files that differ from white-label (root IS the override)
    pages/                ← ONLY files that differ (extendRoutes)
    styles/tokens.css     ← tenant brand (overrides white-label tokens)
    index.html            ← theme class on <html>
```

### Resolution order (highest → lowest priority)

1. Tenant app's own files (components, pages, styles, appShell/root)
2. White-label layer files (fallback defaults)

Implemented via:

- Factory merges routes at bootstrap: `routes` ∪ `extendRoutes` (tenant wins on path), `omitRoutePaths` removes white-label defaults
- Tenant root component (passed via factory) IS the app-shell override — no separate `appShell` option
- `META_MAP_INJECTION_KEY` (InjectionToken) — tenant provides its own value, overriding white-label default
- CSS cascade via import order (tenant tokens.css imported after white-label's)

### No file duplication

Tenant only holds override files. White-label is a workspace dependency. Changes to white-label auto-propagate to tenants.

## Key Constraints

- One codebase, multiple tenants, two frameworks
- Build-time overrides (no runtime switching)
- Zoneless + signals + OnPush (v22 default) — no zone.js reliance
- `fe-*` via CUSTOM_ELEMENTS_SCHEMA (tradeoff documented in 4.4/decisions)
- Type-safe view-model transforms (presenters)
- Minimal duplication — tenants only hold diff files
- White-label changes auto-propagate to tenants
- Tenant apps checked into git
- Factory + layer utility code lives in white-label-angular

## Non-goals (Phase 4)

- React white-label (Phase 5)
- CI/CD tenant pipeline

## Decisions Log

| Decision                 | Choice                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| Angular base             | Bare Angular CLI 22 (no AnalogJS)                                                        |
| Reactivity model         | Zoneless + signals + OnPush (v22 default)                                                |
| Mocks gating             | `fileReplacements` + `src/environments/environment*.ts` (NOT env vars — Angular CLI has no `NG_APP_` prefix) |
| fe-* custom elements     | CUSTOM_ELEMENTS_SCHEMA (kills template typecheck → export `Fe*Element` interfaces)        |
| Dev server dep-optimizer | `--prebundle=false` in dev script + angular.json serve.options (2026-08-15 workaround)   |
| AppShell override        | Dropped as an option — tenant root component IS the override                              |
| Factory return type      | `Promise<{ root, config }>` (createComponent + merged config)                            |
| Tenant package model     | Workspace dep consuming `white-label-angular` (not `@repo` scope)                         |
| metaMap injection        | `META_MAP_INJECTION_KEY` (Angular InjectionToken) replacing Vue's metaMap option          |
| Generator                | Extend `@repo/generator` with `angular-tenant.tpl.ts` mirroring `vue-tenant.tpl.ts`       |

## Future improvements

See [`README.md`](./README.md#ideas-for-future-improvements) for future ideas (generator, factory, white-label).
