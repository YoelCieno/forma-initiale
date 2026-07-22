# File Map

> Directory structure, file purposes, and key files.

## Root

```
forma-initiale/
├── .eslintrc.js           # Root ESLint config (extends @repo/eslint-config)
├── .gitignore             # Git ignore rules
├── .mise.toml             # Mise tools config (bun = latest)
├── .npmrc                 # npm config
├── AGENTS.md              # Agent guide for AI coding assistants
├── README.md              # Project overview
├── bun.lock               # Bun lockfile
├── package.json           # Root workspace config, scripts, devDeps
├── renovate.json          # Renovate bot config
├── scripts/
├── turbo.json             # Turborepo pipeline (build, test, lint, dev)
│
├── apps/
│   ├── white-label-vue/   # Vue 3 SPA — layer base for tenant apps
│   ├── fake-plants-vue/   # Vue 3 tenant app — plants-themed store
│   └── docs/              # Astro + Starlight docs site
│
├── packages/
│   ├── domain/            # Pure TS business models (@repo/domain)
│   ├── infra/             # Adapters implementing domain contracts (@repo/infra)
│   ├── ui/                # Framework-agnostic WC wrappers (@repo/ui)
│   ├── generator/         # Pinion-based tenant code generator (@repo/generator)
│   ├── eslint-config/     # Shared ESLint 8 CJS config
│   └── typescript-config/ # Shared TS base configs
│
├── docs/
│   ├── CODEMAPS/          # Codebase maps (this directory)
│   ├── decisions/         # Architecture decision records
│   └── dependency-management.md  # Dep management strategy
│
└── node_modules/           # Dependencies (managed by bun workspaces)
```

---

## packages/domain

```
packages/domain/
├── package.json             # @repo/domain — pure TS, no deps
├── tsconfig.json            # extends base.json, lib: ES2022
│
└── src/
    ├── index.ts             # Barrel: re-exports Product type
    └── models/
        └── Product.ts       # Product interface {id, name, previousPrice, price, rate}
```

---

## packages/infra

```
packages/infra/
├── package.json             # @repo/infra — depends on @repo/domain
├── tsconfig.json            # extends base.json, lib: ES2022 + DOM
│
└── src/
    ├── index.ts             # Barrel: re-exports getProducts
    └── adapters/
        ├── get-products.adapter.ts      # fetch-based product adapter
        └── get-products.adapter.spec.ts # Unit tests (vitest)
```

---

## packages/ui

```
packages/ui/
├── package.json             # @repo/ui — hybrids, WA deps
├── tsconfig.json            # extends base.json, strictNullChecks: true
├── index.ts                 # Barrel: re-exports FeButton, FeButtonElement
├── css-modules.d.ts         # CSS module type declaration
├── vitest.config.ts         # Vitest: jsdom env
├── vitest.setup.ts          # ElementInternals polyfill for jsdom
│
├── components/
│   ├── fe-async-content.ts      # <fe-async-content> hybridJS CE for loading/error/content states
│   ├── fe-async-content.spec.ts # CE unit tests (7 tests, 3 states, slot overrides, transitions)
│   ├── fe-button.ts             # <fe-button> custom element (hybridJS)
│   ├── fe-button.spec.ts        # CE unit tests (188 lines, full coverage)
│   ├── fe-card.ts               # <fe-card> hybridJS CE forwarding to <wa-card> (appearance, orientation, disabled, slot detection)
│   ├── fe-card.spec.ts          # CE unit tests (registration, props, slots, header/footer/media detection)
│   ├── fe-icon.ts               # <fe-icon> hybridJS wrapper over <wa-icon> (name, library, animation, etc.)
│   ├── fe-icon.spec.ts          # CE unit tests (registration, property forwarding)
│   ├── fe-rating.ts             # <fe-rating> hybridJS wrapper over <wa-rating> (value, max, precision, etc.)
│   └── fe-rating.spec.ts        # CE unit tests (23 tests, 9 props, events)
│
└── styles/
    ├── webawesome.ts        # Imports WA base CSS (native + utilities, no theme)
    └── themes/
        ├── default.ts       # WA default theme (for white-label-vue)
        ├── awesome.ts       # WA awesome theme (for future web-angular)
        └── shoelace.ts      # WA shoelace theme (for future web-react)
```

---

## apps/white-label-vue

