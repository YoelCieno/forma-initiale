# angular-env-injection Specification

## Purpose

Lets a tenant inject its runtime environment config (API base URL, tenant id, mocks gate) into the white-label Angular shell so product data requests and mock wiring use tenant values instead of the shell's hard-coded environment.

## Requirements

### Requirement: Factory accepts an env option
`createWhiteLabelApp()` SHALL accept an optional `env` option carrying `{ apiUrl, tenantId, enableMocks }`, and the built application config SHALL expose that value to injectable services. When the option is absent, the shell's own default environment SHALL apply, preserving zero-override behavior.

#### Scenario: Tenant provides env
- **WHEN** `createWhiteLabelApp({ env: { apiUrl, tenantId: 'fp', enableMocks: true } })` is called
- **THEN** services resolving the injected environment receive `tenantId: 'fp'`

#### Scenario: Option omitted
- **WHEN** `createWhiteLabelApp({})` is called with no `env` option
- **THEN** services receive the shell's default environment values
- **AND** existing zero-override tests continue to pass

### Requirement: Product service uses injected environment
`ProductsService` SHALL derive `apiUrl` and `tenantId` from the injected environment rather than a static import of the shell environment file, so the outgoing products request targets the injected tenant.

#### Scenario: Tenant env drives the request
- **WHEN** the app is bootstrapped with `env: { apiUrl: 'https://api.example.com/api', tenantId: 'fp' }`
- **THEN** the products request targets `https://api.example.com/api/fp/products` and sends header `x-tenant-id: fp`

### Requirement: Mock startup gate accepts env pre-bootstrap
Mock worker startup SHALL be gateable by an explicitly provided environment (`enableMocks`) before application bootstrap, when dependency injection is not yet available. With `enableMocks: false` the worker SHALL NOT start; with `true` it SHALL.

#### Scenario: Mocks enabled via provided env
- **WHEN** mock setup runs with `enableMocks: true`
- **THEN** the MSW service worker starts

#### Scenario: Mocks disabled
- **WHEN** mock setup runs with `enableMocks: false`
- **THEN** no service worker starts

