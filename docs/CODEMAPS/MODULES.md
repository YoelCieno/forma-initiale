# Module Map

> Module descriptions, public APIs, and dependency relationships.

---

## @repo/domain

**Purpose**: Pure TypeScript business models and domain interfaces. Zero framework dependencies.

**Location**: `packages/domain/src/`

**Key Files**:

- `index.ts` — Barrel exports
- `models/Product.ts` — Product domain model

**Dependencies**: None (pure TS)

**Exports**:

- `Product` (type) — `{ id: string; name: string; previousPrice: number; price: number; rate: number }`

**Usage**:

```typescript
import type { Product } from '@repo/domain'
```

---

## @repo/infra

**Purpose**: Adapters implementing domain contracts. HTTP clients, DTOs, external API calls.

**Location**: `packages/infra/src/`

**Key Files**:

- `index.ts` — Barrel exports
- `adapters/get-products.adapter.ts` — Fetch-based product retrieval
- `adapters/get-products.adapter.spec.ts` — Tests

**Dependencies**:

- `@repo/domain` (Product type)

**Exports**:

- `getProducts()` — `() => Promise<GetProductsResponse>` — Fetches products from `https://api.example.com/products`
- `GetProductsResponse` (type) — `{ data: Product[], total: number }`

**Usage**:

```typescript
import { getProducts } from '@repo/infra'
const products = await getProducts()
```

---

## @repo/ui

**Purpose**: Framework-agnostic Web Component wrappers using HybridJS. `<fe-*>` elements internally compose `<wa-*>` (WebAwesome) components.

**Location**: `packages/ui/`

**Key Files**:

- `index.ts` — Barrel exports (FeButton, FeButtonElement type)
- `components/fe-async-content.ts` — `<fe-async-content>` hybridJS CE for loading/error/content states
- `components/fe-async-content.spec.ts` — Tests (7 tests, 3 states, slot overrides, transitions)
- `components/fe-button.ts` — `<fe-button>` custom element definition (hybridJS)
- `components/fe-button.spec.ts` — Tests
- `components/fe-card.ts` — `<fe-card>` hybridJS CE forwarding to `<wa-card>` (appearance, orientation, disabled, slot content detection)
- `components/fe-card.spec.ts` — Tests (slot detection, appearance, orientation, header/footer/media forwarding)
- `components/fe-icon.ts` — `<fe-icon>` hybridJS wrapper over `<wa-icon>`
- `components/fe-icon.spec.ts` — Tests
- `components/fe-rating.ts` — `<fe-rating>` hybridJS wrapper over `<wa-rating>`
- `components/fe-rating.spec.ts` — Tests (23 tests, 9 props, events)
- `styles/webawesome.ts` — WA base CSS (native.css + utilities.css, no theme)
- `styles/themes/default.ts` — WA default theme (for white-label-vue)
- `styles/themes/awesome.ts` — WA awesome theme (for future web-angular)
- `styles/themes/shoelace.ts` — WA shoelace theme (for future web-react)
- `vitest.config.ts` — Vitest config for UI
- `vitest.setup.ts` — ElementInternals stub for jsdom

**Package Exports**:

- `@repo/ui/fe-async-content` → `./components/fe-async-content.ts`
- `@repo/ui/fe-button` → `./components/fe-button.ts`
- `@repo/ui/fe-card` → `./components/fe-card.ts`
- `@repo/ui/fe-icon` → `./components/fe-icon.ts`
- `@repo/ui/fe-rating` → `./components/fe-rating.ts`
- `@repo/ui/styles` → `./styles/webawesome.ts`
- `@repo/ui/styles/themes/default` → `./styles/themes/default.ts`
- `@repo/ui/styles/themes/awesome` → `./styles/themes/awesome.ts`
- `@repo/ui/styles/themes/shoelace` → `./styles/themes/shoelace.ts`

**Dependencies**:

- `hybrids` (^9) — Web Component library (define, html)
- `@awesome.me/webawesome` (3.7.0) — Design system components

