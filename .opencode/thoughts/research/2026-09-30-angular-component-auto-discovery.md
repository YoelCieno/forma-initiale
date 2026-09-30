# Research: Angular equivalent of `import.meta.glob` for tenant component auto-discovery

**Date:** 2026-09-30
**Context:** Change `add-fake-plants-angular-brand-components` (plan 4.6.5) ships an explicit `componentOverrides` map. Goal: filename-based auto-discovery — tenant `src/components/<name>.component.ts` wins over white-label `<name>.component.ts` — like Vue's `componentDirs` (unplugin-vue-components scans tenant dir first, name clash = tenant wins). Decision pencilled in plan `.opencode/plans/core-foundation/phase-4/4.6-fake-plants-angular.md` §4.6.7.

**Invariant for all candidates:** discovery only *populates* the existing `COMPONENT_OVERRIDES` map (`bootstrap/init.ts`). Registry API, `injectComponentOverride()` accessor, and factory option stay fixed.

## Key fact: `import.meta.glob` does NOT work out of the box

- `import.meta.glob` is a **Vite transform** feature. Angular CLI uses Vite **in a development-server capacity only**; `ng build` is esbuild-driven (`@angular/build:application`). Source: https://angular.dev/tools/cli/build-system-migration ("The usage of Vite in the Angular CLI is currently within a development server capacity only").
- Consequences: (1) `ng build` would emit `import.meta.glob` unexpanded → runtime `import.meta.glob is not a function`; (2) TS has no type for it → typecheck error without ambient declaration; (3) dev/serve and build would behave differently (worst failure mode); (4) `ng test` (vitest builder) has its own pipeline — third behavior.
- A raw `import.meta.glob` in tenant code is therefore rejected unless an esbuild plugin expands it in ALL three pipelines (build, serve, test).

## Candidates

### A. Generated barrel module (codegen script) — RECOMMENDED (now)

A small script (bun/node) scans `apps/<tenant>/src/components/*.component.ts`, extracts exported component class + derives key from filename, emits e.g. `src/components/overrides.gen.ts`:

```ts
// AUTO-GENERATED — do not edit
import { FpProductCard } from './fp-product-card.component'
export const COMPONENT_OVERRIDES = { 'fp-product-card': FpProductCard } satisfies Record<string, Type<unknown>>
```

Tenant `main.ts` passes `COMPONENT_OVERRIDES` (or a tiny `discoverOverrides()` helper) to `createWhiteLabelApp()`.

- **Pros:** AOT-safe (plain TS, static imports — compiler sees everything); no private APIs; no builder fork; works identically for `ng build`, `ng serve`, `ng test` (runs as `predev`/`prebuild`/`pretest` script or via turbo `^` ordering); deterministic + grep-able; zero `ng update` fragility (only touches app code); key derivation = filename → exact Vue parity of semantics; generator (4.7) can emit the script + wiring in one go.
- **Cons:** (1) file add/remove needs re-run — mitigate: run script in dev/build/test pre-hooks + optional `--watch`; (2) generated file in VCS (or gitignored + always regenerated — pick gitignored + pre-hooks, like `components.d.ts` / `auto-imports.d.ts` pattern already used by unplugin in the Vue app); (3) class-name extraction needs a simple regex/TS-AST rule (KISSME: convention `export class <Pascal>` in `*.component.ts`).
- **Effort:** ~1 script + 3 pre-hook lines + 1 spec.
- **AOT compat:** ✅ static imports. **`ng update` risk:** ✅ none (no CLI internals).

### B. esbuild plugin via custom builder — LATER (only if watch-mode magic required)

Inject a virtual module or expand glob inside the esbuild pipeline.

- `@angular/build` exposes plugin types only in `src/private.d.ts` (private API — `ng update` fragile, risk R11). Source: https://app.unpkg.com/@angular/build@22.1.7/files/src/private.d.ts
- Community: `@angular-builders/custom-esbuild` (just-jeb) — official-ish escape hatch, has per-major releases tracking Angular majors; supports `unit-test` builder reusing app esbuild plugins. Source: https://www.npmjs.com/package/@angular-builders/custom-esbuild
- Nx `@nx/angular:application` executor has a documented `plugins` option — but adopting Nx wholesale for this = non-starter. Source: https://nx.dev/docs/technologies/angular/executors
- Third-party glob expander exists: `esbuild-plugin-import-glob`. Source: https://github.com/ArtiomTr/esbuild-plugin-import-glob
- **Pros:** true zero-config magic, live re-discovery on file add (dev server watch).
- **Cons:** (1) community package = extra dep + release lag per Angular major (R11); (2) `ng test` pipeline must also get the plugin; (3) index/dev/build divergence if plugin missed in one path; (4) debugging transpiled virtual modules.
- **AOT compat:** ✅ (esbuild emits static imports). **`ng update` risk:** ⚠️ medium (builder wrapper must track majors).
- Open upstream: Vite-plugin support request for dev server: https://github.com/angular/angular-cli/issues/29149

### C. Schematic / codegen on `ng generate` — partial, NOT sufficient alone

Schematics run only on `ng generate` events; creating a file in the editor doesn't trigger them. Useful as *companion* (schematic invokes the A codegen), useless as the sole mechanism.

### D. Runtime glob — IMPOSSIBLE

Bundled browser code has no filesystem access. Rejected.

## Recommendation

**Now: A (generated barrel module).** It is the only candidate that is AOT-safe, test/build/serve-consistent, private-API-free, and `ng-update`-proof while giving exact Vue "filename wins" semantics — and it emits the same `componentOverrides` payload the explicit map uses today, so migration is: delete explicit entry → add file → run codegen.

**Later: B, only if A's re-run friction becomes real** (frequent component adds during dev). Evaluate at §4.6.7 verdict time; re-check that `@angular/build` promoted plugin options from `private.d.ts` to public API first.

**Migration path (A → registry):**
1. Keep `injectComponentOverride()` + `COMPONENT_OVERRIDES` token untouched.
2. Add `scripts/gen-component-overrides.ts` + pre-hooks in tenant `package.json`.
3. `main.ts`: `componentOverrides: await discoverOverrides()` replaces explicit literal (explicit entries may remain as manual escape hatch — merge order: explicit > generated).
4. Vue parity note: Vue does this in-plugin at transform time; Angular does it at codegen time — same semantics, different phase. Document for generator (4.7).

## Sources

- https://angular.dev/tools/cli/build-system-migration (Vite = dev server only; application builder migration)
- https://www.npmjs.com/package/@angular-builders/custom-esbuild (esbuild plugins escape hatch + unit-test builder reuse)
- https://nx.dev/docs/technologies/angular/executors (documented `plugins` option)
- https://github.com/ArtiomTr/esbuild-plugin-import-glob (glob expansion for esbuild)
- https://github.com/angular/angular-cli/issues/29149 (no Vite plugin support in dev server)
- https://app.unpkg.com/@angular/build@22.1.7/files/src/private.d.ts (plugin types = private API)
- https://vite.dev/guide/features (import.meta.glob semantics)
