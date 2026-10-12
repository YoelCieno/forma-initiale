# Spec Delta

## Purpose

Defines behavior of `@repo/generator` scaffolding helpers shared across frameworks: generating tenant metadata fixtures into the infra package (keys matching registered mock products, idempotent writes, barrel wiring) and copying the MSW service worker with framework-agnostic paths.

## ADDED Requirements

### Requirement: Fixture metadata is generated into infra, not the tenant app

When a tenant is scaffolded with `metadataMode: fixture`, the generator SHALL write the metadata map to `packages/infra/src/metadata/<name>.ts` and SHALL ensure a barrel export line for `${camelName}Map` exists in `packages/infra/src/index.ts`. The generator SHALL NOT emit a tenant-local `apps/<name>-<framework>/metadata.ts`. The tenant `main.ts` SHALL import `${camelName}Map` from `@repo/infra`, and the generated `package.json` SHALL list `@repo/infra` as a dependency.

#### Scenario: New tenant scaffolds metadata into infra

- **WHEN** the generator scaffolds tenant `zen-plants` with `metadataMode: fixture`
- **THEN** `packages/infra/src/metadata/zen-plants.ts` exports `zenPlantsMap`
- **AND** `packages/infra/src/index.ts` contains an export line for that map
- **AND** no `apps/zen-plants-vue/metadata.ts` file exists
- **AND** the generated `main.ts` imports the map from `@repo/infra`

#### Scenario: Metadata mode none keeps tenant wiring commented

- **WHEN** the generator scaffolds a tenant with `metadataMode: 'none'`
- **THEN** no infra metadata file is written
- **AND** the generated `main.ts` carries a commented `metaMap` hint referencing `@repo/infra`

### Requirement: Fixture metadata keys match registered mock product ids

Generated fixture metadata keys SHALL be exactly `${name}-alpha`, `${name}-beta`, `${name}-gamma` — the ids `register-tenant` registers in `mocked-data.json` via `getProductNames` — so generated `metaMap` entries resolve against MSW-served products.

#### Scenario: Keys align with mocked products

- **WHEN** the generator scaffolds tenant `zen-plants` with fixture metadata and `register-tenant` has registered `zen-plants`
- **THEN** every generated metadata key equals a product id served by the `zen-plants` MSW tenant (e.g. `zen-plants-alpha`)

### Requirement: Metadata generation is idempotent and never clobbers curated files

If `packages/infra/src/metadata/<name>.ts` already exists, the generator SHALL skip writing it and SHALL only ensure the barrel export line exists. Existing curated metadata content MUST be preserved byte-for-byte.

#### Scenario: Regenerating an existing tenant preserves curated metadata

- **WHEN** the generator scaffolds a tenant whose infra metadata file already exists (e.g. regenerating `fake-plants`)
- **THEN** the existing metadata file content is unchanged
- **AND** the barrel export line exists exactly once

### Requirement: MSW service worker copy is framework-aware

The `copyServiceWorker` helper SHALL accept the target framework and SHALL copy `mockServiceWorker.js` to `apps/<name>-<framework>/public/` for any framework, with parameterized source-shell path and log/notice messages — no hardcoded `-vue` segments.

#### Scenario: Angular target copies to the Angular app

- **WHEN** `copyServiceWorker` runs for tenant `zen-plants` with framework `angular`
- **THEN** `apps/zen-plants-angular/public/mockServiceWorker.js` exists
- **AND** no path in the copy operation contains a hardcoded `-vue` segment

#### Scenario: Vue target behavior unchanged

- **WHEN** `copyServiceWorker` runs for a tenant with framework `vue`
- **THEN** `apps/<name>-vue/public/mockServiceWorker.js` is written as before

### Requirement: Vue tenant factory has a smoke test

The `apps/fake-plants-vue` tenant SHALL include `src/main.spec.ts` exercising the app factory (mirroring the Angular tenant's `main.spec.ts`), covering app-shell resolution.

#### Scenario: Factory smoke test present

- **WHEN** the Vue test suite runs
- **THEN** `apps/fake-plants-vue/src/main.spec.ts` exists and passes alongside `App.spec.ts`