```
apps/white-label-vue/
├── package.json             # white-label-vue — Vue 3, vite, vue-router, exports ./app, ./vite.config.base
├── metadata.ts              # Product metadata overrides (frameworkMap with title, description, image)
├── tsconfig.json            # extends vite.json, strictNullChecks: true
├── vite.config.ts           # Thin: calls defineWhiteLabelViteConfig() from base
├── vite.config.base.ts      # Shared Vite config factory: Vue, AutoImport, Components — used by tenants
├── vitest.config.ts         # Vitest: jsdom, setup, custom elements
├── vitest.setup.ts          # Mocks @repo/ui/fe-button, custom element config
├── .eslintrc.cjs            # Vue ESLint config
├── index.html               # SPA entry HTML (fe-theme-default class on html)
├── components.d.ts          # Auto-generated component type declarations

├── public/                  # Static assets

└── src/
    ├── main.ts              # Entry: imports WA styles, calls createWhiteLabelApp({ routes })
    ├── bootstrap/           # Factory split: app.ts + init.ts (options, merge logic)
    ├── App.vue              # Root SFC: nav + RouterView (uses --wa-* tokens)
    ├── styles/
    │   ├── index.ts         # Styles entry point, imports tokens.css + base.css
    │   ├── tokens.css       # DS token overrides (brand colors, typography, radius)
    │   └── base.css         # Base element styles (body, .h3, .subheading__h3)
    ├── routes.ts            # Route definitions (/, /components)
    ├── vite-env.d.ts        # Vite client types, Vue module declaration
    ├── auto-imports.d.ts    # Auto-generated global type declarations
    │
    ├── components/
    │   ├── ButtonContainer.vue      # Button demos (variants, sizes, appearances, states)
    │   ├── ButtonContainer.spec.ts  # Tests for ButtonContainer
    │   ├── CardContainer.vue        # Card demos (appearances, slots, orientation)
    │   ├── CardContainer.spec.ts    # Tests for CardContainer
    │   ├── IconContainer.vue        # Icon demos (basic, animated, sizes)
    │   ├── IconContainer.spec.ts    # Tests for IconContainer
    │   ├── ProductCard.vue          # Product card with formatted pricing, logo, rating
    │   ├── ProductCard.spec.ts      # Tests for ProductCard
    │   ├── RatingContainer.vue      # Rating demos (value, readonly, disabled, precision, sizes)
    │   └── RatingContainer.spec.ts  # Tests for RatingContainer
    │
    ├── composables/
    │   ├── useProducts.ts        # Product data composable (uses @repo/presenters, @vueuse/core useAsyncState + useMemoize)
    │   └── useProducts.spec.ts   # Composable tests (loading, success, HTTP failure, manual fetch)
    │
    └── pages/
        ├── ProductsPage.vue      # Product grid with fe-async-content (loading/error/content states)
        ├── ProductsPage.spec.ts  # Page component tests (loading, success grid, error display)
        └── ComponentsPage.vue    # Component showcase hub (button, icon, rating, card)
```

### apps/fake-plants-vue

Vue 3 tenant app — plants-themed store. Uses createWhiteLabelApp() factory from white-label-vue (workspace dep, no `@repo` scope).

```
apps/fake-plants-vue/
├── package.json             # fake-plants-vue — depends on white-label-vue, domain, ui
├── metadata.ts              # Plant metadata mapping (plantsMap with 7 entries)
├── tsconfig.json            # extends vite.json
├── vite.config.ts           # Uses defineWhiteLabelViteConfig() from white-label-vue base
├── vitest.config.ts         # Vitest: jsdom, vue plugin, auto-import, components
├── vitest.setup.ts          # Custom element config for fe-* components
├── .eslintrc.cjs            # Vue ESLint config
├── index.html               # SPA entry HTML
├── metadata.ts              # Plant metadata mapping (name → {title, description, image})
├── .env                     # Environment variables
├── .env.example             # Env var template

└── src/
    ├── main.ts              # Entry: imports WA styles, calls createWhiteLabelApp({ routes })
    ├── App.vue              # Root SFC: nav + RouterView
    ├── App.spec.ts          # Tests for App.vue (RouterLink, RouterView)
    ├── auto-imports.d.ts    # Auto-generated global type declarations
    ├── components.d.ts      # Auto-generated component type declarations
    ├── vite-env.d.ts        # Vite client types
    │
    ├── components/
    │   └── ProductCard.vue          # Product card with formatted pricing, logo, rating
    │   └── ProductCard.spec.ts      # Tests for ProductCard (title, price, Free default, rating)
    │
    ├── pages/
    │   └── AboutPage.vue            # About page with fe-card
    │   └── AboutPage.spec.ts        # Tests for AboutPage (h1, fe-card, paragraph)
    │
    └── styles/
        ├── index.ts         # Styles entry
        ├── tokens.css       # DS token overrides (brand colors)
        └── base.css         # Base element styles
```

