# Tasks

## 1. RED — failing specs first

- [ ] 1.1 Write `apps/fake-plants-angular/src/pages/about-page.component.spec.ts` asserting the AboutPage renders its tenant-specific content (parity with `fake-plants-vue/src/pages/AboutPage.vue`); verify `bunx ng test --watch=false` FAILS because `about-page.component.ts` does not exist
- [ ] 1.2 Write tenant route spec asserting, via `createWhiteLabelApp({ extendRoutes, omitRoutePaths })`: merged routes contain path `about`, do NOT contain path `components`, and retain shell defaults (empty path → Products); verify `bunx ng test --watch=false` FAILS (tenant `main.ts` currently passes `{}`)

## 2. GREEN — implementation

- [ ] 2.1 Create `apps/fake-plants-angular/src/pages/about-page.component.ts` — standalone `@Component` with `CUSTOM_ELEMENTS_SCHEMA` (AOT rule, no `@feComponent`), lazy-loadable export `AboutPage`; verify spec from 1.1 passes
- [ ] 2.2 Update `apps/fake-plants-angular/src/main.ts` to pass `extendRoutes: [{ path: 'about', loadComponent: ... }]` and `omitRoutePaths: ['components']` — slash-less paths, comment warning exact-match convention; verify spec from 1.2 passes

## 3. Verification

- [ ] 3.1 Run `bunx ng test --watch=false` in `apps/fake-plants-angular` and verify exit code 0 (all specs green)
- [ ] 3.2 Run `bun run build` at repo root and verify the `fake-plants-angular` task succeeds in Turborepo
- [ ] 3.3 Verify `git status --porcelain apps/white-label-angular` is empty (shell untouched — merge logic reused, not modified)
- [ ] 3.4 Human check: `cd apps/fake-plants-angular && bun run dev`, visit `/about` → tenant AboutPage renders; `/components` → no route match (ComponentsPage absent); `/` → shell ProductsPage default; record result
