# Angular Tenant App Approach — Phase 4 (white-label-angular)

**Date:** 2026-08-14
**Topic:** Scaffold + integration strategy for `apps/white-label-angular` in forma-initiale (bun + turborepo monorepo, hexagonal, `fe-*` hybridJS WC consumption)
**Status:** Research-only. No app code written.

## Verified environment (empirical)

| Item | Value | Evidence |
|---|---|---|
| Angular current stable | **v22.1.x** (22.0.0 released 2026-06-03; 22.1.2 core / 22.1.4 CLI+build) | npm view, GitHub releases |
| @angular/build | 22.1.4 — deps `vite: 8.1.5` (exact), `rolldown: 1.2.0`, `esbuild: 0.28.2` | npm view |
| TS peer | `>=6.0 <6.1` → root repo TS `^6.0.3` ✓ compatible | npm view peerDependencies |
| Node | Angular 22 drops Node 20 → needs ≥22. Env has **v24.18.0** ✓ | node --version |
| Zoneless | **Default** since v21, new apps ship **without zone.js** (verified in fresh scaffold: no zone.js dep/polyfill) | Angular v21 blog, fresh `ng new` scaffold |
| CD strategy | **OnPush default** in v22 (`Default` renamed `Eager`) | v22 release notes, Ninja Squad blog |
| Test runner | **Vitest default** — angular.json `"builder": "@angular/build:unit-test"`, devDep `vitest: ^4.0.8` (matches repo vitest ^4.1.7) | fresh scaffold, v21 blog |
| CLI + bun | `--package-manager bun` supported since CLI 17.2 (2024); fresh `ng new` with bunx + `--skip-install` works; generated package.json has `packageManager: bun`, angular.json `cli.packageManager: bun` | CLI releases, scaffold probe |
| Hash routing | `provideRouter(routes, withHashLocation())` ✓ matches vue-router hash pattern | angular.dev API |
| Zoneless provider | `provideZonelessChangeDetection()` still public (explicit opt-in for shared configs) | angular.dev API |
| Custom elements | `schemas: [CUSTOM_ELEMENTS_SCHEMA]` valid **per-component** (standalone `@Component`), not only NgModule | angular.dev guide/components/advanced-configuration |
| Turborepo precedent | Official `vercel/turborepo` `examples/with-angular` (Angular apps + Angular UI lib); `outputs: ["./dist"]` — our turbo.json `dist/**` already covers Angular emit | turbo repo example |
| Web Awesome + Angular | WA docs: "Angular plays nice with custom elements" (custom-elements-everywhere); guide = CUSTOM_ELEMENTS_SCHEMA + styles in angular.json | `.opencode/references/webawesome/references/frameworks/angular.md` |

## Q1 — Angular + turborepo + bun: scaffold approach

**Answer: `ng new` (Angular CLI 22), single-project config, not Nx, not manual scaffold.**

- Angular CLI **owns the Angular-specific build surface** (@angular/build: application + dev-server + unit-test). Hand-rolling a Vite config duplicates Angular's own Vite 8 integration (ng17+ Angular CLI is Vite/esbuild/Rolldown-based) and forfeits Angular update tooling (`ng update`).
- **Nx is unnecessary.** Repo already has bun workspaces + turborepo as the graph/cache layer. Nx would add a second build-graph on top of turbo (Nx + turbo = duplicate graphs) — violates turborepo skill's "package tasks, not root tasks" and KISSME.
- **Per-app package, NOT an Angular multi-app workspace.** Each app keeps its own `package.json` + `angular.json` (matches existing `apps/*` bun-workspace pattern; turbo runs per-package scripts with cwd = package dir). `ng new` inside `apps/white-label-angular/` produces exactly this shape.
- **Not manual scaffold** for the app skeleton (CLI generates correct v22 defaults: zoneless, vitest, TS configs, budgets). Manual scaffold reserved for the *layer/factory* code (Q4).

