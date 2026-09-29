# Spec Delta

## Purpose

End-to-end product data wiring for the `fake-plants-angular` tenant: tenant environment injection, plant metadata overrides, and MSW mocking so the store renders its 7 plant products from mock data.

## ADDED Requirements

### Requirement: Tenant injects its environment
The tenant bootstrap SHALL pass its own environment (tenant id `fp`, mocks enabled, mock API base URL) into the shell factory, so product requests use the `fp` tenant instead of the shell default.

#### Scenario: Tenant env applied
- **WHEN** the tenant app bootstraps in development
- **THEN** product requests target the `fp` tenant (`/fp/products` path segment) with header `x-tenant-id: fp`

### Requirement: Tenant supplies plant metadata overrides
The tenant bootstrap SHALL pass `plantsMap` (7 plant products) as `metaMap`, so product view metadata overrides the white-label `frameworkMap`.

#### Scenario: Plant metadata rendered
- **WHEN** the Products page renders with `plantsMap` injected
- **THEN** product titles/descriptions reflect the 7 registered plant names (e.g. `light-bearer`), not white-label framework entries

### Requirement: Tenant starts MSW before bootstrap
The tenant SHALL start the MSW mock service worker before `bootstrapApplication()` when mocks are enabled, and SHALL serve `mockServiceWorker.js` from its public assets.

#### Scenario: Worker available
- **WHEN** the tenant dev server serves the app
- **THEN** `public/mockServiceWorker.js` exists and the worker starts before bootstrap

### Requirement: fp tenant registered in mock data
The MSW mock data SHALL contain an `fp` tenant config with the 7 plant product names, and the tenant SHALL NOT re-register an already-registered tenant.

#### Scenario: Registration verified
- **WHEN** `mocked-data.json` is inspected
- **THEN** an `fp` entry exists with exactly the 7 plant names

### Requirement: Products page renders plant catalog end-to-end
With mocks enabled, the tenant's Products page SHALL render 7 plant product cards fetched through the mock handler.

#### Scenario: Human verification
- **WHEN** a human serves the tenant and opens the Products page
- **THEN** 7 plant cards render with plant metadata
- **AND** the browser network panel shows a request to `/fp/products`
