# Proposal

## Why

Tenant naming rules live in the wrong layer: `getProductNames` (`${name}-alpha/beta/gamma`) sits inside `@repo/generator`'s MSW helper while its contract is duplicated as a comment in the template layer ("Keys MUST match getProductNames"), and `derivePrefix` (tenant name → short app prefix) sits in generator case helpers although it is a pure tenant-identity rule. The Angular tenant generator (plan 4.7.1) needs both, so leaving them in the generator guarantees a second copy and continued drift.

## What Changes

- Move `getProductNames(name)` from `packages/generator/src/msw/copy-service-worker.ts` into `packages/domain/src/helpers/` and export it via `@repo/domain`.
- Move `derivePrefix(name)` from `packages/generator/src/helpers/cases.ts` into the same domain helper and export it via `@repo/domain`.
- Re-point generator consumers (`copyServiceWorker`, `caseTransform`) to import from `@repo/domain`; generator re-exports stay stable so existing imports/specs keep working.
- Replace the duplicated "keys must match" comment with a real import, so the constraint is enforced by construction rather than by comment.

## Capabilities

### New Capabilities
- `tenant-naming`: Domain-level tenant naming rules — product-id scheme (`${name}-alpha|beta|gamma`) and short prefix derivation (`fake-plants` → `fp`) as pure functions owned by `@repo/domain`.

### Modified Capabilities
<!-- none — tenant-generator requirements keep their wording; only the import source changes -->

## Impact

- `packages/domain/src/helpers/` — new naming helper + spec; `domain/src/index.ts` barrel export.
- `packages/generator/src/msw/copy-service-worker.ts`, `packages/generator/src/helpers/cases.ts`, `packages/generator/src/helpers/index.ts` — import source swap, no behavior change.
- Consumers: `packages/generator` only today; future Angular template (4.7.1) imports from `@repo/domain`.
- No app, infra, or MSW data changes; generated output byte-identical.