Proven scaffold sequence (verified in /tmp probe):
```bash
cd /tmp/opencode && rm -rf ngprobe && mkdir ngprobe && cd ngprobe
bunx --bun=false @angular/cli@22 new white-label-angular \
  --directory apps/white-label-angular --skip-install --package-manager bun \
  --routing true --ssr false --style css --defaults
```
- `--skip-install` → no nested node_modules; root `bun install` links workspace. **Never use `--ssr`** (no SSR in this app; also known `--ssr + --skip-install` install bug).
- After scaffold, delete `apps/white-label-angular/.git` (ng inits a nested repo), `.vscode/`, `.prettierrc` (repo uses root prettier), `packageManager` field (root owns it).
- `ng new` cannot run into an existing non-empty dir (merge conflicts) — scaffold into fresh dir under `apps/`, then hand-merge if pre-existing files.

Dev/build scripts (turbo pipeline):
```json
{ "scripts": {
    "dev": "ng serve --port 4200",
    "build": "ng build",
    "lint": "eslint \"src/**/*.ts\"",
    "test": "ng test --watch=false"
}}
```
- turbo.json needs **no change**: `build` already `dependsOn: ["^build"]` + `outputs: ["dist/**"]` (Angular emits `dist/<project>/browser/...` → covered). `dev` persistent ✓.
- Root scripts stay `turbo run <task>` (turborepo skill rule) — no root-task additions.

## Q2 — Custom elements / WC consumption

