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
- `Product` (type) — `{ id: string; title: string; price: number }`

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
- `getProducts()` — `() => Promise<Product[]>` — Fetches products from `https://api.example.com/products`

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
- `components/fe-button.ts` — `<fe-button>` custom element definition (hybridJS)
- `components/fe-button.spec.ts` — Tests
- `components/fe-card.ts` — `<fe-card>` WC subclass of WaCard (appearance, orientation, slots)
- `components/fe-card.spec.ts` — Tests
- `components/fe-icon.ts` — `<fe-icon>` hybridJS wrapper over `<wa-icon>`
- `components/fe-icon.spec.ts` — Tests
- `components/fe-rating.ts` — `<fe-rating>` hybridJS wrapper over `<wa-rating>`
- `components/fe-rating.spec.ts` — Tests (23 tests, 9 props, events)
- `styles/webawesome.ts` — WA base CSS (native.css + utilities.css, no theme)
- `styles/themes/default.ts` — WA default theme (for web-vue)
- `styles/themes/awesome.ts` — WA awesome theme (for future web-angular)
- `styles/themes/shoelace.ts` — WA shoelace theme (for future web-react)
- `vitest.config.ts` — Vitest config for UI
- `vitest.setup.ts` — ElementInternals stub for jsdom

**Package Exports**:
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

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `string` | `'neutral'` | neutral, brand, success, warning, danger |
| `size` | `string` | `'m'` | xs, s, m, l, xl |
| `appearance` | `string` | `'filled'` | accent, filled, outlined, plain |
| `icon` | `string` | `''` | WA icon name (empty = no icon) |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading spinner |
| `pill` | `boolean` | `false` | Pill shape |

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

### `<fe-card>`

**Interface**: `FeCardElement extends HTMLElement`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `appearance` | `string` | `'filled'` | accent, filled, outlined, filled-outlined, plain |
| `orientation` | `string` | `'vertical'` | horizontal, vertical |

**Implementation**: WC subclass of WaCard (zero custom logic). Not hybridJS because WaCard is already a registered CE.

**Slots**: `header`, `footer`, `media`, `actions`, `footer-actions`, `header-actions`.

**Shadow DOM**: Delegates entirely to `<wa-card>`.

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

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | `string \| undefined` | `undefined` | WA icon name |
| `library` | `string` | `'default'` | Icon library |
| `family` | `string` | `'classic'` | Icon family |
| `variant` | `string \| undefined` | `undefined` | Icon variant |
| `label` | `string` | `''` | Accessible label |
| `autoWidth` | `boolean` | `false` | Auto-width |
| `flip` | `string \| undefined` | `undefined` | Flip direction |
| `rotate` | `number` | `0` | Rotation degrees |
| `animation` | `string \| undefined` | `undefined` | Animation (spin, pulse, bounce, ping) |
| `src` | `string \| undefined` | `undefined` | Custom icon source |
| `swapOpacity` | `boolean` | `false` | Swap opacity |

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

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `number` | `0` | Rating value |
| `max` | `number` | `5` | Maximum stars |
| `precision` | `number` | `1` | Step precision (0.5 for half-stars) |
| `size` | `string` | `'m'` | xs, s, m, l, xl |
| `label` | `string` | `''` | Accessible label |
| `disabled` | `boolean` | `false` | Disabled state |
| `readonly` | `boolean` | `false` | Readonly state |
| `required` | `boolean` | `false` | Required for forms |
| `name` | `string \| undefined` | `undefined` | Form field name |

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
  extends: ["@repo/eslint-config/index.js"],
}
```

---

## @repo/typescript-config

**Purpose**: Shared TypeScript base configurations.

**Location**: `packages/typescript-config/`

**Key Files**:
- `base.json` — Strict TS, ES module, Bundler resolution
- `vite.json` — Extends base.json, adds Vite-optimized settings

**Settings Highlights**:

| Setting | base.json | vite.json |
|---------|-----------|-----------|
| `strict` | true | true |
| `moduleResolution` | Bundler | Bundler |
| `noEmit` | false | true |
| `lib` | — | ESNext, DOM |
| `noUnusedLocals` | false | true |
| `noUnusedParameters` | false | true |

**Usage**:
```json
{
  "extends": "@repo/typescript-config/vite.json"
}
```

---

## web-vue

**Purpose**: Vue 3 SPA application — main user-facing app.

**Location**: `apps/web-vue/`

**Build**: `vp dev` / `vp build` (Vite+ CLI)

**Key Files**:
- `src/main.ts` — App entry, registers plugins (router, WA base + theme + DS tokens); imports `./styles`
- `src/styles/index.ts` — Styles entry point, imports `tokens.css` + `base.css`
- `src/styles/tokens.css` — Design system token overrides (`--wa-*` vars)
- `src/styles/base.css` — Base element styles (body, `.h3`, `.h3__subheading`)
- `src/App.vue` — Root component (nav + RouterView)
- `src/router.ts` — Hash-based routes (/, /demo)
- `src/components/ButtonContainer.vue` — Button demos (variants, sizes, appearances, states)
- `src/components/CardContainer.vue` — Card demos (appearances, slots, orientation)
- `src/components/IconContainer.vue` — Icon demos (basic icons, animated, size variants)
- `src/components/RatingContainer.vue` — Rating demos (value, readonly, disabled, precision, sizes)
- `src/composables/useProducts.ts` — Product data composable
- `src/pages/ProductsPage.vue` — Product listing page
- `src/pages/ComponentsPage.vue` — Component showcase hub (uses ButtonContainer, CardContainer, IconContainer, RatingContainer)
- `vite.config.ts` — Vite plugins (vue, auto-import, components)
- `vitest.config.ts` — Test config (Components plugin with `dts: './src/components.d.ts'`)

**Dependencies**:
- `@repo/domain` — Product type
- `@repo/infra` — getProducts adapter
- `@repo/ui` — fe-button, fe-card, fe-icon, fe-rating, WA styles
- `vue` (^3.5.0)
- `vue-router` (^4)

**Auto-imports** (via unplugin-auto-import):
- All Vue Composition API (`ref`, `computed`, `onMounted`, etc.)
- All vue-router (`useRouter`, `useRoute`, `RouterLink`)
- Local composables: `useProducts`

**Routes**:

| Path | Page | Description |
|------|------|-------------|
| `/` | ProductsPage | Product list with loading/error states |
| `/components` | ComponentsPage | Component showcase hub (button, card, icon, rating) — lazy-loaded |

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
