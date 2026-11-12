# Module Map

> Module descriptions, public APIs, and dependency relationships.

---

## @repo/domain

**Purpose**: Pure TypeScript business models and domain interfaces. Zero framework dependencies.

**Location**: `packages/domain/src/`

**Key Files**:

- `index.ts` — Barrel exports
- `entities/Product.ts` — Product domain model
- `entities/tenant.ts` — TenantConfig, TenantId, PriceConfig types
- `helpers/tenant.ts` — isValidTenant type guard
- `helpers/theme.ts` — theme() factory (getThemeClass, getThemeTokens)
- `ports/get-products.ts` — GetProductsFn port

**Dependencies**: None (pure TS)

**Exports**:

- `Product` (type) — `{ id: string; name: string; previousPrice: number; price: number; rate: number }`
- `TenantConfig`, `TenantId`, `PriceConfig` (types) — Tenant configuration
- `isValidTenant(value, validIds)` — Type guard
- `theme()` — Factory returning `getThemeClass`, `getThemeTokens`
- `GetProductsFn`, `GetProductsResponse` (types) — Port contract

**Usage**:

```typescript
import type { Product, TenantConfig, TenantId } from '@repo/domain'
import { isValidTenant, theme } from '@repo/domain'
```

---

## @repo/infra

**Purpose**: Adapters implementing domain contracts. HTTP clients, DTOs, external API calls.

**Location**: `packages/infra/src/`

**Key Files**:

- `index.ts` — Barrel exports
- `adapters/get-products.adapter.ts` — Fetch-based product retrieval
- `adapters/get-products.adapter.spec.ts` — Tests
- `adapters/get-product-image.adapter.ts` — Deterministic product image URL helper
- `adapters/get-product-image.adapter.spec.ts` — Tests
- `mocks/` — MSW handlers, factories, server/worker, helpers, constants, models

**Dependencies**:

- `@repo/domain` (Product type)

**Exports**:

- `getProducts()` — `() => Promise<GetProductsResponse>` — Fetches products from `https://api.example.com/products`
- `GetProductsResponse` (type) — `{ data: Product[], total: number }`
- `getProductImageUrl(productId)` — `(string) => string` — Deterministic image URL for a product id

**Usage**:

```typescript
import { getProducts, getProductImageUrl } from '@repo/infra'
const products = await getProducts()
const img = getProductImageUrl(product.id)
```

---

## @repo/ui

**Purpose**: Framework-agnostic Web Component wrappers using HybridJS. `<fe-*>` elements internally compose `<wa-*>` (WebAwesome) components.

**Location**: `packages/ui/`

**Key Files**:

