# Tasks

## 1. Shell env injection (TDD — RED first)

- [x] 1.1 RED: add specs in `apps/white-label-angular/src/bootstrap/init.spec.ts` — `buildAppConfig` provides `APP_ENV` with the passed `env` when given, and shell `environment` defaults when `env` omitted; run `cd apps/white-label-angular && ng test --watch=false` and confirm they FAIL (token not exported yet)
- [x] 1.2 GREEN: add `AppEnv` interface + `APP_ENV` token + `env?: AppEnv` on `WhiteLabelAppOptions`; `buildAppConfig` always provides `{ provide: APP_ENV, useValue: opts.env ?? environment }`; confirm 1.1 specs pass
- [x] 1.3 RED: extend `apps/white-label-angular/src/services/products.service.spec.ts` — TestBed provider `APP_ENV` = `{ apiUrl: 'https://api.example.com/api', tenantId: 'fp', enableMocks: true }`, assert loader fetches `.../api/fp/products` with header `x-tenant-id: fp`; confirm FAIL (service still imports static shell env)
- [x] 1.4 GREEN: `ProductsService` injects `APP_ENV` (remove `../environments/environment` import); confirm 1.3 passes + existing zero-override specs still pass
- [x] 1.5 RED: add `setupMocks(env)` specs in `init.spec.ts` — `enableMocks: true` → worker starts (spy `worker.start`), `false` → no start, omitted → falls back to shell `environment`; confirm FAIL
- [x] 1.6 GREEN: implement `setupMocks(env?: AppEnv)` gate in `init.ts`; confirm all `init.spec.ts` green
- [x] 1.7 Re-export `type AppEnv`, `APP_ENV`, `useWhiteLabelApp` from `apps/white-label-angular/src/bootstrap/app.ts`; verify with `cd apps/white-label-angular && ng test --watch=false` green (all groups)

## 2. Tenant env + metaMap (TDD)

- [x] 2.1 RED: in `apps/fake-plants-angular/src/main.spec.ts`, mock `white-label-angular/app`, dynamically import `./main`, assert factory received `env` = `{ tenantId: 'fp', enableMocks: true, apiUrl: ... }` and `metaMap` = `plantsMap` (7 keys); confirm FAIL
- [x] 2.2 GREEN: tenant `main.ts` imports `./environments/environment` and passes `env` + `metaMap: plantsMap`; confirm 2.1 passes via `cd apps/fake-plants-angular && ng test --watch=false`

## 3. MSW wiring (TDD)

- [x] 3.1 RED: extend tenant `main.spec.ts` — assert `setupMocks` called with tenant env BEFORE `createWhiteLabelApp`; confirm FAIL
- [x] 3.2 GREEN: tenant `main.ts` calls `const { setupMocks } = useWhiteLabelApp(); await setupMocks(env)` before factory; confirm 3.1 passes
- [x] 3.3 Copy `mockServiceWorker.js` from `apps/fake-plants-vue/public/` to `apps/fake-plants-angular/public/`; verify file exists
- [x] 3.4 Verify `fp` tenant registration: assert `packages/infra/src/mocks/data/mocked-data.json` has `fp` with exactly the 7 plant names (test or script check — do NOT re-run `register-tenant`)

## 4. Full verification + plan sync

- [x] 4.1 `bun run test` green (turbo — all packages/apps)
- [x] 4.2 `bun run build` green
- [x] 4.3 `bun run lint` green
- [x] 4.4 Human check: `cd apps/fake-plants-angular && ng serve` (port 4201) → 7 plant cards render with plant metadata, Network shows `/fp/products`
- [x] 4.5 Tick 4.6.4 + 4.6.6 + matching validation checks in `.opencode/plans/core-foundation/phase-4/4.6-fake-plants-angular.md`
