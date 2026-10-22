# Proposal

## Why

The `fake-plants-angular` tenant can't display its own product data: the shell's `ProductsService` hard-imports the shell's `environment` (tenantId `wl`, mocks off), so the tenant's existing `environment*.ts` files (`tenantId: 'fp'`, mocks on) are never consumed — Products fetches `wl` data or errors. The tenant also never passes `metaMap: plantsMap` (plan 4.6.4) nor starts MSW (plan 4.6.6, no `setupMocks()` call, no `public/mockServiceWorker.js`), so the end-to-end check "7 plant cards with plant metadata render from `/fp/products`" fails. This blocks plan 4.6 sign-off and the 4.7 Angular generator.

## What Changes

- **Shell env injection** — new `APP_ENV` injection token; `WhiteLabelAppOptions` gains optional `env` (`{ apiUrl, tenantId, enableMocks }`); `buildAppConfig` provides `APP_ENV` (shell `environment` as default, zero-override behavior unchanged); `useWhiteLabelApp()` / `setupMocks()` accept the env so mocks gate works pre-bootstrap (DI unavailable before `bootstrapApplication`); `ProductsService` injects `APP_ENV` instead of importing shell `environment`.
- **Tenant metaMap (4.6.4)** — tenant `main.ts` passes `metaMap: plantsMap` (from `@repo/infra`) so product titles/subtitles show the 7 plant names via `META_MAP_INJECTION_KEY`, overriding `frameworkMap`.
- **Tenant MSW wiring (4.6.6)** — tenant `main.ts` calls `setupMocks()` with tenant env; `public/mockServiceWorker.js` added (copied from `fake-plants-vue`); MSW tenant `fp` registration verified in `mocked-data.json` (already present — verify, don't re-register).
- **Tests** — TDD specs for `env` option → `APP_ENV` provider, `ProductsService` env injection, `setupMocks` gate, tenant factory args (metaMap + env + setupMocks call).

## Capabilities

### New Capabilities

- `angular-env-injection`: Shell-level env config mechanism — `APP_ENV` token, `env` factory option, `setupMocks(env)`, `ProductsService` consuming injected env; defaults preserve current zero-override behavior.
- `fake-plants-angular-product-data`: Tenant end-to-end wiring — tenant passes `env` (fp, mocks on) + `metaMap: plantsMap`, starts MSW, serves `mockServiceWorker.js`; product list fetches `/fp/products` and renders 7 plant products with plant metadata.

### Modified Capabilities

<!-- none — existing requirements (scaffold contract, routes, appShell, parity) stay unchanged -->

## Impact

- **Shell code:** `apps/white-label-angular/src/bootstrap/init.ts` (`APP_ENV` token, `env` option, `setupMocks(env)`), `bootstrap/app.ts` (pass env → config), `services/products.service.ts` (inject `APP_ENV`), `main.ts` (pass own env), specs.
- **Tenant code:** `apps/fake-plants-angular/src/main.ts` (env + metaMap + setupMocks), `public/mockServiceWorker.js` (new), `main.spec.ts`.
- **Unchanged:** `@repo/infra` handlers/adapter (`*/api/:tenant/products` + `x-tenant-id` already support `fp`), `mocked-data.json` (`fp` registered), route/appShell options, plan 4.6.5 (brand/ProductCard — separate change).
- **Downstream:** plan 4.6.4 + 4.6.6 ticked post-archive; 4.7 Angular generator templates inherit the `env` + `setupMocks` + `metaMap` pattern.
