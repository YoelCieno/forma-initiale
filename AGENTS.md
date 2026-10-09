# forma-initiale — Agent Guide

Turborepo + bun monorepo. Hexagonal layers: `domain → presenters → infra → packages/ui (framework-agnostic) → apps`. Two shells (Vue 3, Angular 22) + tenants extending shells via app factories.

## Commands

| cmd | what |
| --- | --- |
| `bun run dev` | all apps, persistent. Ports: white-label-vue **3100**, fake-plants-vue **3101**, white-label-angular 4200, fake-plants-angular 4201, docs 4321 |
| `bun run build` / `lint` / `test` / `format` | turbo-wide (test = vitest via `vp` in packages + Vue apps; `ng test --watch=false` in Angular apps) |
| `bun run test --filter=@repo/infra` | single package (turbo filter — verified) |
| `cd packages/infra && vp test src/<file>.spec.ts` | single test file |
| `bun run generate:vue-tenant` | interactive Pinion generator — new Vue tenant |
| `bun run register-tenant --prefix <key> --names-json '[...]'` | add MSW tenant config |
| `bun add <pkg>` / `bun add -d <pkg>` | workspace-aware dep add |

- **Pre-commit hook = `bun run test`** (`.husky/pre-commit`) — full suite runs on every commit. Expect slow commits; run tests before committing to avoid hook surprises.
- **NEVER use `npx`** — root `package.json` overrides `vite`/`vitest` to `@voidzero-dev/vite-plus-*` npm aliases; npm dies with `EOVERRIDE`. Use `bun x` (e.g. `bun x msw init apps/<app>/public/` to regen MSW worker).
- No typecheck script — TS is `noEmit` only; Vue SFCs have no type checking at all (`vue-tsc` not installed).

## Package layout

```
apps/
  white-label-vue/     — Vue 3 shell (Vite 6 via Vite+ `vp`). Exports factory + vite config base
  fake-plants-vue/     — Vue 3 tenant, extends shell
  white-label-angular/ — Angular 22 shell (zoneless, signals). Exports ./app, ./fe-property-shim
  fake-plants-angular/ — Angular 22 tenant, extends shell
  docs/                — Astro + Starlight
packages/
  domain/  presenters/  infra/  ui/  utils/  generator/   — @repo/* scope
  eslint-config/       — CJS ESLint 8
  typescript-config/   — base.json + vite.json
```

Layer direction is enforced: apps must consume `fe-*` wrappers from `@repo/ui`, never `wa-*` directly. Domain/infra adapters take config as params — never import `import.meta.env`/`environment.*` inside packages; apps pass env in.

## Key config

- **TypeScript 6.0.3**, `strict: true` in base; `strictNullChecks` is opt-in per project (`apps/white-label-vue`, `apps/fake-plants-vue`, `packages/ui`). New apps/packages likely need the same override. `vite.json` extends `base.json` and adds `noEmit` + `noUnusedLocals/Parameters`.
- **ESLint 8 CJS — do NOT upgrade to ESLint 9 / flat config.** Plugins (`@typescript-eslint/*`, `eslint-plugin-vue`, `vue-eslint-parser`) must stay hoisted in root `devDependencies` (bun leaves them isolated otherwise). New plugin? Mirror in root devDeps.
- **Prettier:** `singleQuote: true`, `semi: false`.
- **Vite+ `vp` CLI** — `vite`/`vitest` are npm-aliased to `@voidzero-dev/vite-plus-core/test` at root.
- **Vue shell vite config:** `apps/white-label-vue/vite.config.base.ts` exports `defineWhiteLabelViteConfig()` — `isCustomElement` for `fe-*`, AutoImport (`vue`, `vue-router`), Components dirs (tenant dirs scanned FIRST so they win name clashes), `devPort` opt. `server.watch.ignored` re-includes `node_modules/@repo/**` symlinks — without it, HMR breaks on workspace packages.
- **App factory (Vue):** `createWhiteLabelApp()` in `white-label-vue/src/bootstrap/app.ts`; tenants import `white-label-vue/app` (workspace name, not `@repo/*`). Supports `routes`, `extendRoutes`, `omitRoutePaths`, `appShell`, `metaMap`.
- **`white-label-angular` `"./styles"` export is STALE** — points at `src/styles/index.ts` which does not exist (dir has `base.css`/`tokens.css` only). `fake-plants-angular/angular.json` deep-refs `../white-label-angular/src/styles/*` directly — accepted interim, planned for consolidation with Angular generator work.
- **MSW:** mocks in `packages/infra/src/mocks/`. Each app carries its own `public/mockServiceWorker.js` copy — regen per app with `bun x msw init apps/<app>/public/`.
- **Renovate:** weekly (Mon 5 AM UTC), auto-merge minor/patch, majors manual. `.github/workflows/renovate.yml` + `renovate.json`.
- **mise** at root (`bun = "latest"`); source via `eval "$(mise activate bash)"` if bun not on PATH.