### Presenters — Extracted to `packages/presenters`

The presenter logic moved from `apps/white-label-vue/src/presenters/` to a dedicated package:

```
packages/presenters/
├── package.json             # @repo/presenters — depends on @repo/domain
├── tsconfig.json            # extends base.json
├── .eslintrc.cjs
│
└── src/
    ├── index.ts             # Barrel: re-exports toProductView, toProductViewList, ProductView
    ├── product.presenter.ts # ProductView mapping (Product → ProductView with framework metadata)
    └── product.presenter.spec.ts # Presenter tests
```

---

## apps/docs

```
apps/docs/
├── package.json             # docs — astro, starlight, sharp
├── tsconfig.json            # extends base.json
├── astro.config.mjs         # Starlight config, sidebar nav
│
├── dist/                    # Astro build output
│
└── src/
    └── content/
        ├── config.ts        # Content collection config
        │
        └── docs/
            ├── index.md     # Home page
            ├── guides/
            │   ├── architecture.md    # Architecture overview
            │   └── getting-started.md # Setup & dev guide
            └── reference/
                └── configuration.md   # Config reference
```

---

## packages/eslint-config

```
packages/eslint-config/
├── package.json             # @repo/eslint-config
├── index.js                 # Base config: TS parser, TS plugin, Prettier
└── vue.js                   # Vue 3 extension: + vue/recommended
```

---

## packages/typescript-config

```
packages/typescript-config/
├── package.json             # @repo/typescript-config
├── base.json                # Base: strict, ESNext, Bundler
└── vite.json                # Vite: extends base, noEmit, DOM lib
```

---

## docs/

```
docs/
├── CODEMAPS/
│   ├── ARCHITECTURE.md      # High-level system overview (this)
│   ├── MODULES.md           # Module descriptions & APIs (this)
│   └── FILES.md             # Directory structure (this)
│
├── decisions/
│   └── docs-solution.md     # ADR for documentation tooling choice
│
└── dependency-management.md # Strategies: taze + Renovate
```

---

## Config Files Summary

| File            | Purpose                                   |
| --------------- | ----------------------------------------- |
| `turbo.json`    | Pipeline: build (^build), test, lint, dev |
| `package.json`  | Root workspace, scripts, hoisted devDeps  |
| `bun.lock`      | Deterministic dependency resolution       |
| `.mise.toml`    | Tool versioning (bun)                     |
| `.eslintrc.js`  | Root ESLint (extends @repo/eslint-config) |
| `renovate.json` | Automated dep update schedule             |
| `.gitignore`    | dist, .turbo, node_modules, .env          |
| `.npmrc`        | npm settings                              |

---

## packages/generator

```
packages/generator/
├── package.json             # @repo/generator — pinion, inquirer deps
├── tsconfig.json            # extends base.json
├── vitest.config.ts         # Vitest config
├── .eslintrc.cjs            # ESLint config
│
└── src/
    ├── index.ts             # Barrel: exports generate, validateHex, getThemeClass, types
    │
    ├── generators/
    │   ├── vue-tenant.tpl.ts      # Pinion generator: renderSetup, renderSourceFiles,
    │   │                           # renderConditionalAssets, renderTestInfra, mswRegistration
    │   └── vue-tenant.tpl.spec.ts # Orchestration tests
    │
    ├── helpers/
    │   ├── cases.ts              # Kebab/Pascal/Camel case transforms + prefix derivation
    │   ├── cases.spec.ts         # Case transform tests
    │   ├── palette.ts            # Hex validation + theme class helper
    │   └── palette.spec.ts       # Palette tests
    │
    ├── models/
    │   └── index.ts              # VueTenantContext + Theme type definitions
    │
    ├── msw/
    │   ├── add-tenant.ts             # addTenantConfig() — validates + appends MSW tenant entry
    │   ├── add-tenant.spec.ts        # MSW config tests
    │   ├── file-io.ts                # readMockedData, writeMockedData, copyMswWorker utilities
    │   ├── file-io.spec.ts           # File I/O tests
    │   └── register-tenant.ts        # CLI for MSW tenant registration (moved from scripts/)
    │
    ├── prompts/
    │   ├── index.ts              # Interactive prompts (name, description, theme, metadata, MSW)
    │   └── index.spec.ts         # Prompt shape tests
    │
    └── templates/
        ├── index.ts              # All output templates (package.json, vite.config, main.ts, etc.)
        └── index.spec.ts         # Template rendering tests
```
