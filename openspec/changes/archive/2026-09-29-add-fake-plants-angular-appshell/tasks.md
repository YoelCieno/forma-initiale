# Tasks

## 1. Shell — appShell option (TDD RED first)

- [x] 1.1 Write failing `resolveAppShell` tests in `apps/white-label-angular/src/bootstrap/init.spec.ts` (default path returns shell `App`; provided `appShell` returns tenant component; combines with `extendRoutes`/`omitRoutePaths`/`metaMap`) and verify they FAIL (`cd apps/white-label-angular && bunx ng test --watch=false`)
- [x] 1.2 Add `appShell?: () => Promise<Type<unknown>>` to `WhiteLabelAppOptions` + `resolveAppShell(opts)` in `init.ts` (static `return App` default) and verify tests 1.1 pass
- [x] 1.3 Write failing test in `apps/white-label-angular/src/bootstrap/app.spec.ts`: `createWhiteLabelApp({ appShell })` returns tenant component as `root` and verify it FAILS
- [x] 1.4 Wire `root: await resolveAppShell(opts)` in `app.ts` and verify test 1.3 passes + existing shell specs stay green (`bunx ng test --watch=false` in shell)

## 2. Tenant — root component + wiring (TDD RED first)

- [x] 2.1 Write failing assertion in `apps/fake-plants-angular/src/main.spec.ts`: `createWhiteLabelApp({ appShell })` resolves tenant component as `root` and verify it FAILS
- [x] 2.2 Create `apps/fake-plants-angular/src/app/app.component.ts` (`FpApp`: nav Products/About via `routerLink`, no Components link, `routerLinkActive` exact-match active styling, `router-outlet`, BEM `.fp-nav__*` styles using design-token vars only) and verify it compiles (`bunx ng build` in tenant)
- [x] 2.3 Pass `appShell: () => import('./app/app.component').then((m) => m.FpApp)` in tenant `main.ts` and verify test 2.1 passes + existing zero-override tests still green

## 3. Verification

- [x] 3.1 Run full tenant suite `cd apps/fake-plants-angular && bunx ng test --watch=false` and verify green (2 pre-existing + new override tests)
- [x] 3.2 Run `bun run build` at repo root and verify green (shell + tenant + turbo graph)
- [x] 3.3 Run `bun run lint` and verify no new lint errors
- [x] 3.4 Human visual check: serve tenant, compare nav side-by-side with `fake-plants-vue` `App.vue` (layout, spacing, colors, active-link treatment) and confirm parity; also confirm shell unchanged when booted without overrides

## 4. Plan bookkeeping

- [x] 4.1 Mark 4.6.3 tasks + matching validation checks in `.opencode/plans/core-foundation/phase-4/4.6-fake-plants-angular.md` and verify checkbox state reflects reality
