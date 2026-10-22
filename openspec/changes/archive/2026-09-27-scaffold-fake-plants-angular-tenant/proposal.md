# Proposal

## Why

Angular layer base (`white-label-angular`) exists but has no tenant consuming it — the layer mechanism (factory extension via workspace dep) is unproven until a tenant app extends it. Task 4.6.1 (per `.opencode/plans/core-foundation/phase-4/4.6-fake-plants-angular.md`) scaffolds that tenant manually, establishing parity with `fake-plants-vue` before the Angular generator (4.7) is built.

## What Changes

- Create `apps/fake-plants-angular/` workspace app: `package.json`, `angular.json`, `tsconfig.json` / `tsconfig.app.json` / `tsconfig.spec.json`
- Tenant depends on `white-label-angular` as `workspace:*` (no `@repo` scope) — same relationship as `fake-plants-vue` → `white-label-vue`
- Tenant scripts mirror the shell (`ng test --watch=false`, `ng build`) and register with Turborepo pipeline via workspace globs (`apps/*`)
- **Scope assumption:** this change covers task 4.6.1 (scaffold only). Route overrides, AppShell override, metaMap, brand tokens, component overrides, and MSW registration (4.6.2–4.6.6) are follow-up changes.

## Capabilities

### New Capabilities

- `fake-plants-angular-tenant`: Scaffold-level behavior of the Angular tenant app — builds and tests as a standalone workspace consumer of the `white-label-angular` shell without duplicating shell files.

### Modified Capabilities

(none — `angular-pages-parity` covers the shell, unchanged by this scaffold)

## Impact

- **New files only:** `apps/fake-plants-angular/{package.json,angular.json,tsconfig*.json}` — no shell or package changes
- **Build:** Turborepo picks up app via existing `apps/*` workspace glob; `bun install` needed to link new workspace
- **Validation:** `bunx ng test --watch=false` and `bun run build` green for the new app (minimal `src/main.ts` bootstrap)
- **Human verification:** manual browser check — tenant served via `ng serve` renders shell defaults through the factory with zero overrides (spec requirement "Manual factory boot verification")
- **Downstream:** enables 4.6.2–4.6.6 (tenant behavior) and 4.7 (Angular generator parity)
