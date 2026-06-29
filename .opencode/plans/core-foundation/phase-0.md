# Phase 0 — Hexagonal Skeleton

**Status:** ✅ COMPLETED (commit `95436f8`)

## Goal

Scaffold minimal hexagonal monorepo with Turborepo + bun + Vue 3 + Vite 5.

## Tasks

- [x] Create monorepo from Turborepo `with-vite` template
- [x] Create `packages/domain/` (`@repo/domain`) — `Product` model
- [x] Create `packages/infra/` (`@repo/infra`) — `GetProductsAdapter`
- [x] Convert `apps/web` from vanilla TS to Vue 3
- [x] Wire auto-import (unplugin-auto-import, unplugin-vue-components)
- [x] Add ESLint config for new packages
- [x] Hoist ESLint plugins to root (bun workspace fix)
- [x] Create AGENTS.md
- [x] Verify: `bun run build` ✅, `bun run lint` ✅

## Decisions

| Decision        | Choice                                        |
| --------------- | --------------------------------------------- |
| Package manager | bun 1.3.13                                    |
| Build system    | Turborepo 2.9.14 + Vite 5                     |
| Architecture    | Package-per-layer hexagonal                   |
| Framework       | Vue 3 (not Nuxt)                              |
| Auto-import     | UI layer only (composables + components dirs) |
