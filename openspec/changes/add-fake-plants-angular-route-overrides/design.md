# Design

## Context

Shell (`apps/white-label-angular`) already exposes `extendRoutes` / `omitRoutePaths` in `WhiteLabelAppOptions`; `mergeRoutes` appends extensions then filters by exact `route.path` match. Merge logic is unit-tested in `init.spec.ts` (10 cases). Tenant boots with `createWhiteLabelApp({})` — zero overrides. See proposal.md - Why.

Constraint from exploration: shell routes are declared slash-less (`path: 'components'`, `path: ''`), while `fake-plants-vue` uses `'/components'`. Exact-match filter means a leading slash silently no-ops the omission.

## Goals / Non-Goals

**Goals:**
- Tenant proves route extension + omission end-to-end (parity with `fake-plants-vue` route config)
- AboutPage exists as tenant-owned diff, shell untouched
- Guard the slash-less path convention with a regression test

**Non-Goals:**
- Nav link to `/about` (shell nav override = 4.6.3 AppShell override)
- metaMap, brand tokens, component overrides, MSW wiring (4.6.4-4.6.6)
- Shell API changes — merge logic is final as-is

## Decisions

1. **Lazy AboutPage via `loadComponent`** — mirrors shell `components` route and Vue tenant's `() => import(...)`. Alternative: eager `component:` import — rejected; diverges from shell convention and bundles the page into the main chunk.

2. **Slash-less paths (`about`, `components`)** — Angular `Routes.path` is path-to-regexp segments without leading slash; `mergeRoutes` filters by exact equality. Alternative: strip leading slashes inside `mergeRoutes` — rejected; that would change shell behavior/API beyond 4.6.2 scope (shell untouched rule).

3. **AboutPage as plain standalone component** — `@Component` + `CUSTOM_ELEMENTS_SCHEMA` (AOT rule: no `@feComponent` wrapper), single file `src/pages/about-page.component.ts` + colocated spec, mirroring shell's `pages/*` layout. Content parity with `fake-plants-vue` AboutPage.

4. **Tenant-level route spec** — failing spec first (TDD RED): assert merged config contains `about`, excludes `components`, keeps shell defaults. Options: (a) export merged routes from a testable tenant module, (b) test through `createWhiteLabelApp()` result. Chosen (b): no new tenant export needed; `createWhiteLabelApp` already returns config with `provideRouter` routes — reachable via injector in tests, same pattern as shell `app.spec.ts`.

## Risks / Trade-offs

- [Silent omission failure if slash creeps back in] → regression spec asserts `components` (slash-less) removes the route; comment in `main.ts` warns about exact match
- [`/about` has no nav entry, looks unreachable in manual check] → 4.6.2 validation navigates by direct URL; nav deferred to 4.6.3 (documented in proposal Impact)
- [`createWhiteLabelApp` boots MSW/env side effects in tests] → `environment.enableMocks` is false in test fileReplacements; shell `app.spec.ts` already exercises this safely

## Migration Plan

None — additive tenant change, no deploy/rollback concern.

## Open Questions

None — scope fixed by plan 4.6.2; nav/metaMap/MSW explicitly deferred.