**Custom Elements**:

### `<fe-button>`

**Interface**: `FeButtonElement extends HTMLElement`

| Property     | Type      | Default     | Description                              |
| ------------ | --------- | ----------- | ---------------------------------------- |
| `variant`    | `string`  | `'neutral'` | neutral, brand, success, warning, danger |
| `size`       | `string`  | `'m'`       | xs, s, m, l, xl                          |
| `appearance` | `string`  | `'filled'`  | accent, filled, outlined, plain          |
| `icon`       | `string`  | `''`        | WA icon name (empty = no icon)           |
| `disabled`   | `boolean` | `false`     | Disabled state                           |
| `loading`    | `boolean` | `false`     | Loading spinner                          |
| `pill`       | `boolean` | `false`     | Pill shape                               |

**Shadow DOM**: `<wa-button>` with optional `<wa-icon>` and `<slot>`.

**Usage**:

```html
<fe-button variant="brand" size="l" @click="handler">Click</fe-button>
```

**Import**:

```typescript
import '@repo/ui/fe-button'
import type { FeButtonElement } from '@repo/ui/fe-button'
```

### `<fe-async-content>`

**Interface**: `FeAsyncContentElement extends HTMLElement`

| Property  | Type                  | Default     | Description                     |
| --------- | --------------------- | ----------- | ------------------------------- |
| `loading` | `boolean`             | `false`     | Show loading state (wa-spinner) |
| `error`   | `string \| undefined` | `undefined` | Error message to display        |

**Implementation**: hybridJS `define()` with 3-state render (loading → error → default). Each state has a named slot for override. Default loading shows `<wa-spinner>` + "Loading..." text. Default error shows error string. Default content passes through `<slot>`.

**Slots**: `loading` (override loading UI), `error` (override error UI), default (content when idle).

**States**:
| `loading` | `error` | Rendered |
|-----------|---------|----------|
| `false` | `undefined` | Default `<slot>` content |
| `true` | _any_ | Loading slot (default: wa-spinner) |
| `false` | `string` | Error slot (default: error text) |

**Usage**:

```html
<fe-async-content :loading="loading" :error="error">
  <p slot="loading">Custom loading...</p>
  <p slot="error" class="error">{{ error }}</p>
  <div>Main content when loaded</div>
</fe-async-content>
```

**Import**:

```typescript
import '@repo/ui/fe-async-content'
import type { FeAsyncContentElement } from '@repo/ui/fe-async-content'
```

### `<fe-card>`

**Interface**: `FeCardElement extends HTMLElement`

| Property      | Type      | Default      | Description                                      |
| ------------- | --------- | ------------ | ------------------------------------------------ |
| `appearance`  | `string`  | `'filled'`   | accent, filled, outlined, filled-outlined, plain |
| `orientation` | `string`  | `'vertical'` | horizontal, vertical                             |
| `disabled`    | `boolean` | `false`      | Disabled visual state (opacity + inert)          |

**Implementation**: hybridJS `define()` forwarding to `<wa-card>`. Detect slots (header/footer/media) before render to conditionally render slot elements. `disabled` sets `inert` attribute + opacity 0.5.

**Slots**: `header`, `footer`, `media`, `actions`.

**Shadow DOM**: `<wa-card>` with conditional slot forwarding.

**Usage**:

```html
<fe-card appearance="outlined">
  <span slot="header">Title</span>
  <p>Body content</p>
</fe-card>
```

**Import**:

```typescript
import '@repo/ui/fe-card'
import type { FeCardElement } from '@repo/ui/fe-card'
```

### `<fe-icon>`

**Interface**: `FeIconElement extends HTMLElement`