## WebAwesome (design system)

Full WA agent skill (component APIs, props, events, CSS parts, tokens) vendored at `.opencode/references/webawesome/`. **Read `references/components/<component>.md` before building/modifying any `fe-*` wrapper.** Tokens docs: `references/tokens/`.

## Gotchas

1. **WA theme = separate import.** `@repo/ui/styles/main.css` imports only `native.css` (no theme; utilities dropped — app code is BEM, 0 WA utilities). Apps must ALSO import `@repo/ui/styles/themes/<name>.css` (default/awesome/shoelace) + their `src/styles/tokens.css`. Missing theme = unstyled components.
2. **hybridJS render timing** — renders in `deferred.then()` microtask. Tests: `await Promise.resolve()` ×2 (Lit attr reflection). Set JS properties, not attributes.
3. **hybrids custom CSS = `html.css`, not `<style>`** — chain `.css\`...\`` on the hybrid template literal; one shared `CSSStyleSheet` via adopted stylesheets. Exception: `fe-img` uses `<style>` (legacy). NEW styles MUST use `html.css`.
4. **FACE / `ElementInternals` shim** — jsdom lacks `validity.valid`/`states`/`setFormValue`. Shared shim: `packages/infra/src/testing/element-internals.ts`, loaded by BOTH Angular apps via `setupFiles` (workspace-root-relative path only — no bare specifiers there) + legacy stub `packages/ui/vitest.setup.ts`. Shim `states` is `{add, delete, has}` only — WA `:state()` styling won't work in tests. Details: `docs/integrations/form-associated-custom-elements.md`.
5. **Angular bare attrs broken on `fe-*`** — `CUSTOM_ELEMENTS_SCHEMA` only calls `setAttribute()` after the hybrids constructor already read attributes. ALL `fe-*` props in Angular MUST use `[prop]="value"` property bindings. Bare attrs (`readonly`, `tabindex`) need `FePropertyShimDirective`: `apps/white-label-angular/src/components/fe-property-shim.directive.ts`.
6. **JIT = signal inputs invisible in tenant tests** — `@angular/build:unit-test` hardcodes `externalPackages: true`; bare `white-label-angular/*` imports load via plain vite transform (JIT), which only reads `@Component` metadata `inputs` — signal `input()` fields fall through to DOM props (NG0950), and mixing `inputs:` metadata with signal inputs throws NG1051. Components consumed by tenants via package specifiers MUST use classic `@Input()` until package subpath exports are consolidated. Relative imports (shell tests) stay AOT — two separate module instances.
7. **`import.meta.env` needs ambient typing in Angular tenants** — `@repo/infra` mocks use it; without `src/import-meta-env.d.ts` tenant `ng test`/`ng build` fails `TS2339 Property 'env' does not exist on type 'ImportMeta'`. Scaffold copies it from shell.
8. **@feComponent decorator ≠ Angular AOT** — AOT does static analysis, only recognizes `@Component` directly; wrapper falls back to JIT → blank page. Angular components use plain `@Component` + `CUSTOM_ELEMENTS_SCHEMA`.

## Agent rules

- **BEM CSS** in Vue SFCs (`.block__element--modifier`), no nested element selectors. Not for `fe-*` wrappers (shadow DOM). See `apps/white-label-vue/src/styles/README.md`.
- **Never hardcode colors/spacing/typography** — always `var(--wa-*)` tokens; overrides live in `apps/*/src/styles/tokens.css`.
- **Standalone components**, unidirectional data flow, immutable updates (spread, never mutate).
- **Function factory pattern** — 2+ fns/module → `export function name()` returning inner arrows; 1 fn → direct export. See `utils-factory-pattern` memory block.
- **TDD** — failing test before implementation; regression tests go beside the fix, not in standalone probe files.
- **Commits** — ask user before commit/push; conventional commits scoped to app or `@repo/` pkg (e.g. `feat(white-label-angular):`).
- **Algorithm work** — prefer proven algorithms, verify against canonical spec, `>>> 0` for unsigned 32-bit, never claim "collision-free". Full pattern: `architecture` memory / `.opencode/thoughts/research/2026-07-03-hash-algorithms-seed-generation.md`.

## Other instruction sources

- `.opencode/memory/` — project memory blocks (project, architecture, utils-factory-pattern, session learnings)
- `openspec/` — active changes in `openspec/changes/`, main specs in `openspec/specs/`. Workflow skills: `.claude/skills/openspec-*` + `.opencode/skills/openspec-*`
- `docs/integrations/form-associated-custom-elements.md` — FACE browser cutoff table
