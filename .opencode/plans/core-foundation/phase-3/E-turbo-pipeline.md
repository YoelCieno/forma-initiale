# E. Turborepo Pipeline Update

**Goal:** Ensure tenant apps build correctly via Turborepo with proper dependency chain.

## Sources

| Source file | Content |
|------------|---------|
| `turbo.json` | Pipeline config |
| `package.json` workspaces | `apps/*` glob |

## Tasks

### E1. Verify workspace glob handles tenants

- [ ] `package.json` workspaces: `["apps/*", "packages/*"]` — this already covers `apps/fake-plants-vue/` and `apps/tenant-*` automatically
- [ ] No turbo.json change needed — Turborepo auto-discovers workspaces

### E2. Verify dep chain

- [ ] `fake-plants-vue` has `@repo/white-label-vue` in deps → turbo resolves `^build` dep chain automatically
- [ ] Chain: `@repo/domain` → `@repo/infra` → `@repo/ui` → `@repo/presenter` → `@repo/white-label-vue` → `fake-plants-vue`
- [ ] Run `bun run build` from root — verify all packages + apps build in correct order

### E3. Optional: Explicit pipeline for tenants

- [ ] Only needed if tenant build differs from standard `vite build`
- [ ] If keeping standard, no changes required

## ✅ Manual Confirmation

- [ ] `bun run build` from root succeeds
- [ ] `bun run test` from root succeeds
- [ ] Human confirms: "Pipeline works, proceed to F"
