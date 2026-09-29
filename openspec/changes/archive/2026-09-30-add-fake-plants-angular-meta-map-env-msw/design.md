# Design

## Context

- Shell `ProductsService` statically imports `../environments/environment` (tenantId `wl`, `enableMocks: false`). Tenant's `environment*.ts` files (`tenantId: 'fp'`, mocks on) exist with `angular.json` `fileReplacements` wiring but nothing consumes them — relative import inside shell source always resolves to the shell file.
- `setupMocks()` in `bootstrap/init.ts` reads `environment.enableMocks` at call time, **before** `bootstrapApplication()` → Angular DI unavailable at that moment.
- Tenant `main.ts` never calls `setupMocks()`, has no `public/mockServiceWorker.js`, and passes no `metaMap`.
- `@repo/infra` side is already tenant-ready: handler `*/api/:tenant/products` + `x-tenant-id` header, `mocked-data.json` already contains `fp` with the 7 plant names, `plantsMap` exported from `@repo/infra`.
- Existing test surface: `init.spec.ts` (setupMocks gates), `products.service.spec.ts` (TestBed), tenant `main.spec.ts` (factory args).

See proposal.md for motivation; specs for the behavior contract.

## Goals / Non-Goals

**Goals:**
- One injectable env shape (`AppEnv = { apiUrl, tenantId, enableMocks }`) flowing shell → services
- Zero-override parity: `createWhiteLabelApp({})` behaves exactly as today
- Tenant end state: 7 plant cards + plant metadata from `/fp/products` under `ng serve`

**Non-Goals:**
- Plan 4.6.5 (green tokens, ProductCard override) — separate change
- Vue shell parity refactor (Vue reads `import.meta.env` directly; Angular keeps `environment.ts` fileReplacement mechanism)
- Generator templates (4.7) — inherit this pattern later
- Real backend / prod API config — mocks only

## Decisions

### D1. `APP_ENV` InjectionToken + explicit provider in `buildAppConfig`

```ts
export interface AppEnv { apiUrl: string; tenantId: string; enableMocks: boolean }
export const APP_ENV = new InjectionToken<AppEnv>('APP_ENV')
```

`buildAppConfig(routes, opts)` always adds `{ provide: APP_ENV, useValue: opts.env ?? shellEnvironment }`; `ProductsService` uses `inject(APP_ENV)` (non-optional).

**Why not `providedIn: 'root'` factory + optional override?** Relies on Angular's precedence between tree-shakable factory and explicit provider — subtle, version-sensitive. Explicit provider at a single site is deterministic and test-assertable.
**Why not pass env as constructor arg?** Service is instantiated by DI (`@Service()`), no construction site to thread params through; token is the Angular-idiomatic channel (mirrors existing `META_MAP_INJECTION_KEY` pattern).

### D2. `setupMocks(env?)` — optional param, not DI

DI doesn't exist before `bootstrapApplication()`. Signature: `setupMocks(env?: AppEnv)`; when omitted, falls back to shell `environment` (current behavior, shell `main.ts` unchanged semantics). Gate becomes `env?.enableMocks ?? environment.enableMocks`.

**Alternative considered:** `useWhiteLabelApp(env)` factory param — rejected: 3 of 4 returned fns don't need env; param on `setupMocks` is explicit at the only call site that does.

### D3. Factory re-exports from `white-label-angular/app`

Tenant imports only via `white-label-angular/app` (export map). `bootstrap/app.ts` re-exports `type AppEnv`, `APP_ENV`, and `useWhiteLabelApp` so tenant main can `const { setupMocks } = useWhiteLabelApp()` + type its env without deep shell paths.

### D4. Tenant env = existing `environment*.ts` files

Tenant `main.ts` imports `./environments/environment` (already swapped to `.development.ts` by `angular.json` `fileReplacements` under `ng serve` → `enableMocks: true`, `tenantId: 'fp'`) and passes it as `env` + to `setupMocks(env)`.

**Why not `import.meta.env`?** Angular CLI has no `NG_APP_*` replacement pipeline (recorded gotcha); `environment.ts` + `fileReplacements` is the working mechanism.

### D5. Explicit `setupMocks()` call in tenant main (not inside factory)

Shell `main.ts` pattern: `await setupMocks(...)` then `createWhiteLabelApp(...)`. Tenant mirrors it. **Alternative:** call inside `createWhiteLabelApp` (Vue shell `app.ts` does this) — rejected: changes shell factory contract for all tenants and existing tests; orthogonal to this change.

### D6. MSW: copy worker file, verify registration (no re-run)

Copy `mockServiceWorker.js` from `apps/fake-plants-vue/public/` into `apps/fake-plants-angular/public/` (MSW init file is framework-agnostic). `fp` already in `mocked-data.json` → verify presence + count (7) in a test/task instead of re-running `register-tenant` (idempotency of `addTenantConfig` unverified — avoid data churn).

## Risks / Trade-offs

- [Explicit provider missing in a code path → `NG0200` null injector for `APP_ENV`] → `buildAppConfig` is the single provider site; `ProductsService` specs add the provider explicitly; add one test asserting tenant env override reaches the service.
- [MSW worker not served → `worker.start()` fails] → `public/mockServiceWorker.js` copy task + human `ng serve` check (spec: Human verification scenario).
- [`fileReplacements` picks prod env in some invocation] → `serve` default configuration is `development` (verified in `angular.json`); human verification step catches drift.
- [Shell `main.ts` behavior drift while adding `env` param] → keep passing nothing (defaults); zero-override tests already assert this path.

## Migration Plan

Internal, no deploy/data migration. Order: shell env mechanism (back-compat tests green) → tenant wiring → human verification. Rollback = revert commits; no persisted state.

## Open Questions

- None blocking. (Where 4.7 generator templates source `AppEnv` from is a 4.7 concern.)
