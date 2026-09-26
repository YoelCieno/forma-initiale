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
│   ├── white-label-vue/    # Vue 3 SPA — layer base for tenant apps
│   ├── white-label-angular/# Angular 22 SPA — layer base for Angular tenants
│   ├── fake-plants-vue/    # Vue 3 tenant app — plants-themed store
│   └── docs/              # Astro + Starlight docs site
│
├── packages/
│   ├── domain/            # Pure TS business models (@repo/domain)
│   ├── infra/             # Adapters implementing domain contracts (@repo/infra)
│   ├── ui/                # Framework-agnostic WC wrappers (@repo/ui)
│   ├── utils/             # Shared utilities (@repo/utils)
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
    ├── index.ts             # Barrel: re-exports Product, TenantConfig, helpers
    ├── entities/
    │   ├── Product.ts       # Product interface {id, name, previousPrice, price, rate}
    │   ├── tenant.ts        # TenantConfig, TenantId, PriceConfig types
    │   └── tenant.spec.ts   # Tenant entity tests
    ├── helpers/
    │   ├── tenant.ts        # isValidTenant type guard
    │   ├── tenant.spec.ts   # Tenant helper tests
    │   ├── theme.ts         # theme() factory (getThemeClass, getThemeTokens)
    │   └── theme.spec.ts    # Theme helper tests
    └── ports/
        └── get-products.ts  # GetProductsFn port contract
```

---

## packages/infra

```
packages/infra/
├── package.json             # @repo/infra — depends on @repo/domain
├── tsconfig.json            # extends base.json, lib: ES2022 + DOM
│
└── src/
    ├── index.ts             # Barrel: exports getProducts, getProductImageUrl, frameworkMap, mockOkResponse
    ├── adapters/
    │   ├── get-products.adapter.ts      # fetch-based product adapter
    │   ├── get-products.adapter.spec.ts # Unit tests (vitest)
    │   ├── get-product-image.adapter.ts # deterministic product image URL helper
    │   └── get-product-image.adapter.spec.ts # Unit tests (vitest)
    └── mocks/
        ├── index.ts              # Barrel: exports server, worker, handlers, factories
        ├── server.ts             # MSW Node server (tests)
        ├── browser.ts            # MSW browser worker (dev)
        └── helpers/
             # mockOkResponse, delayDev (DEV_DELAY, gated in test mode)
        ├── data/mocked-data.json # tenant name/config seed data
        ├── constants/index.ts    # tenant configs, name pools, RATE_VALUE, DEV_DELAY
        ├── factories/product.ts  # tenant-aware deterministic product factories
        └── handlers/
            ├── products.ts              # product MSW handlers
            ├── products.spec.ts         # handler tests
            ├── products.test-delay.spec.ts # dev-delay gate tests (vitest)
            └── index.ts                 # handler barrel
```

---

## packages/ui

```
packages/ui/
├── package.json             # @repo/ui — hybrids, WA deps
├── tsconfig.json            # extends base.json, strictNullChecks: true
├── css-modules.d.ts         # CSS module type declaration
├── vitest.config.ts         # Vitest: jsdom env
├── vitest.setup.ts          # ElementInternals polyfill for jsdom (legacy; real Set states)
│
├── components/
│   ├── fe-async-content/
│   │   ├── fe-async-content.ts      # <fe-async-content> hybridJS CE for loading/error/content states
│   │   └── fe-async-content.spec.ts # CE unit tests (7 tests, 3 states, slot overrides, transitions)
│   ├── fe-button/
│   │   ├── fe-button.ts             # <fe-button> custom element (hybridJS)
│   │   └── fe-button.spec.ts        # CE unit tests (188 lines, full coverage)
│   ├── fe-card/
│   │   ├── fe-card.ts               # <fe-card> hybridJS CE forwarding to <wa-card> (appearance, orientation, disabled, slot detection)
│   │   └── fe-card.spec.ts          # CE unit tests (registration, props, slots, header/footer/media detection)
│   ├── fe-icon/
│   │   ├── fe-icon.ts               # <fe-icon> hybridJS wrapper over <wa-icon> (name, library, animation, etc.)
│   │   └── fe-icon.spec.ts          # CE unit tests (registration, property forwarding)
│   ├── fe-img/
│   │   ├── fe-img.ts                # <fe-img> wrapper over native <img> (cache dedup, fallback)
│   │   ├── fe-img.constants.ts      # Fallback SVG + in-memory CACHE map
│   │   └── fe-img.spec.ts           # CE unit tests (src loading state, error fallback, attribute reflection)
│   ├── fe-loader/
│   │   ├── fe-loader.ts             # <fe-loader> indeterminate loading bar (size sm/md/lg, reduced-motion aware)
│   │   └── fe-loader.spec.ts        # CE unit tests
│   └── fe-rating/
│       ├── fe-rating.ts             # <fe-rating> hybridJS wrapper over <wa-rating> (value, max, precision, etc.)
│       └── fe-rating.spec.ts        # CE unit tests (23 tests, 9 props, events)
│
└── styles/
    ├── main.css             # WA base CSS (native.css only — no utilities, no theme)
    └── themes/
        ├── default.css      # WA default theme (for white-label-vue)
        ├── awesome.css      # WA awesome theme (for white-label-angular)
        └── shoelace.css     # WA shoelace theme (for future web-react)
