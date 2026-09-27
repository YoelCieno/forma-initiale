# Design

## Context

`white-label-angular` is a working Angular 22 layer base: it exports a `createWhiteLabelApp()` factory via `white-label-angular/app`, uses `@angular/build:application`, zoneless + signals + OnPush, and carries project-specific workarounds (`prebundle: false` for `@repo/*` symlink crashes, `environment.ts` file replacements, `styles` array in `angular.json`). The Vue tenant `fake-plants-vue` establishes the parity target: a thin app holding only diffs over its shell, consuming the shell as `workspace:*`. Task 4.6 is explicitly a **manual** parity exercise before building the generator (4.7).

## Goals / Non-Goals

**Goals:**
- Scaffold `apps/fake-plants-angular` so `ng build` and `ng test --watch=false` pass
- Faithfully carry every Angular shell workaround into the tenant config (see Risks)
- Prove workspace resolution: tenant boots through `white-label-angular/app` exports, not shell internals

**Non-Goals:**
- Route/AppShell/metaMap/brand/component overrides (tasks 4.6.2–4.6.6 — follow-up changes)
- MSW mock wiring / register-tenant (plan 4.6.6 follow-up change)
- Generator automation (4.7)
- Extracting a shared `@repo/typescript-config` Angular preset (candidate once 4.7 needs it)

## Decisions

1. **Hand-mirror shell configs vs `ng new` vs shared config package**
   Choice: hand-mirror `white-label-angular`'s `package.json` / `angular.json` / `tsconfig*.json`, renaming project keys only.
   Rationale: 4.6's purpose is validating the layer manually; `ng new` scaffolds a wrong shape (routing module, `src/app`, divergent deps) and a shared config package is premature before two tenants exist. Alternatives rejected: `ng new` (fights the factory pattern), shared config (defer to 4.7 to avoid churn during manual validation).

2. **Dependency versions copied exactly from shell**
   Tenant declares `@angular/* ^22.1.0`, `typescript ~6.0.2`, `vitest ^4.0.8`, etc. identical to `white-label-angular`, plus `white-label-angular: workspace:*`.
   Rationale: spec forbids divergent versions; two Angular versions in one workspace invites build/test mismatch.

3. **Minimal bootstrap `src/main.ts` in scope of the scaffold**
   `angular.json` build requires `browser: src/main.ts`; build-green validation therefore implies a minimal entry that calls the shell factory with no overrides (shell defaults render).
   Rationale: satisfies "layer fallback" scenario without pre-empting 4.6.2–4.6.4.

4. **Carry shell Angular workarounds verbatim**
   Tenant `angular.json` keeps `"prebundle": false` (serve), `styles` array instead of `main.ts` CSS imports, and `environment.ts`/`environment.development.ts` replacements; `test-setup.ts` replicates the `ElementInternals` shim (`ensureInternalsComplete`).
   Rationale: documented gotchas (AGENTS.md #13, memory) — dropping them produces known breakage (prebundle crash, orphaned CSS, FACE test failures).

## Risks / Trade-offs

- [Config drift between shell and tenant configs] → tenant diff should be project-name/paths only; tasks include a diff check against shell configs
- [`bun install` not run → unresolved workspace dep] → first task links the workspace before build
- [Angular unit-test builder needs setup file for WA form controls] → replicate shell `src/test-setup.ts` in scaffold tasks
- [Two copies of near-identical Angular config drift later] → accepted for manual parity; dedupe via shared config preset in 4.7
- [TEMPORAL: styles wiring is interim] → tenant `angular.json` references shell styles via deep `../white-label-angular/src/styles/*` paths, and the shell's `"./styles"` export points at `src/styles/index.ts` which does not exist (stale, currently unimported). Both are accepted as temporal for manual parity; replace with proper package subpath exports (e.g. `white-label-angular/styles/tokens.css`) during generator work (4.7) or debt cleanup

## Migration Plan

Greenfield app — no migration. Rollback = delete `apps/fake-plants-angular` (no shell or package changes).

## Open Questions

- Scope assumption (4.6.1 only, follow-ups as separate changes) recorded in proposal.md.
- **PENCIL: investigate where to place `angular-vitest-types` module** (Angular vitest test-setup / ElementInternals shim shared across Angular apps) — candidate: part of `@repo/infra`. Until resolved, the tenant's local `src/test-setup.ts` is an interim placeholder: it passes the scaffold smoke specs but its jsdom fallback is thinner than the shell's `createFallbackInternals` (no `setFormValue`/`checkValidity`/`reportValidity`) and contains one boundary cast. Any option (tenant deep-src ref, shell `./test-setup` export, or infra module) should be decided here.
