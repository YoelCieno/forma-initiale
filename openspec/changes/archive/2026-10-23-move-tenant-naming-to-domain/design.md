# Design

## Context

`getProductNames` lives in `packages/generator/src/msw/copy-service-worker.ts` (pure, 3-line array build) while `templates/index.ts` re-states its key scheme under a comment contract ("Keys MUST match getProductNames"). `derivePrefix` lives in `packages/generator/src/helpers/cases.ts`, also pure. `@repo/domain` already owns sibling pure rules (`isValidTenant`, `theme()`) and the generator already imports it (`helpers/palette.ts`), so the dependency direction generator → domain exists today. See proposal.md for motivation; specs/tenant-naming defines the behavior contract.

## Goals / Non-Goals

**Goals:**
- One implementation of each naming rule, owned by `@repo/domain`, consumed everywhere else.
- Zero behavior change — generated output, MSW data, and prefixes byte-identical.
- Stable generator surface — existing imports (`../helpers`, `serviceWorker().getProductNames`) keep working.

**Non-Goals:**
- No changes to `register-tenant` CLI, `mocked-data.json`, or any app/infra code.
- No framework-map / metadata relocation (infra ownership stands, plan 4.7.0 decision W1).
- No case-transform (`kebabToPascal` etc.) moves — those stay in `@repo/utils`.
- Not wiring the Angular template (plan 4.7.1) — it will import these helpers when built.

## Decisions

1. **New file `packages/domain/src/helpers/naming.ts`, factory export.** Two functions per module → repo-wide factory convention (`export function naming()` returning inner arrows, return-type interface in same file), mirroring `theme()`; barrel adds `export { naming } from './helpers/naming'`.
   - *Alt A*: put both in `tenant.ts` — rejected: breaks 1-fn direct-export style of that file and mixes guard (`isValidTenant`) with derived-value rules.
   - *Alt B*: two direct exports — rejected: violates the 2+ fns → factory convention.

2. **Generator keeps its current API as thin re-exports.** `copy-service-worker.ts` imports `naming()` and still returns `getProductNames` in `serviceWorker()`; `helpers/cases.ts` imports and re-exports `derivePrefix`; `helpers/index.ts` barrel untouched. Existing generator specs keep passing without import churn.
   - *Alt*: update all consumers to import `@repo/domain` directly — rejected as a big-bang diff; re-export keeps this change a pure move, consumers can migrate opportunistically.

3. **Template enforces the key contract by construction.** `templates/index.ts` `metadataTs` builds its three keys via the domain helper instead of inline `${ctx.name}-alpha` interpolation; the "Keys MUST match getProductNames" comment is deleted because the import makes it true. Output must stay byte-identical (existing `templates/index.spec.ts` key assertions prove it).

4. **TDD order.** RED: write `packages/domain/src/helpers/naming.spec.ts` first (scenarios from the spec delta — hyphenated, single-word, prefix two-segment/three-segment/single-segment). GREEN: create `naming.ts`, wire barrel. REFACTOR: swap generator imports, delete duplicate impls, drop stale comment. Generator specs (`copy-service-worker.spec.ts`, `templates/index.spec.ts`, `helpers/cases.spec.ts`) run as the no-behavior-change gate.

## Risks / Trade-offs

- [Duplicate re-export surfaces confuse consumers about the canonical import] → barrel docs/comment: `naming()` in `@repo/domain` is canonical; generator re-exports are compatibility shims.
- [Pre-commit runs the full suite — slow commits during this change] → run `bun run test --filter=@repo/domain` and generator filter locally before committing.
- [Byte-identical output regression in `metadataTs`] → existing template key assertions + infra-metadata spec are the gate; no new golden files needed.

## Migration Plan

Single PR, no deploy/rollback steps: revert restores generator-local helpers. No data or config migration.

## Open Questions

None — placement and API shape confirmed with the user in the 2026-10-22 explore session (Thread C).
