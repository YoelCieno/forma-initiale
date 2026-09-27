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
- Nav/appShell override (shell `appShell` option + `resolveAppShell`, tenant root component) — plan 4.6.3
- metaMap, brand tokens, component overrides, MSW wiring (4.6.4-4.6.6)
- Shell API changes — merge logic is final as-is (appShell option deferred to 4.6.3)

## Decisions

1. **Lazy AboutPage via `loadComponent`** — mirrors shell `components` route and Vue tenant's `() => import(...)`. Alternative: eager `component:` import — rejected; diverges from shell convention and bundles the page into the main chunk.

2. **Slash-less paths (`about`, `components`)** — Angular `Routes.path` is path-to-regexp segments without leading slash; `mergeRoutes` filters by exact equality. Alternative: strip leading slashes inside `mergeRoutes` — rejected; that would change shell behavior/API beyond 4.6.2 scope (shell untouched rule).

3. **AboutPage as plain standalone component** — `@Component` + `CUSTOM_ELEMENTS_SCHEMA` (AOT rule: no `@feComponent` wrapper), single file `src/pages/about-page.component.ts` + colocated spec, mirroring shell's `pages/*` layout. Content parity with `fake-plants-vue` AboutPage.

4. **No tenant route unit spec — factory tests stay in the shell** — `extendRoutes`/`omitRoutePaths` are shell factory behavior, already unit-tested in `apps/white-label-angular/src/bootstrap/init.spec.ts` (extend + omit + precedence, slash-less paths). A tenant spec passing opts inline could never fail (RED unreachable) without extracting a `tenant-options` module just for testability — rejected as test-driven structure. Alternative: extend shell init.spec — rejected, coverage already exists. Tenant wiring (`main.ts` opts) is a few lines of config, verified by the manual 3.4 check; wiring drift is an accepted, documented gap.

## Risks / Trade-offs

- [Silent omission failure if slash creeps back in] → regression spec asserts `components` (slash-less) removes the route; comment in `main.ts` warns about exact match
- [`/about` has no nav entry, looks unreachable in manual check] → 4.6.2 validation navigates by direct URL; nav/appShell deferred to plan 4.6.3 (agreed approach: `appShell` option + `resolveAppShell`, Vue parity)
- [`createWhiteLabelApp` boots MSW/env side effects in tests] → `environment.enableMocks` is false in test fileReplacements; shell `app.spec.ts` already exercises this safely

## Migration Plan

None — additive tenant change, no deploy/rollback concern.

## Open Questions

None — nav/appShell deferred to plan 4.6.3 (approach agreed: `appShell` option + `resolveAppShell`, Vue parity); metaMap / brand tokens / MSW still deferred (4.6.4-4.6.6).
