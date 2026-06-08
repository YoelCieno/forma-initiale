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
├── turbo.json             # Turborepo pipeline (build, test, lint, dev)
│
├── apps/
│   ├── web-vue/           # Vue 3 SPA application
│   └── docs/              # Astro + Starlight docs site
│
├── packages/
│   ├── domain/            # Pure TS business models (@repo/domain)
│   ├── infra/             # Adapters implementing domain contracts (@repo/infra)
│   ├── ui/                # Framework-agnostic WC wrappers (@repo/ui)
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
        └── Product.ts       # Product interface {id, title, price}
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
│   ├── fe-button.ts         # <fe-button> custom element (hybridJS)
│   ├── fe-button.spec.ts    # CE unit tests (188 lines, full coverage)
│   ├── fe-card.ts           # <fe-card> WC subclass of WaCard (appearance, orientation, slots)
│   ├── fe-card.spec.ts      # CE unit tests (registration, props, slots)
│   ├── fe-icon.ts           # <fe-icon> hybridJS wrapper over <wa-icon> (name, library, animation, etc.)
│   ├── fe-icon.spec.ts      # CE unit tests (registration, property forwarding)
│   ├── fe-rating.ts         # <fe-rating> hybridJS wrapper over <wa-rating> (value, max, precision, etc.)
│   └── fe-rating.spec.ts    # CE unit tests (23 tests, 9 props, events)
│
└── styles/
    ├── webawesome.ts        # Imports WA base CSS (native + utilities, no theme)
    └── themes/
        ├── default.ts       # WA default theme (for web-vue)
        ├── awesome.ts       # WA awesome theme (for future web-angular)
        └── shoelace.ts      # WA shoelace theme (for future web-react)
```

---

## apps/web-vue

```
apps/web-vue/
├── package.json             # web-vue — Vue 3, vite, vue-router
├── tsconfig.json            # extends vite.json, strictNullChecks: true
├── vite.config.ts           # Vite plugins: vue, AutoImport, Components
├── vitest.config.ts         # Vitest: jsdom, setup, custom elements
├── vitest.setup.ts          # Mocks @repo/ui/fe-button, custom element config
├── .eslintrc.cjs            # Vue ESLint config
├── index.html               # SPA entry HTML (fe-theme-default class on html)
├── components.d.ts          # Auto-generated component type declarations

├── public/                  # Static assets

└── src/
    ├── main.ts              # App entry: createApp, router, WA base + theme + DS tokens; imports './styles'
    ├── App.vue              # Root SFC: nav + RouterView (uses --wa-* tokens)
    ├── styles/
    │   ├── index.ts         # Styles entry point, imports tokens.css + base.css
    │   ├── tokens.css       # DS token overrides (brand colors, typography, radius)
    │   └── base.css         # Base element styles (body, .h3, .subheading__h3)
    ├── router.ts            # Hash-based router (/, /components)
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
    │   ├── RatingContainer.vue      # Rating demos (value, readonly, disabled, precision, sizes)
    │   └── RatingContainer.spec.ts  # Tests for RatingContainer
    │
    ├── composables/
    │   ├── useProducts.ts        # Product data composable (ref, fetch, error)
    │   └── useProducts.spec.ts   # Composable tests (112 lines)
    │
    └── pages/
        ├── ProductsPage.vue      # Product list with loading/error states
        ├── ProductsPage.spec.ts  # Page component tests (65 lines)
        └── ComponentsPage.vue    # Component showcase hub (button, icon, rating, card)
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

| File | Purpose |
|------|---------|
| `turbo.json` | Pipeline: build (^build), test, lint, dev |
| `package.json` | Root workspace, scripts, hoisted devDeps |
| `bun.lock` | Deterministic dependency resolution |
| `.mise.toml` | Tool versioning (bun) |
| `.eslintrc.js` | Root ESLint (extends @repo/eslint-config) |
| `renovate.json` | Automated dep update schedule |
| `.gitignore` | dist, .turbo, node_modules, .env |
| `.npmrc` | npm settings |