- `components/fe-async-content/fe-async-content.ts` — `<fe-async-content>` hybridJS CE for loading/error/content states
- `components/fe-async-content/fe-async-content.spec.ts` — Tests (7 tests, 3 states, slot overrides, transitions)
- `components/fe-button/fe-button.ts` — `<fe-button>` custom element definition (hybridJS)
- `components/fe-button/fe-button.spec.ts` — Tests
- `components/fe-card/fe-card.ts` — `<fe-card>` hybridJS CE forwarding to `<wa-card>` (appearance, orientation, disabled, slot content detection)
- `components/fe-card/fe-card.spec.ts` — Tests (slot detection, appearance, orientation, header/footer/media forwarding)
- `components/fe-icon/fe-icon.ts` — `<fe-icon>` hybridJS wrapper over `<wa-icon>`
- `components/fe-icon/fe-icon.spec.ts` — Tests
- `components/fe-img/fe-img.ts` — `<fe-img>` wrapper over native `<img>` with cache-key dedup + error fallback
- `components/fe-img/fe-img.constants.ts` — Fallback SVG + in-memory `CACHE` map
- `components/fe-img/fe-img.spec.ts` — Tests (src loading state, error fallback, attribute reflection)
- `components/fe-loader/fe-loader.ts` — `<fe-loader>` indeterminate loading bar (size sm/md/lg, reduced-motion aware)
- `components/fe-loader/fe-loader.spec.ts` — Tests
- `components/fe-rating/fe-rating.ts` — `<fe-rating>` hybridJS wrapper over `<wa-rating>`
- `components/fe-rating/fe-rating.spec.ts` — Tests (23 tests, 9 props, events)
- `styles/main.css` — WA native base (`@import native.css` only — utilities dropped, BEM; no theme)
- `styles/themes/default.css` — WA default theme (for white-label-vue)
- `styles/themes/awesome.css` — WA awesome theme (for white-label-angular)
- `styles/themes/shoelace.css` — WA shoelace theme (for future web-react)
- `vitest.config.ts` — Vitest config for UI
- `vitest.setup.ts` — ElementInternals stub for jsdom (legacy; `states` is a real `Set`)
- Canonical FACE shim: `packages/infra/src/testing/element-internals.ts` (`@repo/infra`) — loaded by both Angular apps via `angular.json` `setupFiles` (gotcha #4; `states` fallback is `{ add, delete, has }` only — see `docs/integrations/form-associated-custom-elements.md`)

**Package Exports**:

- `@repo/ui/fe-async-content` → `./components/fe-async-content/fe-async-content.ts`
- `@repo/ui/fe-button` → `./components/fe-button/fe-button.ts`
- `@repo/ui/fe-card` → `./components/fe-card/fe-card.ts`
- `@repo/ui/fe-icon` → `./components/fe-icon/fe-icon.ts`
- `@repo/ui/fe-img` → `./components/fe-img/fe-img.ts`
- `@repo/ui/fe-loader` → `./components/fe-loader/fe-loader.ts`
- `@repo/ui/fe-rating` → `./components/fe-rating/fe-rating.ts`
- `@repo/ui/styles/*` → `./styles/*` (e.g. `@repo/ui/styles/main.css` → WA native base)
- `@repo/ui/styles/themes/*` → `./styles/themes/*` (e.g. `default.css`, `awesome.css`, `shoelace.css` — WA themes)

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

### `<fe-img>`

**Interface**: `FeImgElement extends HTMLElement`

| Property      | Type              | Default             | Description                                           |
| ------------- | ----------------- | ------------------- | ----------------------------------------------------- |
| `src`         | `string \| undefined` | `undefined`      | Image source                                          |
| `cacheKey`    | `string \| undefined` | `undefined`      | Dedup key; first `src` per key cached in-memory        |
| `fallbackSrc` | `string \| undefined` | `undefined`      | Error fallback URL; defaults to bundled `FALLBACK_SVG` |
| `alt`         | `string`          | `''`                | Alt text                                              |
| `minHeight`   | `string \| undefined` | `'10rem'`       | `min-height` on `<img>` (prevents layout shift)        |
| `loading`     | `boolean`         | `true`            | Reflects to `loading` attribute for CSS targeting      |
| `currentSrc`  | `string \| undefined` (readonly) | —          | Resolved src (cache-aware); computed property          |

**Implementation**: hybridJS `define()` wrapping native `<img>`. Shadow DOM. Computed `currentSrc` tracks `src` + `cacheKey`; on `error` swaps to fallback.

**Usage**:

```html
<fe-img src="/plants/rose.jpg" cache-key="rose" alt="Rose"></fe-img>
```

**Import**:

```typescript
import '@repo/ui/fe-img'
import type { FeImgElement } from '@repo/ui/fe-img'
```

---

### `<fe-loader>`

**Interface**: `FeLoaderElement extends HTMLElement`

| Property | Type                 | Default     | Description                          |
| -------- | -------------------- | ----------- | ------------------------------------ |
| `size`   | `'sm' \| 'md' \| 'lg'` | `'sm'`    | Bar thickness (0.25/0.5/0.75rem)     |
| `label`  | `string`             | `'Loading'` | Accessible label (`role="status"`)   |

**Implementation**: hybridJS `define()` rendering an indeterminate bar. Uses `--wa-*` tokens; `@media (prefers-reduced-motion: reduce)` disables animation. Typically placed in `fe-async-content` loading slot.

**Usage**:

```html
<fe-async-content :loading :error>
  <fe-loader slot="loading" size="md"></fe-loader>
</fe-async-content>
```

**Import**:

```typescript
import '@repo/ui/fe-loader'
import type { FeLoaderElement } from '@repo/ui/fe-loader'
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
- `product.presenter.ts` — ProductView mapping: Product → ProductView with framework name/description/image/imageFamily
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

## @repo/utils

**Purpose**: Shared utility modules — type guards, string/case transforms, object helpers, validation, CSS utilities, error handling.

**Location**: `packages/utils/src/`

**Key Files**:

- `type-guards.ts` — `isObject()`, `isString()`, `isNumber()`, `isBoolean()` type guards
- `string.ts` — `toKebabCase()`, `toPascalCase()`, `toCamelCase()` case transforms
- `object.ts` — `deepMerge()`, `pick()` object utilities
- `validate.ts` — `validateHex()`, `validateUrl()` validators
- `css.ts` — CSS utility helpers
- `error.ts` — `getErrorMessage()` error extraction

**Package Exports**:

- `@repo/utils` → `./src/index.ts` (single barrel root; no subpath exports)

**Dependencies**: None (pure TS)

**Pattern**: Factory-closure for 2+ functions per module, direct export for single functions.

**Usage**:

```typescript
import { isObject, toKebabCase, getErrorMessage } from '@repo/utils'
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

- `@repo/infra/src/metadata/white-label.ts` — frameworkMap (product metadata overrides keyed by product name)
- `src/main.ts` — App entry: imports WA styles, calls `createWhiteLabelApp({ routes, metaMap })`.mount('#app')
- `src/bootstrap/` — Factory layer: `app.ts` + `init.ts` (options + merge logic). `createWhiteLabelApp(opts)` bootstraps Vue app, router, MSW. Supports `routes`, `extendRoutes`, `omitRoutePaths`, `appShell`, `metaMap`
- `src/styles/index.ts` — Styles entry point, imports `tokens.css` + `base.css`
- `src/styles/tokens.css` — Design system token overrides (`--wa-*` vars)
- `src/styles/base.css` — Base element styles (body, `.h3`, `.subheading__h3`); h2 italic, card BEM classes
- `src/App.vue` — Root component (nav + RouterView)
- `src/routes.ts` — Route definitions (/, /components) — exported for tenant merge
- `src/components/ButtonContainer.vue` — Button demos (variants, sizes, appearances, states) wrapped in fe-card sections
- `src/components/CardContainer.vue` — Card demos (appearances, slots, header/footer, orientation)
- `src/components/IconContainer.vue` — Icon demos (basic icons, animated, size variants) wrapped in fe-card
- `src/components/RatingContainer.vue` — Rating demos (value, readonly, disabled, precision, sizes) wrapped in fe-card
- `src/composables/useProducts.ts` — Product data composable (uses `@repo/presenters`, `@vueuse/core useAsyncState` + `useMemoize` caching)
- `src/pages/ProductsPage.vue` — Product grid with fe-async-content (loading/error/content states)
- `src/pages/ComponentsPage.vue` — Component showcase hub (uses ButtonContainer, CardContainer, IconContainer, RatingContainer)
- `vite.config.ts` — Thin: calls `defineWhiteLabelViteConfig()` from base
- `vite.config.base.ts` — Shared Vite config factory: Vue + AutoImport + Components with mergeable dirs
- `vitest.config.ts` — Test config (Components plugin with `dts: './src/components.d.ts'`)

**Package exports** (for tenant apps):

- `white-label-vue/app` → `./src/bootstrap/app.ts` — exports:
  - `createWhiteLabelApp(opts: WhiteLabelAppOptions): Promise<WhiteLabelApp>` — bootstraps Vue app, hash router, MSW
  - `WhiteLabelAppOptions` — `{ routes?: RouteRecordRaw[], extendRoutes?: RouteRecordRaw[], omitRoutePaths?: string[], appShell?: () => Promise<...>, metaMap?: Record<string, ProductMeta> }`
  - `WhiteLabelApp` — `{ app, router }`
- `white-label-vue/vite.config.base` → `./vite.config.base.ts` — exports:
  - `defineWhiteLabelViteConfig(opts: WhiteLabelViteOptions): UserConfig` — pre-configured Vite config (Vue plugin, AutoImport, Components)
  - `WhiteLabelViteOptions` — `{ componentDirs?: string[], autoImportDirs?: string[] }`
- `white-label-vue/src/*` → `./src/*` (components/pages for lazy import in tenant routes)

**Dependencies**:

- `@repo/domain` — Product type
- `@repo/infra` — getProducts adapter
- `@repo/presenters` — toProductViewList, ProductView type
- `@repo/ui` — fe-button, fe-async-content, fe-card, fe-icon, fe-img, fe-loader, fe-rating, WA styles
- `@vueuse/core` (^14.3.0) — useAsyncState + useMemoize for composable async state & caching
- `vue` (^3.5.0)
- `vue-router` (^4)

**Auto-imports** (via unplugin-auto-import):

- All Vue Composition API (`ref`, `computed`, `onMounted`, etc.)
- All vue-router (`useRouter`, `useRoute`, `RouterLink`)
- Local composables: `useProducts`

**Routes**:

| Path          | Page           | Description                                                                                          |
| ------------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| `/`           | ProductsPage   | Product grid with fe-async-content (fe-loader loading / error / content), fe-card per product, fe-rating + pricing |
| `/components` | ComponentsPage | Component showcase hub (button, card, icon, rating) — lazy-loaded                                    |

---

## fake-plants-vue

**Purpose**: Vue 3 tenant app — plants-themed store. Consumes white-label-vue factory and extends with plant-specific pages.

**Location**: `apps/fake-plants-vue/`

**Build**: `vp dev` / `vp build` (Vite+ CLI)

**Key Files**:

- `src/main.ts` — Entry: imports WA styles + white-label styles + `plantsMap` from `@repo/infra`, calls `createWhiteLabelApp({ extendRoutes, omitRoutePaths, appShell, metaMap })`
- `src/main.spec.ts` — Factory smoke tests (zero overrides, appShell resolution, router defaults)
- `src/App.vue` — Root SFC (nav: RouterLink / → ProductsPage, /about → AboutPage + RouterView)
- `src/App.spec.ts` — Tests (RouterLink routes, RouterView)
- `src/components/ProductCard.vue` — Product card with formatted pricing, logo, rating
- `src/components/ProductCard.spec.ts` — Tests (title, description, price, Free default, previousPrice, rating)
- `src/pages/AboutPage.vue` — About page with fe-card
- `src/pages/AboutPage.spec.ts` — Tests (h1, fe-card, paragraph content)
- `vitest.config.ts` — Test config (vue plugin, jsdom)
- `vitest.setup.ts` — Custom element config for fe-\* components

**Metadata**: `plantsMap` lives in `packages/infra/src/metadata/fake-plants.ts` (app-root `metadata.ts` removed — generator writes fixture metadata to `@repo/infra` since 4.7.0).

**Test Count**: 16 tests across 4 files (App: 3, ProductCard: 7, AboutPage: 3, main: 3)

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

## white-label-angular

**Purpose**: Angular 22 SPA — layer base for Angular tenant apps. Zoneless, signals, OnPush. Exports factory + shared config.

**Location**: `apps/white-label-angular/`

**Key Files**:

- `src/main.ts` — App entry: imports WA styles, calls `createWhiteLabelApp()`
- `src/bootstrap/init.ts` — Options + merge logic; tokens `META_MAP_INJECTION_KEY`, `APP_ENV`, `COMPONENT_OVERRIDES`, helper `injectComponentOverride(name, fallback)`
- `src/bootstrap/app.ts` — `createWhiteLabelApp()` async bootstrap (`appShell` resolution via `resolveAppShell`), re-exports `useWhiteLabelApp` + `APP_ENV`
- `src/services/products.service.ts` — Angular resource() signal-based data service
- `src/components/` — fe-* container components (Button, Card, Icon, Rating, ProductCard) + universal `component-override` host (registry lookup by `localName`, `ngComponentOutlet`)
- `src/pages/` — ProductsPage (`<product-card [product]>` consumer wrapper), ComponentsPage
- `src/environments/` — Angular environment config (NG_APP_* workaround)
- ElementInternals shim loaded via `angular.json` `setupFiles` → `../../packages/infra/src/testing/element-internals.ts` (no app-side file — gotcha #4)

**Dependencies**:

- `@repo/domain` — Product, TenantConfig types
- `@repo/infra` — getProducts adapter
- `@repo/presenters` — toProductViewList
- `@repo/ui` — fe-* WCs, WA styles
- `@angular/core` — Angular 22 (zoneless, signals)

**Usage**:

```typescript
import { createWhiteLabelApp } from './bootstrap/init'
```

---

## fake-plants-angular

**Purpose**: Angular 22 tenant app — validates the Angular layer mechanism end-to-end (manual parity vs `fake-plants-vue`), precursor to the 4.7 Angular generator.

**Location**: `apps/fake-plants-angular/`

**Key Files**:

- `src/main.ts` — `createWhiteLabelApp({ appShell, extendRoutes, omitRoutePaths, metaMap })`
- `src/app/app.component.ts` — `FpApp` root shell via `appShell` option (nav: Products / About)
- `src/components/fp-product-card.component.ts` — `FpProductCard` photo card, registered under `'product-card'` via `componentOverrides` (shell ProductsPage resolves through `injectComponentOverride` + `ngComponentOutlet`)
- `src/styles/tokens.css` — Green brand overrides (same 9 `--brand-*` values as fake-plants-vue)
- `src/pages/about-page.component.ts` — Tenant About route (`extendRoutes`, slash-less Angular paths)
- `public/mockServiceWorker.js` — MSW worker; tenant registered via `bun run register-tenant`

**Overrides vs white-label-angular**:

| Option               | Value                                                |
| -------------------- | ---------------------------------------------------- |
| `appShell`           | `FpApp` (`<fp-root>` host tag)                       |
| `extendRoutes`       | `about` → AboutPage                                  |
| `omitRoutePaths`     | `['components']`                                     |
| `metaMap`            | `plantsMap` (7 plants) via `META_MAP_INJECTION_KEY`  |
| `componentOverrides` | `'product-card'` → `FpProductCard`                   |

**Dependencies**:

- `white-label-angular` — factory + base pages/components
- `@repo/domain`, `@repo/infra`, `@repo/presenters`, `@repo/ui`
- `@angular/core` (^22)

**Dev**: `bun run dev` → `ng serve --port 4201`

---

## mirror-tenant-vue

**Purpose**: Vue 3 mirror tenant — generator static-file SoT. `packages/generator/src/templates/vue.ts` reads tsconfig.json, src/styles/index.ts, .eslintrc.cjs, vitest.config.ts, vitest.setup.ts, src/main.spec.ts via `readMirrorFiles`; package.json read + renamed per tenant. Edit this app to change generated tenant statics.

**Location**: `apps/mirror-tenant-vue/`

**Key Files**:

- `src/main.ts` — `createWhiteLabelApp({ metaMap: mirrorTenantMap })` (tenant scaffold shape)
- `package.json` — SoT for new-tenant package.json (name rewritten by generator)
- `tsconfig.json` — SoT, copied verbatim (extends vite.json, strictNullChecks: true)
- `vitest.config.ts` / `vitest.setup.ts` — SoT, copied verbatim
- `src/styles/index.ts` + `tokens.css` — SoT styles entry
- `src/main.spec.ts` — SoT tenant bootstrap spec
- `src/components/`, `src/pages/` — placeholders (empty)

**Dependencies**: white-label-vue, @repo/infra, @repo/presenters, @repo/ui, vue, vue-router

---

## mirror-tenant-angular

**Purpose**: Angular 22 mirror tenant — generator static-file SoT (`templates/angular.ts`). Reads tsconfig*.json (incl. **tsconfig.scripts.json** for `scripts/*` with `types: ["node"]`), .eslintrc.cjs, .gitignore, src/import-meta-env.d.ts, src/main.spec.ts, scripts/gen-component-overrides.ts via `readMirrorFiles`; package.json/angular.json read + projects rewritten per tenant (serve prebundle:false + devPort, test setupFiles element-internals).

**Location**: `apps/mirror-tenant-angular/`

**Key Files**:

- `package.json` — SoT; owns ng script set, predev/prebuild/pretest run overrides generator
- `angular.json` — SoT; generator rewrites `projects` per tenant
- `tsconfig.scripts.json` — Separate TS project for `scripts/**` (needs `@types/node`)
- `scripts/gen-component-overrides.ts` — Scans `src/components/*.component.ts` for `export class`, emits `src/components/overrides.gen.ts` (`componentOverrides` registry; filename stem = key). Uses `fileURLToPath` (not `import.meta.dir`)
- `src/main.ts` — tenant scaffold shape with appShell placeholder
- `src/main.spec.ts`, `src/import-meta-env.d.ts` — SoT, copied verbatim
- `src/styles/tokens.css` — cyberpunk token polish
- `src/components/overrides.gen.ts` — GENERATED, do not edit

**Dependencies**: white-label-angular, @angular/* ^22, @repo/infra, @repo/presenters, @repo/ui, @repo/utils

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

---

## @repo/generator

**Purpose**: Pinion-based code generator for scaffolding new tenant apps (Vue + Angular). Interactive prompts, case transforms, MSW registration integration. Static tenant files derive from the mirror apps (`apps/mirror-tenant-vue`, `apps/mirror-tenant-angular`) as single source of truth — edit the mirror, not the templates.

**Location**: `packages/generator/src/`

**Key Files**:

- `index.ts` — Barrel exports: `generate()` (vue-tenant), `validateHex`, `getThemeClass`, `TenantContext`, `Theme`
- `generators/vue-tenant.tpl.ts` — Vue generator: `generate(ctx)`, sub-fns `renderSetup`, `renderSourceFiles`, `renderConditionalAssets`, `renderTestInfra`
- `generators/vue-tenant.tpl.spec.ts` — Orchestration tests
- `generators/angular-tenant.tpl.ts` — Angular generator: `generate(ctx)` — prompts (incl. angular-only `appShell` q), case transforms, `assignAngularPort`, then `renderSetup` (package.json, angular.json, tsconfig.json/app/spec/**scripts**, index.html, eslintrc, gitignore, `scripts/gen-component-overrides.ts`), `renderSourceFiles` (main.ts, appShell-conditional app.component.ts, tokens.css, environments, import-meta-env.d.ts, main.spec), `renderConditionalAssets` (override component or .gitkeep), `writeInfraMetadata`, `copyServiceWorker`, `installDeps`, `verifyScaffold`
- `generators/angular-tenant.tpl.spec.ts` — Orchestration tests
- `helpers/cases.ts` — Kebab/Pascal/Camel case transforms + prefix derivation
- `helpers/cases.spec.ts` — Case transform tests
- `helpers/palette.ts` — Hex color validation + theme class helper
- `helpers/palette.spec.ts` — Palette tests
- `helpers/file-io.ts` — `fileIo()` factory: `readRepoFile`, `readFileData<T>`, `writeFileData`, `copyMswWorker`, `readMirrorFiles(files, dir)` — returns zero-arg readers `Record<relPath, () => string>` keyed under mirror dir; exports `REPO_ROOT` anchor
- `helpers/file-io.spec.ts` — File I/O tests
- `helpers/framework-from-entry.ts` — `inferFramework(entryPath)` — vue | angular | react
- `helpers/infra-metadata.ts` — `writeInfraMetadata()` — writes fixture metadata to `packages/infra/src/metadata/<name>.ts` + idempotent barrel line append to `packages/infra/src/index.ts` (keys `${name}-alpha/beta/gamma`)
- `helpers/infra-metadata.spec.ts` — Metadata routing + idempotency tests
- `helpers/scaffold.ts` — Shared scaffold utilities (fs writes used by generator pipeline)
- `helpers/error.ts`, `helpers/mocks.ts`, `helpers/port-allocator.ts` — Error handling, mock ctx helpers, dev-port allocation per framework
- `helpers/index.ts` — Helper barrel (cases, error, framework-from-entry, infra-metadata, mocks, palette, port-allocator, scaffold, file-io)
- `models/main.ts` — `TenantContext` (Pinion ctx: name/Name/camelName/description/metadataMode/theme/brandHex/overrideComponent*/prefix/devPort/framework/appShell), `Theme` ('default'|'cyberpunk'|'coffeecup'|'silk'|'custom'), `Framework` ('vue'|'angular'|'react'), `MockedData`
- `prompts/index.ts` — Interactive tenant prompts (name, description, theme, metadata, component override, MSW; framework-specific including angular-only appShell)
- `prompts/index.spec.ts` — Prompt shape tests
- `templates/vue.ts` — Vue tenant output templates. Dynamic: `packageJson` (mirror package.json read + renamed), `viteConfig`, `indexHtml`, `mainTs` (createWhiteLabelApp + metaMap), `componentVue`, `env`/`envExample`. Static SoT readers via `readMirrorFiles('apps/mirror-tenant-vue')`: `tsconfigJson`, `stylesIndex`, `eslintrc`, `vitestSetup`, `vitestConfig`, `mainSpec`
- `templates/angular.ts` — Angular tenant output templates. Dynamic: `packageJson` (mirror read + renamed), `angularJson` (mirror read, projects rewritten: serve prebundle:false + devPort, test setupFiles element-internals), `indexHtml` (`<prefix-root>` host), `appComponentTs` (appShell-conditional), `mainTs`, `environmentTs`/`environmentDevTs`, `overrideComponent`. Static SoT readers via `readMirrorFiles('apps/mirror-tenant-angular')`: `tsconfigJson`, `tsconfigAppJson`, `tsconfigSpecJson`, `tsconfigScriptsJson`, `eslintrc`, `gitignore`, `importMetaEnvDts`, `mainSpec`, `genComponentOverridesScript`
- `templates/common.ts` — Framework-shared templates (`tokensCss`, `metadataTs`, `gitkeep`)
- `templates/{vue,angular,common}.spec.ts` + `templates/angular.gen-component-overrides.spec.ts` — Template rendering tests
- `msw/add-tenant.ts` — Pure fn: `addTenantConfig(configs, prefix, names)` — validates + appends tenant entry
- `msw/add-tenant.spec.ts` — MSW config tests
- `msw/copy-service-worker.ts` — Framework-aware worker copy: `apps/white-label-<framework>/public/` → `apps/<name>-<framework>/public/`
- `msw/copy-service-worker.spec.ts` — Covers vue + angular targets
- `msw/register-tenant.ts` — CLI: writes tenant entry to `packages/infra/src/mocks/data/mocked-data.json`

**Dependencies**:

- `@featherscloud/pinion` (^0.5.7) — Code generator framework (renderTemplate, toFile, when, prompt)
- `inquirer` (^9) — Interactive CLI prompts
- `apps/mirror-tenant-vue`, `apps/mirror-tenant-angular` — Static-file SoT read at generation time via `readMirrorFiles`/`readRepoFile` (fs, no workspace dep)
- `@repo/infra` (indirect: writes metadata to `packages/infra/src/metadata/<name>.ts` + barrel line, mock data to `packages/infra/src/mocks/data/mocked-data.json`)

**Exports**:

- `generate(ctx: TenantContext)` — Main generator entry point (Pinion task chain; re-exported from vue-tenant.tpl)
- `TenantContext` (type) — `{ name, Name, camelName, description, metadataMode, theme, brandHex?, overrideComponent, overrideComponentName?, registerMsw?, prefix, devPort, framework, appShell }`
- `Theme` (type) — `'default' | 'cyberpunk' | 'coffeecup' | 'silk' | 'custom'`
- `validateHex(hex: string): boolean` — Validates hex color string
- `getThemeClass(theme: Theme): string` — Returns WA theme class name

**Usage**:

```bash
# Interactive — Vue tenant
bun run generate:vue-tenant

# Interactive — Angular tenant (no root script yet — run pinion directly)
bun x pinion packages/generator/src/generators/angular-tenant.tpl.ts
```

```typescript
import { generate } from '@repo/generator'
import type { TenantContext } from '@repo/generator'
const ctx = await generate({ pinion: { force: true } })
```

**Generated output**: `apps/<name>-vue/` with:
- `package.json` — deps: white-label-vue, vue, vue-router, @repo/ui, @repo/presenters
- `vite.config.ts` — uses `defineWhiteLabelViteConfig()` from white-label-vue
- `tsconfig.json` — extends vite.json, strictNullChecks: true
- `index.html` — HTML entry
- `src/main.ts` — imports WA styles, calls `createWhiteLabelApp({ extendRoutes, metaMap })`
- `src/styles/tokens.css` — Brand overrides (custom theme or WA theme)
- `src/styles/index.ts` — Style barrel
- `packages/infra/src/metadata/<name>.ts` (fixture mode) — Placeholder product metadata entries (keys `<name>-alpha/beta/gamma`) + `export { <camel>Map } from './metadata/<name>'` appended to `packages/infra/src/index.ts`; idempotent, never overwrites existing file
- `vitest.setup.ts` — jsdom custom element config for fe-* components
- `src/App.spec.ts` — Basic app creation test
- `.env` / `.env.example` — Environment variables with VITE_TENANT_ID