**Answer: `CUSTOM_ELEMENTS_SCHEMA` on standalone components + JS-property bindings. Do NOT use `createCustomElement()` (that's the reverse direction — wrapping Angular components AS WCs; not needed, `@angular/elements` end-of-life)。**

```ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import '@repo/ui/fe-button'

@Component({
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],   // per-component, confirmed angular.dev
  template: `
    <fe-button [variant]="'primary'" [size]="'m'" [disabled]="busy()" (click)="buy()">
      Add
    </fe-button>
  `,
})
export class ProductCard {}
```

Binding semantics vs hybridJS (`fe-*`):
- **Set properties, not attributes.** hybridJS defines element *properties* (`host.variant`, `host.disabled`); Angular `[prop]="x"` sets the element property → hybrid re-renders. This is the same rule already encoded in AGENTS gotcha "WA boolean props — test via JS property" and "Set properties not attributes".
- Bool inputs: `[disabled]="cond"` — property setter coerces (hybrids boolean defs). Static string props can be literal attributes (`variant="filled"`).
- Events: native `(click)` works (fe-button host dispatches). WA custom events (`wa-*`) bubble + composed → Angular `(wa-change)="..."` binding works when wrappers pass them through. Current fe-* set is click-driven; no control value accessors needed yet (no ngModel on WCs — keep forms out or write CVA when needed).
- **Type checking caveat**: `CUSTOM_ELEMENTS_SCHEMA` disables template property/event checking for those elements (opt-out is binary). Accept: (a) re-export `FeButtonElement` interface types from `@repo/ui/fe-button` for `[prop]` typing via `@ViewChild`/template refs; (b) `HTMLElementTagNameMap` augmentation gives `document.querySelector` typing, not template checking. Do not chase per-property typing — not supported for WC schema.
- Registration timing: `import '@repo/ui/fe-button'` side-effect calls `customElements.define()` at module load (hybrids `define()`). Import in app component / `main.ts` before first paint — same as Vue apps. No lazy-registration needed for CSR.
- Zoneless × WC: hybridJS renders internally (shadow DOM) on its own microtask — **does not need Angular CD**. Angular CD triggers on template event listeners; view-model changes flow via signals (below). No zone.js dependency anywhere.

## Q3 — Hexagonal architecture in Angular

Layout (mirrors `white-label-vue/src` convention):
```
apps/white-label-angular/src/
  bootstrap/            ← factory layer (app.ts + init.ts)  [Q4]
  main.ts               ← standalone entry (calls factory with defaults)
  core/                 ← ports (interfaces) + InjectionTokens
  infra/                ← NOT the adapters — those live in @repo/infra
  components/           ← default fe-* compositing components
  pages/                ← default page components (Products, About, Components)
  styles/tokens.css     ← default brand tokens (--wa-* overrides)
```

DI wiring (Angular 22):
- **DI style (v22, researched 2026-08-14):** `@Service()` is STABLE in v22 (not optional-preview) and is the official recommendation for new singleton services — `@Service()` + `inject()` (ng generate service emits it by default). BUT `@Service()` provides the class only under its own class-token at root — it CANNOT express `{ provide: TOKEN, useClass: Adapter }`. Hexagon ports therefore stay `InjectionToken` + `useClass`/providers-array wiring (pure token approach, no conflict with `@Service()`). Rule: app services → `@Service()` + field `inject()`; ports → `InjectionToken`; adapters → `@Injectable()`-style provider registration; consumption everywhere → `inject()` field initializers (never constructor param injection / `@Inject()` decorator for new code — supported but non-idiomatic). `@Service()` classes forbid constructor injection; use `@Service({ factory }) ` for env-dependent impl swaps.
```ts
// core/product.repository.ts (port)
export const PRODUCT_REPOSITORY = new InjectionToken<ProductRepository>('PRODUCT_REPOSITORY')
```
- **Adapter provision** (mirrors Vue `useWhiteLabelApp` composition): infra adapter classes from `@repo/infra` are pure TS (fetch-based, no framework) → wrap in provider factory or thin Angular service implementing the port interface:
```ts
export const infraProviders: EnvironmentProviders[] = [
  { provide: PRODUCT_REPOSITORY, useClass: InfraGetProductsAdapter }, // adapter implements port
]
```
  Check actual `@repo/infra` adapters (`GetProductsAdapter`) — pure functions/classes; a 5-line `useValue`/`useClass` adapter registration is enough. No DI framework knowledge leaks into packages.
- **Signals over RxJS** for view models (zoneless-sane, v22 signal-first): component does `vm = signal<ProductView[]>([])`, `await` infra via `inject(PRODUCT_REPOSITORY)` in an init fn, sets signal. Presenters (`@repo/presenters`) are pure sync fns → call directly, zero rxjs interop needed (rxjs stays as Angular core dep, unused by app code).
- Meta map (Vue `META_MAP_INJECTION_KEY`): equivalent `META_MAP = new InjectionToken<Record<string, Meta>>()` + `provide(META_MAP, opts.metaMap)` in factory.
- `bootstrapApplication(App, appConfig)` — golden path; `appConfig.providers` assembled by factory.

## Q4 — Angular vs existing factory/tenant pattern

**Answer: factory pattern IS feasible and should mirror `createWhiteLabelApp`. Angular does not require per-tenant Angular *projects* — tenants are separate bun workspace packages importing layer source via workspace dep + tsconfig paths.**

- White-label equivalent: `apps/white-label-angular` package.json exports `./app` → `./src/bootstrap/app.ts`, like white-label-vue's `"./app": "./src/bootstrap/app.ts"`.
- Factory API (parallel to `createWhiteLabelApp`):
```ts
// src/bootstrap/app.ts
export interface WhiteLabelAngularOptions {
  appShell?: Type<unknown>          // defaults to layered AppShell
  routes?: Routes                    // layer defaults
  extendRoutes?: (base: Routes) => Routes
  omitRoutePaths?: string[]
  metaMap?: Record<string, MetaData>
  providers?: EnvironmentProviders[] // tenant DI overrides
}
export async function createWhiteLabelApp(opts): Promise<ApplicationRef> {
  // setupMocks (MSW) → compose routes (merge/omit) → build ApplicationConfig:
  //   provideZonelessChangeDetection(), provideRouter(routes, withHashLocation()),
  //   provide(META_MAP, ...), provide(APP_SHELL, {useExisting: appShell}), infraProviders
  return bootstrapApplication(Shell, config)
}
```
- **Shell override** = component InjectionToken (`APP_SHELL`) resolved via `provide(APP_SHELL, { useExisting: TenantShell })`; factory bootstraps a tiny root that renders `<ng-container *ngComponentOutlet>`/direct component from token (or routes directly: Angular routes render components anyway — shell can be `AppShellComponent` as root with `<router-outlet>`, tenant swaps root via token).
- **Angular compiles workspace-package TS source — how:** Angular CLI does NOT compile/decorator-process `.ts` resolved through plain node_modules (expects ng-packagr-compiled libs + linker). Solution used by every Angular monorepo (Nx/Analog): **tsconfig `paths` mapping in `tsconfig.app.json`** so layer/package sources join the app's TS program → full AOT compilation as first-party code:
```json
"paths": {
  "@repo/domain": ["../../packages/domain/src/index.ts"],
  "@repo/infra": ["../../packages/infra/src/index.ts"],
  "@repo/infra/mocks/browser": ["../../packages/infra/src/mocks/browser.ts"],
  "@repo/infra/mocks/helpers": ["../../packages/infra/src/mocks/helpers.ts"],
  "@repo/presenters": ["../../packages/presenters/src/index.ts"],
  "@repo/ui/fe-button": ["../../packages/ui/components/fe-button/fe-button.ts"],
  "@repo/ui/styles": ["../../packages/ui/styles/webawesome.ts"],
  "@repo/ui/styles/themes/default": ["../../packages/ui/styles/themes/default.ts"],
  "white-label-angular/app": ["../../white-label-angular/src/bootstrap/app.ts"],
  "white-label-angular/src/*": ["../../white-label-angular/src/*"]
}
```
  (Each `@repo/ui/<x>` export maps to its concrete source file — exports targets live under `components/<x>/<x>.ts`, not `@repo/ui/<x>` path shape, so wildcard mapping is insufficient for ui subpaths.)
- Tenant proves the pattern: `apps/fake-plants-angular` deps `white-label-angular: workspace:*` + own paths → `createWhiteLabelApp({ routes: tenantRoutes, appShell: TenantShell, metaMap })`, tenant token overrides, tokens.css — same diff-file model as fake-plants-vue.
- **Angular workspace monorepo (single angular.json, many apps) vs per-app packages**: per-app **wins** here — matches existing repo layout, turbo per-package `^build` graph, bun workspaces, unrelated angular version bumps per app. Multi-app angular.json couples all apps to one CLI config and complicates turbo package discovery.

## Q5 — Risks / gotchas (repo-specific)

| # | Risk | Mitigation |
|---|---|---|
| R1 | **Root `overrides` hijacks Angular's Vite**: root package.json maps `vite → npm:@voidzero-dev/vite-plus-core@latest` and `vitest → ...vite-plus-test@latest`. `@angular/build@22.1.4` hard-depends `vite: 8.1.5` (exact) + peer `vitest ^4.0.8`. | **EMPIRICALLY RESOLVED (2026-08-14, probe `ng new` + `bun install` in /tmp):** the documented nested-override mitigation is INVALID — bun 1.3.14 warns `Bun currently does not support nested "overrides"` and ignores it. But it is UNNECESSARY: `vite → vite-plus-core@0.2.9` substitution works. vite-plus-core 0.2.9 exposes the full vite API (version string 8.2.1 — a vite 8 superset). Verified in probe: `ng build` ✔, `ng serve --port` ✔ (dev server boots). ONLY gap: `ng test` (unit-test builder) failed in the FRESH probe with `Cannot find native binding` because vite-plus-test@0.1.24 pins vite-plus-core@0.1.24 which needs platform pkg `@voidzero-dev/vite-plus-linux-x64-gnu@0.1.24`, absent in a fresh bun tree. Repo lockfile already carries gnu@0.1.24 (verified in repo `node_modules/.bun/`), so in-repo install resolves it. **Action: no override changes needed. After real scaffold install, first smoke test = `bunx ng test --watch=false`; if binding error recurs, run `bun install` at root again or add `@voidzero-dev/vite-plus-linux-x64-gnu@0.1.24` to the app devDeps.** |
| R2 | Angular CLI compiles `.ts` deps only via tsconfig paths (Q4). Without paths, `@repo/*` TS source in node_modules hits "not part of compilation"/missing decorator metadata. | Full paths mapping in `tsconfig.app.json` (Q4 table). `module: preserve` (v22 default) + `moduleResolution: bundler` handles exports. |
| R3 | CSS side-effect imports (`import '@repo/ui/styles'` → `@awesome.me/webawesome/dist/styles/*.css`) — Angular's esbuild handles `.css` imports from `.ts` but this is the least-traveled path in @angular/build. | Smoke-test early; fallback A: add CSS files directly to angular.json `styles` array (WA framework guide shows `"styles": ["src/styles.scss", "@awesome.me/webawesome/dist/styles/webawesome.css"]`); fallback B: `@import` in `src/styles.css`. Theme `default.css` + tokens.css same treatment. Theme class on `<html>` goes in `src/index.html` statically. |
| R4 | `@angular/build` output layout `dist/white-label-angular/browser/` (not `dist/` root) — turbo `outputs: ["dist/**"]` still matches (glob). BUT react/angular apps future + unscoped `lint`/`test` inputs → cross-contamination (existing README "Turborepo pipeline hardening" item). | Outside Phase-4 scope; note pending task: scope task inputs per package. |
| R5 | Angular CD budgets: initial 500kB warn / 1MB error (production default) — hybridJS (~10kB) + WA + Angular core ≈ fine, RxJS + router adds weight. If exceeded, raise budgets in angular.json `budgets`. | Adjust `budgets` in angular.json (documented override, not a hack). |
| R6 | **TS 6.0 requirement**: root already `typescript ^6.0.3` ✓, but app must pin `typescript: ~6.0.2`-style (peer `>=6.0 <6.1`) so bun hoists correctly; do not let app drift to 6.x.y beyond <6.1. | Pin in white-label-angular devDependencies. |
| R7 | `ng test` (vitest) needs `jsdom` + test config (`tsconfig.spec.json`, vitest via `@angular/build:unit-test`); MSW browser setup used by Vue apps must init before `TestBed` where infra is exercised. | Scaffold already generates spec tsconfig + jsdom; port MSW `setupMocks` into spec setup mirroring `vitest.setup.ts` of white-label-vue. |
| R8 | zone.js NOT present — any accidental reliance on zone-triggered CD (plain mutable props, non-signal) silently breaks under OnPush+zoneless. | Enforce signals for all view state; keep components OnPush-compatible; use `provideZonelessChangeDetection()` explicitly in shared factory config so base app is zoneless-deterministic even if CLI defaults change. |
| R9 | `bunx @angular/cli` inside bundle env: works (probe verified), but `ng` spawns `node` (v24.18 env ✓). Angular CLI install of deps during schematic runs `bun install` — always `--skip-install` so root bun owns lockfile (`bun.lock`). | See scaffold steps Q1; run `bun install` at repo root after adding workspace dep. |
| R10 | CUSTOM_ELEMENTS_SCHEMA kills template type-checking on fe-* tags (typos invisible). | Discipline + export interfaces for element types; keep fe-* usage minimal (wrap in Angular components like Vue does). |
| R11 | Angular major cadence (every 6 months, semver majors) — bun overrides + peer pins must track `ng update` (now also TS-major-coupled: v22 needs TS 6, v23 will need TS 7). | Schedule `ng update` in roadmap; keep white-label-angular deps minor-pinned, upgrade deliberately with repo. |

## Recommended approach (summary)

1. **Scaffold**: `bunx --bun=false @angular/cli@22 new white-label-angular --directory apps/white-label-angular --skip-install --package-manager bun --routing true --ssr false` → trim (.git, .vscode, .prettierrc, packageManager field) → add workspace deps (`@repo/domain|infra|presenters|ui`, later `white-label-angular` for tenants) → root `bun install`.
2. **CD model**: **zoneless** (default, no zone.js) + **signals** for all app state; `provideZonelessChangeDetection()` + `withHashLocation()` in factory config. OnPush default (v22) — code to it.
3. **Custom elements**: `CUSTOM_ELEMENTS_SCHEMA` per standalone component; `[prop]` bindings (properties, not attributes); native/`wa-*` events; type via re-exported `Fe*Element` interfaces.
4. **Build/test scripts**: `ng build` / `ng serve --port 4200` / `ng test --watch=false` (vitest builder); turbo.json untouched (`dist/**` + persistent dev already correct).
5. **Hexagonal**: `core/` InjectionToken ports → providers wiring `@repo/infra` adapters; pages/components consume ports via `inject()`; presenters stay pure.
6. **Factory/tenant**: `white-label-angular` exports `./app` (same shape as white-label-vue); tenant = workspace pkg + tsconfig paths → source; shell via `APP_SHELL` token; routes merge + `omitRoutePaths` in factory.
7. **First smoke tests** (order): R3 CSS import → R1 vite override scoping → R2 paths resolve → `bun run build` (turbo) → `bun run test`.

## Open questions / assumptions

- `@repo/ui/styles` CSS-import path in angular.json `styles` fallback TBD empirically (R3).
- hybridJS attr-vs-property edge: assumed property-bind-only (consistent with existing AGENTS guidance); verify with one fe-button e2e during 4.3.
- `provideElementRegistry` (experimental Element Registry API in some v20+ builds) not treated as path; CUSTOM_ELEMENTS_SCHEMA is the stable, documented route.
- Element naming resolved: **`white-label-angular`** chosen — matches `white-label-vue` layer-naming convention. Decision now made; doc updated accordingly.
- DI approach resolved (2026-08-14): `@Service()` + `inject()` for app services, `InjectionToken` + `useClass` for ports/adapters, per official v22 guidance (https://angular.dev/guide/di/creating-and-using-services#next-steps). No `@Inject()` ctor decorator for new code.

## Sources

Local:
- `.opencode/plans/core-foundation/phase-4.md`, `.opencode/plans/core-foundation/README.md`
- `.opencode/references/webawesome/SKILL.md`, `references/frameworks/angular.md`
- `.agents/skills/turborepo/SKILL.md`, `.agents/skills/bun/SKILL.md`
- repo `package.json` (overrides), `turbo.json`, `packages/*/package.json`, `apps/white-label-vue/{package.json,vite.config.base.ts,src/bootstrap/app.ts,src/main.ts,index.html}`

Web:
- Angular v22 release: https://github.com/angular/angular/releases/tag/v22.0.0
- Angular v21 announcement (zoneless default, vitest default): https://blog.angular.dev/announcing-angular-v21-57946c34f14b
- Ninja Squad "What's new in Angular 22": https://blog.ninja-squad.com/2026/06/03/what-is-new-angular-22.0
- Angular CLI bun support (v17.2): https://github.com/angular/angular-cli/releases/tag/17.2.0 ; `bun create @angular`: https://github.com/angular/angular-cli/commit/600498f2cd3e3251e7e6e3dd3505c5e943b2986a
- CUSTOM_ELEMENTS_SCHEMA per component: https://angular.dev/guide/components/advanced-configuration ; API: https://angular.dev/api/core/CUSTOM_ELEMENTS_SCHEMA
- `withHashLocation()` / `provideRouter` / `provideZonelessChangeDetection`: https://angular.dev/api/router/withHashLocation , https://angular.dev/api/router/provideRouter , https://angular.dev/api/core/provideZonelessChangeDetection
- `ng new` CLI ref (packageManager values): https://angular.dev/cli/new
- Turborepo `with-angular` example: https://github.com/vercel/turborepo/tree/main/examples/with-angular ; workspaces guide: https://turborepo.dev/docs/getting-started/add-to-existing-repository
- Angular elements (createCustomElement — reverse direction): https://angular.dev/guide/elements
- @angular/build deps/peers: `npm view @angular/build@latest` (vite 8.1.5, typescript >=6.0 <6.1, vitest ^4)
- Angular DI guide (recommends @Service() + inject()): https://angular.dev/guide/di/creating-and-using-services
- API refs: https://angular.dev/api/core/Service , https://angular.dev/api/core/inject , https://angular.dev/api/core/Inject
- @Service() stability + CLI default: https://blog.ninja-squad.com/2026/06/03/what-is-new-angular-22.0