```

---

## packages/presenters

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

## packages/utils

```
packages/utils/
├── package.json             # @repo/utils — pure TS, no runtime deps
├── tsconfig.json            # extends base.json
├── .eslintrc.cjs            # ESLint config
│
└── src/
    ├── type-guards.ts       # isObject, isString, isNumber, isBoolean
    ├── type-guards.spec.ts  # Type guard tests
    ├── string.ts            # toKebabCase, toPascalCase, toCamelCase
    ├── string.spec.ts       # String transform tests
    ├── object.ts            # deepMerge, pick
    ├── object.spec.ts       # Object utility tests
    ├── validate.ts          # validateHex, validateUrl
    ├── validate.spec.ts     # Validator tests
    ├── css.ts               # CSS utility helpers
    ├── css.spec.ts          # CSS utility tests
    ├── error.ts             # getErrorMessage
    └── error.spec.ts        # Error helper tests
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

---

## apps/white-label-vue

```
apps/white-label-vue/
├── package.json             # white-label-vue — Vue 3, vite, vue-router, exports ./app, ./vite.config.base
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
        ├── ProductsPage.vue      # Product grid with fe-async-content (fe-loader loading / error / content states)
        ├── ProductsPage.spec.ts  # Page component tests (loading, success grid, error display)
        └── ComponentsPage.vue    # Component showcase hub (button, icon, rating, card)
```

---

## apps/fake-plants-vue

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

---

## apps/white-label-angular

```
apps/white-label-angular/
├── package.json             # white-label-angular — Angular 22, zoneless
├── tsconfig.json            # Angular TS config
├── angular.json             # Angular CLI workspace config (serve.options.prebundle: false)
├── index.html               # SPA entry HTML
│
└── src/
    ├── main.ts              # Entry: imports WA styles, bootstrap
    ├── index.html           # HTML shell
    ├── app/                 # Root app component
    ├── bootstrap/
    │   ├── init.ts          # Factory: createWhiteLabelApp() + merge logic
    │   └── init.spec.ts     # Factory tests
    ├── components/
    │   ├── button-container.component.ts      # Button demos (fe-button)
    │   ├── button-container.component.spec.ts # Tests
    │   ├── card-container.component.ts        # Card demos (fe-card)
    │   ├── card-container.component.spec.ts   # Tests
    │   ├── icon-container.component.ts        # Icon demos (fe-icon)
    │   ├── icon-container.component.spec.ts   # Tests
    │   ├── rating-container.component.ts      # Rating demos (fe-rating)
    │   ├── rating-container.component.spec.ts # Tests
    │   ├── product-card.component.ts          # Product card (fe-card + fe-icon + fe-rating)
    │   ├── product-card.component.spec.ts     # Tests
    │   └── fe-property-shim.directive.spec.ts # Property shim directive tests
    ├── environments/
    │   ├── environment.ts          # Production config
    │   └── environment.development.ts # Dev config
    ├── pages/
    │   ├── products-page.component.ts      # Products page (fe-async-content)
    │   ├── products-page.component.spec.ts # Tests
    │   └── components-page.component.ts    # Components showcase page
    ├── services/
    │   ├── products.service.ts     # Angular resource() signal-based data service
    │   └── products.service.spec.ts # Service tests
    ├── styles/
    │   ├── tokens.css       # DS token overrides
    │   └── themes/          # WA theme CSS
    ├── utils/
    │   └── type-guards.ts   # Angular-specific type guards
    └── test-setup.ts        # ElementInternals FACE shim for jsdom
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
