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
- `components/fe-button.ts` — `<fe-button>` custom element definition
- `components/fe-button.spec.ts` — Tests
- `styles/webawesome.ts` — WA base CSS (native.css + utilities.css, no theme)
- `styles/themes/default.ts` — WA default theme (for web-vue)
- `styles/themes/awesome.ts` — WA awesome theme (for future web-angular)
- `styles/themes/shoelace.ts` — WA shoelace theme (for future web-react)
- `vitest.config.ts` — Vitest config for UI
- `vitest.setup.ts` — ElementInternals stub for jsdom

**Package Exports**:
- `@repo/ui/fe-button` → `./components/fe-button.ts`
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
- `src/main.ts` — App entry, registers plugins (router, WA base + theme + DS tokens)
- `src/styles/tokens/base.css` — Design system token overrides (`--wa-*` vars)
- `src/App.vue` — Root component (nav + RouterView)
- `src/router.ts` — Hash-based routes (/, /buttons)
- `src/composables/useProducts.ts` — Product data composable
- `src/pages/ProductsPage.vue` — Product listing page
- `src/pages/ButtonDemoPage.vue` — Button demo page
- `vite.config.ts` — Vite plugins (vue, auto-import, components)
- `vitest.config.ts` — Test config

**Dependencies**:
- `@repo/domain` — Product type
- `@repo/infra` — getProducts adapter
- `@repo/ui` — fe-button, WA styles
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
| `/buttons` | ButtonDemoPage | fe-button demo showing all variants |

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
