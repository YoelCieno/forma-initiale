# forma-initiale — Agent Guide

Turborepo + bun monorepo. Vue 3 apps → hexagonal architecture.

## Identity

- Root package name: `forma-initiale`
- Package manager: `bun@1.3.13` (declared in root `package.json`, bun reads lockfile format)
- Workspaces: `apps/*` `packages/*`
- Local packages: `@repo/*` scope (domain, presenters, infra, ui, eslint-config, typescript-config)
- Build: Turborepo 2.9.14 (`turbo.json`)
- Mise: `.mise.toml` at root with `bun = "latest"` — run `eval "$(mise activate bash)"` before bun commands if mise not sourcing automatically

## Commands (exact, verified)

| cmd | what |
|---|---|
| `bun run dev` | turbo dev — all apps, persistent |
| `bun run build` | turbo build — (white-label-vue: `vp build`, docs: `astro build`) |
| `bun run lint` | turbo lint — eslint all packages |
| `bun run format` | prettier on `*.{ts,tsx,md}` |
| `bun run test` | turbo test — runs vitest in infra + ui + white-label-vue |
| `cd apps/white-label-vue && bun run dev` | white-label-vue only |
| `cd apps/docs && bun run dev` | docs only |
| `bun add <pkg>` | add dep (bun workspace-aware) |
| `bun add -d <pkg>` | dev dep |

## Package layout

```
apps/
  white-label-vue/ — Vite 6 Vue 3 app (via Vite+ `vp` CLI), layer base for tenants
  docs/       — Astro + Starlight docs site
packages/
  domain/     — pure TS models/ports (@repo/domain)
  presenters/ — presentation layer transforming domain models into view models (@repo/presenters)
  infra/      — adapters implementing domain contracts (@repo/infra)
  ui/         — hybridJS WC wrappers, framework-agnostic (@repo/ui)
  eslint-config/  — CJS ESLint 8 config
  typescript-config/  — base.json + vite.json tsconfigs
```

## Architecture direction

Hexagonal + Vue 3 — domain and infra now created (Phase 0 complete):

- `packages/domain/` — pure TS models (no framework deps) — EXISTS
- `packages/presenters/` — presentation layer (domain → view model transforms) — EXISTS
- `packages/infra/` — adapters implementing domain contracts — EXISTS
- `apps/white-label-vue/` → Vue 3 (Vite 6 via Vite+, auto-import, vue-router hash) — ACTIVE (layer base)
- `apps/docs/` → Astro + Starlight — ACTIVE
- `packages/ui/` → framework-agnostic hybridJS WC wrappers — ACTIVE

## Key config details