| Property      | Type                  | Default     | Description                           |
| ------------- | --------------------- | ----------- | ------------------------------------- |
| `name`        | `string \| undefined` | `undefined` | WA icon name                          |
| `library`     | `string`              | `'default'` | Icon library                          |
| `family`      | `string`              | `'classic'` | Icon family                           |
| `variant`     | `string \| undefined` | `undefined` | Icon variant                          |
| `label`       | `string`              | `''`        | Accessible label                      |
| `autoWidth`   | `boolean`             | `false`     | Auto-width                            |
| `flip`        | `string \| undefined` | `undefined` | Flip direction                        |
| `rotate`      | `number`              | `0`         | Rotation degrees                      |
| `animation`   | `string \| undefined` | `undefined` | Animation (spin, pulse, bounce, ping) |
| `src`         | `string \| undefined` | `undefined` | Custom icon source                    |
| `swapOpacity` | `boolean`             | `false`     | Swap opacity                          |

**Implementation**: hybridJS `define()` forwarding to `<wa-icon>`. Shadow DOM.

**Usage**:

```html
<fe-icon name="home"></fe-icon>
<fe-icon name="spinner" animation="spin"></fe-icon>
```

**Import**:

```typescript
import '@repo/ui/fe-icon'
import type { FeIconElement } from '@repo/ui/fe-icon'
```

### `<fe-rating>`

**Interface**: `FeRatingElement extends HTMLElement`

| Property    | Type                  | Default     | Description                         |
| ----------- | --------------------- | ----------- | ----------------------------------- |
| `value`     | `number`              | `0`         | Rating value                        |
| `max`       | `number`              | `5`         | Maximum stars                       |
| `precision` | `number`              | `1`         | Step precision (0.5 for half-stars) |
| `size`      | `string`              | `'m'`       | xs, s, m, l, xl                     |
| `label`     | `string`              | `''`        | Accessible label                    |
| `disabled`  | `boolean`             | `false`     | Disabled state                      |
| `readonly`  | `boolean`             | `false`     | Readonly state                      |
| `required`  | `boolean`             | `false`     | Required for forms                  |
| `name`      | `string \| undefined` | `undefined` | Form field name                     |

**Implementation**: hybridJS `define()` forwarding to `<wa-rating>`. Shadow DOM.

**Usage**:

```html
<fe-rating value="3" max="5" precision="0.5"></fe-rating>
<fe-rating :value="product.rate" readonly></fe-rating>
```

**Import**:

```typescript
import '@repo/ui/fe-rating'
import type { FeRatingElement } from '@repo/ui/fe-rating'
```

---

## @repo/eslint-config

**Purpose**: Shared ESLint 8 configuration (CJS format).

**Location**: `packages/eslint-config/`

**Key Files**:

- `index.js` — Base config (TS parser, TS plugin, Prettier)
- `vue.js` — Vue 3 extension (extends index.js + vue/recommended)

**Dependencies**:

- `@typescript-eslint/eslint-plugin` (^7.1.0)
- `@typescript-eslint/parser` (^7.1.0)
- `eslint-config-prettier` (^9.1.0)

**Exports**:

- `@repo/eslint-config/index.js` — Base TS config
- `@repo/eslint-config/vue.js` — Vue 3 + TS config

**Usage** (`.eslintrc.cjs`):

```js
module.exports = {
  root: true,
  extends: ['@repo/eslint-config/index.js'],
}
```

---

## @repo/presenters

**Purpose**: Pure TS view-model transformers. Converts domain models into UI-ready shapes with metadata.

**Location**: `packages/presenters/src/`

**Key Files**:

- `index.ts` — Barrel exports
- `product.presenter.ts` — ProductView mapping: Product → ProductView with framework name/description/logo
- `product.presenter.spec.ts` — Presenter tests (6 framework maps, edge cases, list mapping)

**Dependencies**:

- `@repo/domain` (Product type)

**Exports**:

- `ProductView` (type) — `{ name, title, description, image, imageFamily, previousPrice?, price, rate }`
- `ProductMeta` (type) — `{ title, description, image, imageFamily }`
- `toProductView(product: Product, metaMap?: Record<string, ProductMeta>): ProductView`
- `toProductViewList(products: Product[], metaMap?: Record<string, ProductMeta>): ProductView[]`

