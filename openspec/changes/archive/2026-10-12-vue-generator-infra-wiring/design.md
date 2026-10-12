# Design

## Context

`packages/infra/src/metadata/` is the metadata source of truth since `2ca6d82` (`frameworkMap` in `white-label.ts`, curated `plantsMap` in `fake-plants.ts`, both barrel-exported via `packages/infra/src/index.ts`). `register-tenant` already mutates infra-owned files (`packages/infra/src/mocks/data/mocked-data.json`) — infra mutation from a generator CLI has precedent.

The Vue template (`packages/generator/src/templates/index.ts`) still scaffolds `apps/<t>-vue/metadata.ts` with keys derived by stripping the last name word (`zen-plants` → `zen-alpha`), while `getProductNames` registers `zen-plants-alpha` — fixture metaMaps never resolve. `copyServiceWorker` (`packages/generator/src/msw/copy-service-worker.ts`) hardcodes `white-label-vue` source and `apps/<name>-vue` targets.

Constraints: TDD (RED first), function-factory pattern for 2+ fn modules, no casts, `register-tenant` mutation precedent, plan 4.7.1 (Angular template) depends on the de-hardcoded helper.

## Goals / Non-Goals

**Goals:**

- Single metadata source of truth in infra for ALL newly scaffolded tenants
- Fixture keys that actually resolve against MSW-served product ids
- Idempotent generator runs (regeneration safe, curated files untouched)
- Framework-neutral `copyServiceWorker` unblocking the Angular template

**Non-Goals:**

- Refactoring the prompt UX (`metadataMode` prompt stays as-is)
- Angular tenant template itself (plan 4.7.1, separate change)
- Changing `register-tenant` or `mocked-data.json` shape
- Backfilling existing tenants (only `fake-plants` curated file exists and stays)

## Decisions

### D1: Fixture writes into infra (decision W1 — user-confirmed)

`metadataTs` template repurposed → emits `packages/infra/src/metadata/<name>.ts` + appends `export { <camelName>Map } from './metadata/<name>'` to `packages/infra/src/index.ts`.

Alternatives considered:

- **W2 wire-only, drop fixture** — rejected: new-tenant scaffold loses pretty placeholder metadata; demo UX regresses
- **Keep app-root `metadata.ts`** — rejected: drifts from `2ca6d82` source-of-truth move; two metadata homes

### D2: Barrel append mirrors register-tenant precedent

Appending the export line is a text append to an existing file, same class of operation as `register-tenant` mutating `mocked-data.json`. Idempotency rule: line already present → no-op. File-exists check for `metadata/<name>.ts`: exists → skip content write, still ensure barrel line.

### D3: Keys = `${name}-alpha/beta/gamma`

Hard-match `getProductNames` in `copy-service-worker.ts`. The old last-word-strip derivation is deleted, not fixed — it encoded a naming assumption that never matched `register-tenant`.

### D4: copyServiceWorker framework param, not string replace

Signature gains `framework: 'vue' | 'angular'` (last param); source shell, target dir, and log messages derive from it. Per repo rules: optional params last, ≤3 params → config object if the helper grows past that.

### D5: TDD, function-factory

All generator helpers touched already follow / will follow `export function name()` factory style with inner arrows; specs colocated (`*.spec.ts`). RED spec first for each behavior bullet in tasks.md.

## Risks / Trade-offs

- [Barrel append corrupts `packages/infra/src/index.ts`] → append-only single-line, exact-match before write; spec asserts exactly-once
- [Concurrent generator runs race on barrel] → acceptable: generator is interactive CLI, single-user; same exposure as existing `register-tenant` JSON mutation
- [Curated `fake-plants.ts` clobbered on regen] → exists-check skips write; validation check = byte-compare before/after
- [Generated metadata file drifts from template] → same accepted model as `import-meta-env.d.ts` (gotcha #15): generator output is scaffolding, hand-edits are tenant-owned thereafter; regeneration is explicitly destructive-by-skip, not merge

## Migration Plan

None required — no runtime consumers of the old app-root `metadata.ts` beyond freshly generated tenants, which don't exist yet. Existing tenants (only `fake-plants`, already on infra) unaffected.

## Open Questions

- Should the barrel-line append also verify the map is exported by name (parse-check) or is exact-string match sufficient? → deferred to implementation; exact-string match is the spec'd contract.
