# Proposal

## Why

`fake-plants-angular` (task 4.6.1) boots with zero overrides — the Angular layer mechanism is proven for fallback, but not for extension. Task 4.6.2 must demonstrate that a tenant can add and remove routes through `createWhiteLabelApp()` options, parity with `fake-plants-vue` (`extendRoutes` about, `omitRoutePaths` components), before the remaining override tasks (4.6.3-4.6.6) and the Angular generator (4.7).

## What Changes

- Tenant `main.ts` passes `extendRoutes` (lazy `about` route) and `omitRoutePaths` (`components`) to `createWhiteLabelApp()` — first override usage in an Angular tenant
- New tenant `AboutPage` standalone component rendered at `/about` (parity with `fake-plants-vue/src/pages/AboutPage.vue`)
- Route path matching follows Angular conventions: slash-less route paths (`about`, `components`), matching the shell's `routes.ts` and the exact-match filter in `mergeRoutes` — unlike the Vue tenant's `/components`
- Shell (`white-label-angular`) unchanged — merge logic already exists and is covered by `init.spec.ts`

## Capabilities

### New Capabilities

- `fake-plants-angular-routes`: Tenant route overrides — extending shell routes with a tenant `AboutPage` at `/about`, omitting the shell's `components` route, and preserving shell default routes for anything not overridden

### Modified Capabilities

(none — shell route-merge behavior is unchanged; the `fake-plants-angular-tenant` scaffold contract is unchanged)

## Impact

- `apps/fake-plants-angular/src/main.ts` — route override options added
- `apps/fake-plants-angular/src/pages/about-page.component.ts` (+ spec) — new
- No shell code, no `@repo/*` changes
- Nav link to `/about` is NOT included — nav/appShell override belongs to 4.6.3; `/about` is reachable by direct URL for validation
- Validation: `bunx ng test --watch=false` (tenant) green, `bun run build` green