**Usage**:

```typescript
import { toProductViewList } from '@repo/presenters'
import type { ProductView, ProductMeta } from '@repo/presenters'
const views = toProductViewList(products, metaMap)
```

---

## @repo/typescript-config

**Purpose**: Shared TypeScript base configurations.

**Location**: `packages/typescript-config/`

**Key Files**:

- `base.json` — Strict TS, ES module, Bundler resolution
- `vite.json` — Extends base.json, adds Vite-optimized settings

**Settings Highlights**:

| Setting              | base.json | vite.json   |
| -------------------- | --------- | ----------- |
| `strict`             | true      | true        |
| `moduleResolution`   | Bundler   | Bundler     |
| `noEmit`             | false     | true        |
| `lib`                | —         | ESNext, DOM |
| `noUnusedLocals`     | false     | true        |
| `noUnusedParameters` | false     | true        |

**Usage**:

```json
{
  "extends": "@repo/typescript-config/vite.json"
}
```

---

## white-label-vue

**Purpose**: Vue 3 SPA — layer base for tenant apps. Exports factory functions and shared config for tenant reuse.

**Location**: `apps/white-label-vue/`

**Build**: `vp dev` / `vp build` (Vite+ CLI)

**Key Files**:

- `metadata.ts` — Per-product metadata overrides keyed by product name (frameworkMap)
- `src/main.ts` — App entry: imports WA styles, calls `createWhiteLabelApp({ routes, metaMap })`.mount('#app')
- `src/app.ts` — Factory: `createWhiteLabelApp(opts)` bootstraps Vue app, router, MSW. Supports `routes`, optional `appShell`, and `metaMap`
- `src/styles/index.ts` — Styles entry point, imports `tokens.css` + `base.css`
- `src/styles/tokens.css` — Design system token overrides (`--wa-*` vars)
- `src/styles/base.css` — Base element styles (body, `.h3`, `.subheading__h3`); h2 italic, card BEM classes
- `src/App.vue` — Root component (nav + RouterView)
- `src/routes.ts` — Route definitions (/, /components) — exported for tenant merge
- `src/components/ButtonContainer.vue` — Button demos (variants, sizes, appearances, states) wrapped in fe-card sections
- `src/components/CardContainer.vue` — Card demos (appearances, slots, header/footer, orientation)
- `src/components/IconContainer.vue` — Icon demos (basic icons, animated, size variants) wrapped in fe-card
- `src/components/RatingContainer.vue` — Rating demos (value, readonly, disabled, precision, sizes) wrapped in fe-card
- `src/composables/useProducts.ts` — Product data composable (uses `@repo/presenters`, `@vueuse/core useAsyncState`)
- `src/pages/ProductsPage.vue` — Product grid with fe-async-content (loading/error/content states)
- `src/pages/ComponentsPage.vue` — Component showcase hub (uses ButtonContainer, CardContainer, IconContainer, RatingContainer)
- `vite.config.ts` — Thin: calls `defineWhiteLabelViteConfig()` from base
- `vite.config.base.ts` — Shared Vite config factory: Vue + AutoImport + Components with mergeable dirs
- `vitest.config.ts` — Test config (Components plugin with `dts: './src/components.d.ts'`)

**Package exports** (for tenant apps):

- `white-label-vue/app` → `./src/app.ts` — exports:
  - `createWhiteLabelApp(opts: WhiteLabelAppOptions): Promise<WhiteLabelApp>` — bootstraps Vue app, hash router, MSW
  - `WhiteLabelAppOptions` — `{ routes: RouteRecordRaw[], appShell?: () => Promise<...>, metaMap?: Record<string, ProductMeta> }`
  - `WhiteLabelApp` — `{ app, router }`