- **TypeScript:** 5.5.4, `noEmit: true` (Vite handles bundling, TS is type-check only)
- **strictNullChecks:** ONLY in `apps/white-label-vue/tsconfig.json` (local override), NOT in base
- **ESLint 8 CJS:** `packages/eslint-config/index.js` uses `module.exports` (CJS in ESM project; works because ESLint loads via its own resolver)
- **Root `.eslintrc.js`:** extends `@repo/eslint-config/index.js`, sets `root: true`
- **App build:** white-label-vue → `vp build` (Vue SFCs need `vue-tsc` for typecheck, not yet added). docs → `astro build`
- **App dev:** `vite --clearScreen false` (suppresses vite startup banner)
- **Vite 6.x (white-label-vue):** has `vite.config.ts` with `@vitejs/plugin-vue`, `unplugin-auto-import` (imports: ['vue', 'vue-router']), `unplugin-vue-components`. `isCustomElement` configured for `fe-` prefixed tags.
- **Vite+ integrated:** `vp` CLI. Vite v6.x for white-label-vue via Vite+ core. `vitest: ^4.1.7` bundles Vite 6 types.
- **Turbo `^build`:** deps build before consumers; vanilla TS packages w/o build script get skipped gracefully
- **Prettier 3.x:** root-level via `bun run format`
- **ESLint plugin hoisting:** `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser` in root `devDependencies` (fixes bun workspace hoisting issue where plugins stay isolated in eslint-config's node_modules). Similarly, `eslint-plugin-vue` and `vue-eslint-parser` hoisted in root for Vue SFC linting.
- **`.mise.toml`** at root with `bun = "latest"` — source mise before running bun commands if not auto-activated

## Package exports (`@repo/ui`)

```json
{
  "./fe-button": "./components/fe-button.ts",
  "./fe-async-content": "./components/fe-async-content.ts",
  "./fe-card": "./components/fe-card.ts",
  "./fe-icon": "./components/fe-icon.ts",
  "./fe-rating": "./components/fe-rating.ts",
  "./styles": "./styles/webawesome.ts",
  "./styles/themes/default": "./styles/themes/default.ts",
  "./styles/themes/awesome": "./styles/themes/awesome.ts",
  "./styles/themes/shoelace": "./styles/themes/shoelace.ts"
}
```

Import from apps:
```typescript
import '@repo/ui/fe-button'
import type { FeButtonElement } from '@repo/ui/fe-button'
import '@repo/ui/fe-card'
import '@repo/ui/fe-async-content'
import '@repo/ui/styles'              // WA base (native+utilities, no theme)
import '@repo/ui/styles/themes/default' // WA theme
```

## WebAwesome Agent Skill Reference

Web Awesome publishes an Agent Skill (`@awesome.me/webawesome@3.7.0`) with full component API docs. Copied to stable project path:

`.opencode/references/webawesome/`

### Structure

```
.opencode/references/webawesome/
├── SKILL.md                          # Overview, component listing, quick start, themes
└── references/
    ├── components/                   # Per-component docs: API, props, events, slots, CSS parts
    │   ├── button.md, card.md, icon.md, input.md, ... (50+ files)
    ├── frameworks/                   # React, Vue, Angular, Svelte guides
    │   └── vue.md
    ├── tokens/                       # Design tokens: color, typography, spacing, shadows
    ├── utilities/                    # Layout, rounding, native styles, vis-hidden
    ├── themes.md                     # Theme + palette usage
    ├── installation.md
    ├── usage.md
    ├── form-controls.md
    ├── customizing.md
    └── localization.md
```

### When to load

When implementing or modifying `fe-*` wrapper components in `packages/ui/`, consult the relevant WA component docs in `.opencode/references/webawesome/references/components/<component>.md` for:
- Component API (props, events, methods, slots)
- CSS custom properties for styling
- CSS parts for internal element targeting

When styling with WA design tokens, see `.opencode/references/webawesome/references/tokens/`.

## Gotchas & quirks

1. **WA styles split into base + theme** — `@repo/ui/styles` now imports only `native.css` + `utilities.css` (no theme). Apps must **separately** import `@repo/ui/styles/themes/<name>` to get WA component styling. Forgetting the theme import causes unstyled WA components.
2. **strictNullChecks is scoped** — only `apps/white-label-vue` overrides it. New packages/apps likely need the same override.
3. **Vue type checking** — `tsc` doesn't process `.vue` files. `vue-tsc` would be needed for type checking Vue SFCs; not yet added (Phase 0 uses Vite esbuild transpilation only).
4. **ESLint hoisting** — bun keeps `@typescript-eslint/*` plugins isolated inside `eslint-config/node_modules`. Root `devDependencies` ensures all packages can resolve them. If adding new ESLint plugins, mirror in root devDeps.
5. **App build divergence** — white-label-vue: `vp build` (no tsc). docs: `astro build`. Turbo `^build` handles the dep graph, but individual build scripts differ.
6. **TypeScript config packages** — `vite.json` extends `base.json`. `base.json` has `strict: true` but `noUnusedLocals/noUnusedParameters: false` (those are in `vite.json` instead).
7. **`.gitignore`** covers `dist`, `dist-ssr`, `*.local`, `.env`, `.turbo`, `node_modules`, `.zed/`, `.qwen/`.
8. **`apps/white-label-vue/src/style.css` deleted** — Vue uses scoped styles. Don't re-add global CSS unless intentional.
9. **`apps/white-label-vue/src/vite-env.d.ts`** has Vue module declaration (`declare module '*.vue'`) — needed for TS to understand `.vue` imports.
10. **hybridJS render timing** — `deferred.then()` microtask. Tests need `await Promise.resolve()` (×2 for Lit attr reflection). Set properties not attributes.
11. **WA Agent Skill available** — WA publishes an Agent Skill at `.opencode/references/webawesome/` with full component docs (API, events, CSS parts, tokens). When building `fe-*` wrappers, read the relevant `<component>.md` first for API contract.

## Agent rules

- **BEM CSS naming** — Vue SFCs use BEM convention: `.block__element--modifier`. See `apps/white-label-vue/src/styles/README.md`. No nested element selectors — always explicit BEM class names. Not for `fe-*` wrappers (WA shadow DOM only).
- **Never hardcode colors/spacing/typography** — always use design system CSS custom properties (`--wa-*` vars). Overrides in `apps/*/src/styles/tokens.css`. Never hardcode literal values.
- **Prefer i18n keys over hardcoded labels** — framework i18n (setup pending)
- **Standalone components** — Angular/Vue components must be standalone
- **Unidirectional data flow** — no two-way bindings for state logic
- **Immutable updates** — spread operator, never mutate
- **ESLint 8** — do NOT upgrade to ESLint 9/flat config unless explicitly asked; existing config is CJS `module.exports`
- **Commit scope** — use `@repo/` pkg name or app name (e.g. `feat(web):`, `chore(ui):`)
