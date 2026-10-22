# Proposal

## Why

The Angular shell hardcodes its root component (`App` in `bootstrap/app.ts`), so tenants cannot own the app shell — yet the Vue shell already supports this via the `appShell` option (`white-label-vue/src/bootstrap/init.ts` `resolveAppShell`). Without it, `fake-plants-angular` cannot reach nav parity with `fake-plants-vue`: it still shows the shell's `Products / Components` nav while the `components` route is omitted (4.6.2), leaving a dead link. This is phase 4.6.3, the next step before the generator (4.7).

## What Changes

- Angular shell `bootstrap/init.ts` gains `appShell?: () => Promise<Type<unknown>>` on `WhiteLabelAppOptions` and a `resolveAppShell(opts)` helper that returns the tenant shell when provided, otherwise the static shell `App`.
- Angular shell `bootstrap/app.ts` resolves `root` via `resolveAppShell(opts)` instead of hardcoding `App`.
- Tenant `fake-plants-angular` adds a root component (`src/app/app.component.ts`, `FpApp`) that owns the nav: Products / About (no Components link), using `routerLink` + `routerLinkActive` with exact-match options.
- Tenant `main.ts` passes `appShell: () => import('./app/app.component').then((m) => m.FpApp)`.
- Tenant nav styles are tenant-owned (BEM `.fp-nav__*`), copied from `fake-plants-vue` `App.vue` — visual parity confirmed by human inspection, not by tests.

## Capabilities

### New Capabilities

- `fake-plants-angular-appshell`: Shell `appShell` option contract (tenant-provided lazy root component resolves, default falls back to shell `App`) and the tenant's root component owning the nav (Products / About, Components link removed).

### Modified Capabilities

<!-- none: shell nav requirement in angular-pages-parity stays valid (shell default unchanged);
     existing tenant/route requirements unchanged -->

## Impact

- `apps/white-label-angular/src/bootstrap/init.ts` — new option + `resolveAppShell` (parity with Vue `resolveAppShell`, static default)
- `apps/white-label-angular/src/bootstrap/app.ts` — `root: await resolveAppShell(opts)`
- `apps/white-label-angular/src/bootstrap/{init,app}.spec.ts` — new tests (RED first, TDD)
- `apps/fake-plants-angular/src/app/app.component.ts` — new tenant root component
- `apps/fake-plants-angular/src/main.ts` — pass `appShell`
- `apps/fake-plants-angular/src/main.spec.ts` — assert root resolves to `FpApp`
- No shell nav change; no route change (4.6.2 already omits `components`)
- Follow-up: generator (4.7) must decide how nav ships (override-only vs shell nav slots)