- `white-label-vue/vite.config.base` → `./vite.config.base.ts` — exports:
  - `defineWhiteLabelViteConfig(opts: WhiteLabelViteOptions): UserConfig` — pre-configured Vite config (Vue plugin, AutoImport, Components)
  - `WhiteLabelViteOptions` — `{ componentDirs?: string[], autoImportDirs?: string[] }`
- `white-label-vue/src/*` → `./src/*` (components/pages for lazy import in tenant routes)

**Dependencies**:

- `@repo/domain` — Product type
- `@repo/infra` — getProducts adapter
- `@repo/presenters` — toProductViewList, ProductView type
- `@repo/ui` — fe-button, fe-async-content, fe-card, fe-icon, fe-rating, WA styles
- `@vueuse/core` (^14.3.0) — useAsyncState for composable async state management
- `vue` (^3.5.0)
- `vue-router` (^4)

**Auto-imports** (via unplugin-auto-import):

- All Vue Composition API (`ref`, `computed`, `onMounted`, etc.)
- All vue-router (`useRouter`, `useRoute`, `RouterLink`)
- Local composables: `useProducts`

**Routes**:

| Path          | Page           | Description                                                                                          |
| ------------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| `/`           | ProductsPage   | Product grid with fe-async-content (loading/error/content), fe-card per product, fe-rating + pricing |
| `/components` | ComponentsPage | Component showcase hub (button, card, icon, rating) — lazy-loaded                                    |

---

## fake-plants-vue

**Purpose**: Vue 3 tenant app — plants-themed store. Consumes white-label-vue factory and extends with plant-specific pages.

**Location**: `apps/fake-plants-vue/`

**Build**: `vp dev` / `vp build` (Vite+ CLI)

**Key Files**:

- `src/main.ts` — Entry: imports WA styles + white-label styles, calls `createWhiteLabelApp({ routes, appShell, metaMap })`
- `src/App.vue` — Root SFC (nav: RouterLink / → ProductsPage, /about → AboutPage + RouterView)
- `src/App.spec.ts` — Tests (RouterLink routes, RouterView)
- `src/components/ProductCard.vue` — Product card with formatted pricing, logo, rating
- `src/components/ProductCard.spec.ts` — Tests (title, description, price, Free default, previousPrice, rating)
- `src/pages/AboutPage.vue` — About page with fe-card
- `src/pages/AboutPage.spec.ts` — Tests (h1, fe-card, paragraph content)
- `metadata.ts` — Plant metadata: plantsMap with 7 entries
- `vitest.config.ts` — Test config (vue plugin, jsdom)
- `vitest.setup.ts` — Custom element config for fe-\* components

**Test Count**: 13 tests across 3 files (App: 3, ProductCard: 7, AboutPage: 3)

**Dependencies**:

- `white-label-vue` — Factory (createWhiteLabelApp, defineWhiteLabelViteConfig)
- `@repo/domain` — Product type
- `@repo/infra` — getProducts adapter
- `@repo/presenters` — toProductViewList, ProductView type
- `@repo/ui` — fe-card, fe-rating, WA styles
- `vue` (^3.5.0)
- `vue-router` (^4)

**Routes**:

| Path     | Page         | Description                                          |
| -------- | ------------ | ---------------------------------------------------- |
| `/`      | ProductsPage | Product grid (inherited from white-label-vue)        |
| `/about` | AboutPage    | About this store — fe-card with platform description |

---

## docs

**Purpose**: Documentation site built with Astro + Starlight.

**Location**: `apps/docs/`

**Build**: `astro dev` / `astro build`

**Key Files**:

- `astro.config.mjs` — Starlight config, sidebar nav
- `src/content/docs/index.md` — Home page
- `src/content/docs/guides/architecture.md` — Architecture guide
- `src/content/docs/guides/getting-started.md` — Getting started guide
- `src/content/docs/reference/configuration.md` — Config reference

**Dependencies**:

- `@astrojs/starlight` (^0.32.0)
- `astro` (^5.6.0)
- `sharp` (^0.33.0) — Image processing
