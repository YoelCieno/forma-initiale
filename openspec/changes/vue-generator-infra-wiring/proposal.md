# Proposal

## Why

Commit `2ca6d82` moved tenant metadata source of truth into `packages/infra/src/metadata/` (barrel-exported), but `@repo/generator` still scaffolds a tenant-local `apps/<t>-vue/metadata.ts` whose keys (`<prefix>-alpha`, last name word stripped) never match the MSW-registered product ids (`<full-name>-alpha/beta/gamma` from `getProductNames`). Result: every newly generated tenant ships a dead `metaMap` — placeholders never resolve against mocked products. Additionally `copyServiceWorker` hardcodes `-vue` paths, blocking the Angular tenant template (plan 4.7.1).

## What Changes

- Vue template fixture metadata now generates **into infra**: `packages/infra/src/metadata/<name>.ts` + an appended barrel export line in `packages/infra/src/index.ts` (precedent: `register-tenant` already mutates `packages/infra/src/mocks/data/mocked-data.json`)
- Fixture keys corrected to `${name}-alpha/beta/gamma` to match `getProductNames` (fixes dead metaMap)
- Idempotency: existing infra metadata file → skip write, only ensure barrel line; curated `fake-plants.ts` must never be overwritten
- Tenant `main.ts` fixture branch imports `${camelName}Map` from `@repo/infra`; generated `package.json` gains `@repo/infra` dep; app-root `metadata.ts` generation deleted
- `copyServiceWorker` de-hardcoded: framework-aware target `apps/<name>-<framework>/public/`, parameterized source shell + messages
- Parity: add `apps/fake-plants-vue/src/main.spec.ts` factory smoke test (Angular tenant already has one)

## Capabilities

### New Capabilities

- `tenant-generator`: behavior of `@repo/generator` scaffolding shared helpers — infra-side metadata fixture generation (keys, idempotency, barrel wiring) and framework-aware MSW service-worker copying

### Modified Capabilities

<!-- none — existing specs are all Angular-app capabilities, unaffected by generator internals -->

## Impact

- `packages/generator/` — `templates/index.ts` (`metadataTs`, `mainTs`, `packageJson`), `vue-tenant.tpl.ts`, `msw/copy-service-worker.ts`, specs
- `packages/infra/` — new `src/metadata/<name>.ts` files created at generate time; barrel `src/index.ts` gains appended export lines
- `apps/fake-plants-vue/src/main.spec.ts` — new file
- Consumers: plan task 4.7.0 in `.opencode/plans/core-foundation/phase-4/4.7-generator-angular.md`; unblocks Angular template work (4.7.1)
