# forma-initiale — Agent Guide

Turborepo + bun monorepo. Vue 3 apps → hexagonal architecture.

## Identity

- Root package name: `forma-initiale`
- Package manager: `bun@1.3.13` (declared in root `package.json`, bun reads lockfile format)
- Workspaces: `apps/*` `packages/*`
- Local packages: `@repo/*` scope (domain, infra, ui, eslint-config, typescript-config)
- Build: Turborepo 2.9.14 (`turbo.json`)
- Mise: `.mise.toml` at root with `bun = "latest"` — run `eval "$(mise activate bash)"` before bun commands if mise not sourcing automatically

## Commands (exact, verified)

| cmd | what |
|---|---|
| `bun run dev` | turbo dev — all apps, persistent |
| `bun run build` | turbo build — vite build each app (web-vue: `vite build`, docs: `tsc && vite build`) |
| `bun run lint` | turbo lint — eslint all packages |
| `bun run format` | prettier on `*.{ts,tsx,md}` |
| `bun run test` | turbo test — runs vitest in infra + ui + web-vue |
| `cd apps/web-vue && bun run dev` | web-vue only |
| `cd apps/docs && bun run dev` | docs only |
| `bun add <pkg>` | add dep (bun workspace-aware) |
| `bun add -d <pkg>` | dev dep |

## Package layout

```
apps/
  web-vue/    — Vite 6 Vue 3 app (via Vite+ `vp` CLI)
  docs/       — Astro + Starlight docs site
packages/
  domain/     — pure TS models/ports (@repo/domain)
  infra/      — adapters implementing domain contracts (@repo/infra)
  ui/         — hybridJS WC wrappers, framework-agnostic (@repo/ui)
  eslint-config/  — CJS ESLint 8 config
  typescript-config/  — base.json + vite.json tsconfigs
```

## Architecture direction

Hexagonal + Vue 3 — domain and infra now created (Phase 0 complete):

- `packages/domain/` — pure TS models (no framework deps) — EXISTS
- `packages/infra/` — adapters implementing domain contracts — EXISTS
- `apps/web-vue/` → Vue 3 (Vite 6 via Vite+, auto-import, vue-router hash) — ACTIVE
- `apps/docs/` → Astro + Starlight — ACTIVE
- `packages/ui/` → framework-agnostic hybridJS WC wrappers — ACTIVE

## Key config details

- **TypeScript:** 5.5.4, `noEmit: true` (Vite handles bundling, TS is type-check only)
- **strictNullChecks:** ONLY in `apps/web-vue/tsconfig.json` (local override), NOT in base
- **ESLint 8 CJS:** `packages/eslint-config/index.js` uses `module.exports` (CJS in ESM project; works because ESLint loads via its own resolver)
- **Root `.eslintrc.js`:** extends `@repo/eslint-config/index.js`, sets `root: true`
- **App build:** web → `vite build` (Vue SFCs need `vue-tsc` for typecheck, not yet added). docs → `tsc && vite build`
- **App dev:** `vite --clearScreen false` (suppresses vite startup banner)
- **Vite 6.x (web-vue) / Vite 5.x (docs):** web has `vite.config.ts` with `@vitejs/plugin-vue`, `unplugin-auto-import` (imports: ['vue', 'vue-router']), `unplugin-vue-components`. `isCustomElement` configured for `wa-` and `fe-` prefixed tags.
- **Vite+ integrated:** `vp` CLI. Vite v6.x for web-vue via Vite+ core. `vitest: ^4.1.7` bundles Vite 6 types.
- **Turbo `^build`:** deps build before consumers; vanilla TS packages w/o build script get skipped gracefully
- **Prettier 3.x:** root-level via `bun run format`
- **ESLint plugin hoisting:** `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` in root `devDependencies` (fixes bun workspace hoisting issue where plugins stay isolated in eslint-config's node_modules). Similarly, `eslint-plugin-vue` and `vue-eslint-parser` hoisted in root for Vue SFC linting.
- **`.mise.toml`** at root with `bun = "latest"` — source mise before running bun commands if not auto-activated

## Package exports (`@repo/ui`)

```json
{
  "./fe-button": "./components/fe-button.ts",
  "./styles": "./styles/webawesome.ts"
}
```

Import from apps: `import '@repo/ui/fe-button'; import type { FeButtonElement } from '@repo/ui/fe-button'`

## Gotchas & quirks

1. **strictNullChecks is scoped** — only `apps/web-vue` overrides it. New packages/apps likely need the same override.
2. **Vue type checking** — `tsc` doesn't process `.vue` files. `vue-tsc` would be needed for type checking Vue SFCs; not yet added (Phase 0 uses Vite esbuild transpilation only).
3. **ESLint hoisting** — bun keeps `@typescript-eslint/*` plugins isolated inside `eslint-config/node_modules`. Root `devDependencies` ensures all packages can resolve them. If adding new ESLint plugins, mirror in root devDeps.
4. **App build divergence** — web: `vite build` (no tsc). docs: `tsc && vite build`. Turbo `^build` handles the dep graph, but individual build scripts differ.
5. **TypeScript config packages** — `vite.json` extends `base.json`. `base.json` has `strict: true` but `noUnusedLocals/noUnusedParameters: false` (those are in `vite.json` instead).
6. **`.gitignore`** covers `dist`, `dist-ssr`, `*.local`, `.env`, `.turbo`, `node_modules`.
7. **`apps/web-vue/src/style.css` deleted** — Vue uses scoped styles. Don't re-add global CSS unless intentional.
8. **`apps/web-vue/src/vite-env.d.ts`** has Vue module declaration (`declare module '*.vue'`) — needed for TS to understand `.vue` imports.
9. **hybridJS render timing** — `deferred.then()` microtask. Tests need `await Promise.resolve()` (×2 for Lit attr reflection). Set properties not attributes.

## Agent rules

- **Never hardcode colors/spacing/typography** — always use design system CSS custom properties (DS tokens not yet defined; add DS var rather than hardcoding if missing)
- **Prefer i18n keys over hardcoded labels** — framework i18n (setup pending)
- **Standalone components** — Angular/Vue components must be standalone
- **Unidirectional data flow** — no two-way bindings for state logic
- **Immutable updates** — spread operator, never mutate
- **ESLint 8** — do NOT upgrade to ESLint 9/flat config unless explicitly asked; existing config is CJS `module.exports`
- **Commit scope** — use `@repo/` pkg name or app name (e.g. `feat(web):`, `chore(ui):`)
