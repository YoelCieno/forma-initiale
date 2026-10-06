# Design

## Context

Two divergent ElementInternals shims exist today:

- `apps/white-label-angular/src/test-setup.ts` — full FACE surface, split with `src/utils/dom-shim.ts` (fallback factory) + `src/utils/type-guards.ts`, ~150 LOC across 4 files
- `apps/fake-plants-angular/src/test-setup.ts` — thinner self-contained copy (validity + 4 methods + `states` only), written because shell package exports expose bootstrap only and copying shell source into a tenant is forbidden by spec

Both run as vitest `setupFiles` (Angular `@angular/build:unit-test`). Constraints: repo-wide function-factory convention (2+ fns → factory), max 1 documented boundary cast, KISSME, `packages/ui` legacy stub stays out of scope. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Single source of truth for the FACE test shim, importable by any app (shell or tenant) via package specifiers
- Zero app-side setup source files — `setupFiles` alone wires everything
- Full FACE surface (superset of both current shims) so no app loses coverage
- 4.7 generator can scaffold `setupFiles` wiring only, no file copy

**Non-Goals:**
- `packages/ui/vitest.setup.ts` legacy stub
- `exports["./mocks/helpers"]` stale path (pre-existing debt)
- Docs §3 `states` caveat behavior change
- Any runtime (non-test) code path

## Decisions

**D1 — Self-installing infra entry (not thin bootstrap files).**
`setupFiles: ["../../packages/infra/src/testing/element-internals.ts"]`; module top-level calls `elementInternalsShim().install()`.
- Builder constraint discovered in apply: Angular 22 unit-test `setupFiles` does `path.join(workspaceRoot, entry)` — paths only, bare package specifiers become `<app>/@repo/...` and fail (schema: "A list of paths"; `polyfills` alone accepts module specifiers). Deep `../../` path normalized by `path.join` = same TEMPORAL model as tenant styles deep-paths (AGENTS gotcha #16), consolidate in 4.7. Verified: shell ng test 103/103 green.
- Chosen over plan's "thin bootstrap `elementInternalsShim().install()` in each app" (user decision): deleting both `test-setup.ts` entirely = 0 app files to scaffold, no divergence possible, KISSME.
- Factory still exported for spec/restore control — side effect + API in one entry.
- Alt rejected: `./testing/element-internals/install` subpath for pure-vs-side-effect split — extra export for a test-only util; premature.

**D2 — Placement in `@repo/infra`.**
Legit for tenant (unlike shell-source import); infra already a dep of both Angular apps and resolves at test runtime (proven by existing `import { plantsMap } from '@repo/infra'` specs). Alt rejected: new `@repo/testing` package — one export doesn't justify a package.

**D3 — Full FACE surface, compact implementation (user decision).**
Superset of both current shims → nothing loses coverage; shell's full surface is the safe union. KISSME applies to implementation style: loop-driven method table + small `ensure*` helpers, no per-property Reflect sprawl beyond what the surface needs.

**D4 — Function-factory shape.**
`export function elementInternalsShim() { const fns…; return { createFallbackInternals, ensureInternalsComplete, patchElementInternalsPrototype, patchAttachInternals, install } }` — outer function declaration, inner arrows, return-type interface in same file (repo convention).

**D5 — One documented boundary cast.**
Fallback object → `ElementInternals` is the single unavoidable boundary cast (no runtime type for a fabricated object); documented inline. No other casts (no `as T` generic trick from current `dom-shim.ts`).

**D6 — `install()` idempotency via wrapper marker.**
Tag the installed wrapper (`Symbol.for`-style own prop or stored original) so re-install detects an existing wrap. Idempotent matters because module side effect + explicit `install()` in specs can both fire.

**D7 — Infra spec uses node env + stubbed globals.**
Infra vitest defaults to node → no DOM globals → also exercises the safe no-op path. DOM-dependent cases stub `globalThis.ElementInternals` / `globalThis.HTMLElement` per test with save/restore in `beforeEach`/`afterEach`.

## Risks / Trade-offs

- [Side-effect import runs in any consumer, not just setupFiles] → Test-only subpath; `install()` idempotent + safe no-op; consumers are specs by design.
- [`@repo/infra` bare specifier in `setupFiles` under `externalPackages: true` (JIT)] → Existing specs already import `@repo/infra` at runtime through the same path; verify with gates in Phase 3.
- [Deleting `src/test-setup.ts` breaks `tsconfig.spec.json` `include` / tsc] → Update both `include` arrays in the same task as the deletion.
- [Fallback cast drifts from real `ElementInternals`] → Single fallback builder + spec asserting full surface (spec is the contract).
- [Docs §2 references deleted files] → Doc update task in Phase 3.

## Migration Plan

Single change, no runtime exposure: (1) land infra module + spec, (2) swap `setupFiles` + delete app files in both apps, (3) gates. Rollback = revert commit — apps restore their old `test-setup.ts` from git history.

## Open Questions

None — surface choice (full FACE) and wiring (self-installing entry) resolved with user before creation.
