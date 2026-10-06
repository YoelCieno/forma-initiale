# Proposal

## Why

Angular test setups diverged: `white-label-angular` has a full ElementInternals shim spread across `src/test-setup.ts` + `src/utils/{dom-shim,type-guards}`, while `fake-plants-angular` ships a thinner self-contained copy (shell source copy is forbidden by spec). Two divergent shims = duplicated logic, drift risk, and a bad template for the 4.7 generator.

## What Changes

- Add ONE function-factory module `@repo/infra/testing/element-internals` exposing `elementInternalsShim()` → `{ createFallbackInternals, ensureInternalsComplete, patchElementInternalsPrototype, patchAttachInternals, install }`
- Module self-installs on import (side-effect entry) so test setup needs no app-side code
- **BREAKING (test-only):** delete `apps/white-label-angular/src/test-setup.ts` and `apps/fake-plants-angular/src/test-setup.ts`; both `angular.json` `setupFiles` point at the infra entry instead
- Delete `apps/white-label-angular/src/utils/{dom-shim.ts,dom-shim.spec.ts,type-guards.ts}` — spec coverage absorbed by the infra spec
- Update `docs/integrations/form-associated-custom-elements.md` §2 source reference

## Capabilities

### New Capabilities

- `angular-test-setup`: shared ElementInternals (FACE) test shim — full incomplete-FACE surface completion, fallback internals creation, idempotent install, safe no-op when globals missing, consumed by both Angular apps via a self-installing infra entry

### Modified Capabilities

(none — no existing spec covers test setup)

## Impact

- `packages/infra` — new `src/testing/element-internals.ts` + spec, new `./testing/element-internals` export in `package.json`
- `apps/white-label-angular` — `test-setup.ts` + `src/utils/*` deleted; `angular.json` `setupFiles`, `tsconfig.spec.json` `include` updated
- `apps/fake-plants-angular` — `test-setup.ts` deleted; `angular.json` `setupFiles`, `tsconfig.spec.json` `include` updated
- Docs — `docs/integrations/form-associated-custom-elements.md` §2
- Out of scope: `packages/ui/vitest.setup.ts` legacy stub, `exports["./mocks/helpers"]` stale path (pre-existing debt), docs §3 `states` caveat
