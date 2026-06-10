# Layer Wiring — Hexagonal Integration Guide

How the 4 layers connect in forma-initiale, traced through the Product Listing feature.

---

## 1. Layer Overview

| Layer | Package | Deps on | Responsibility |
|---|---|---|---|
| Domain | `@repo/domain` | None | Pure types, business models |
| Infra | `@repo/infra` | `@repo/domain` | API adapters, mocks |
| UI | `@repo/ui` | WA (Web Awesome) | fe-* WC wrappers, styles |
| App | `apps/web-vue` | All above + Vue 3 | Composition, presentation, rendering |

Strict dep order — never circular:

```
domain → infra → packages/ui → apps/*
```

---

## 2. Domain Layer

**Package:** [`packages/domain/`](../../packages/domain/)

Pure TypeScript types and interfaces. Zero framework dependencies — no Vue, no React, no WA, no hybridJS.

**Export:** `packages/domain/src/index.ts`

```typescript
export type { Product } from './models/Product'
```

**Example model:** `packages/domain/src/models/Product.ts`

```typescript
export interface Product {
  id: string
  name: string
  previousPrice: number
  price: number
  rate: number
}
```

Rules:
- Only `type` and `interface` exports — no classes, no runtime logic
- No `import` from outside `@repo/domain` (zero deps)
- Used for type safety across all downstream layers

---

## 3. Infra Layer

**Package:** [`packages/infra/`](../../packages/infra/)

Implements domain contracts. Uses `fetch` for HTTP, MSW for mock data.

**Export:** `packages/infra/src/index.ts`

```typescript
export { getProducts } from './adapters/get-products.adapter'
```

**Adapter:** `packages/infra/src/adapters/get-products.adapter.ts`

```typescript
import type { Product } from "@repo/domain";

export interface GetProductsResponse {
  data: Product[]
  total: number
}

export async function getProducts(): Promise<GetProductsResponse> {
  const baseUrl = import.meta.env.VITE_API_URL
  const response = await fetch(`${baseUrl}/products`);
  if (!response.ok) {
    throw new Error(`Failed to fetch products: HTTP ${response.status}`);
  }
  return response.json();
}
```

Key patterns:
- Returns domain types (`Product[]` from `@repo/domain`)
- Uses `import.meta.env.VITE_API_URL` for base URL (Vite env var)
- Throws descriptive errors on HTTP failure
- All adapters exported from `packages/infra/src/index.ts`

**Mocks:** `packages/infra/src/mocks/`

MSW handlers in `handlers/products.ts`:

```typescript
import { http, HttpResponse } from 'msw'
import { buildProductList } from '../factories/product.js'

let products = buildProductList(5)

export const productHandlers = [
  http.get('*/api/products', () => {
    return HttpResponse.json({ data: products, total: products.length })
  }),
  // ...
]
```

Mocks use `@repo/domain` types and factories from `mocks/factories/product.ts`.

---

## 4. UI Layer (fe-* Components)

**Package:** [`packages/ui/`](../../packages/ui/)

Framework-agnostic web components built with hybridJS. Each component wraps a `wa-*` Web Awesome element — apps never import WA directly.

**Pattern:** `define({ tag: "fe-*", render, shadow: true })`

**Example:** `packages/ui/components/fe-button.ts`

```typescript
import '@awesome.me/webawesome/dist/components/button/button.js'
import { define, html } from 'hybrids'

export interface FeButtonElement extends HTMLElement {
  variant: string
  size: string
  appearance: string
  icon: string
  disabled: boolean
  loading: boolean
  pill: boolean
}

export const FeButton = define<FeButtonElement>({
  tag: 'fe-button',
  variant: 'neutral',
  size: 'm',
  appearance: 'filled',
  icon: '',
  disabled: false,
  loading: false,
  pill: false,
  render: {
    value: (host) => html`
      <wa-button
        variant="${host.variant}"
        size="${host.size}"
        appearance="${host.appearance}"
        disabled="${host.disabled}"
        loading="${host.loading}"
        pill="${host.pill}"
      >
        ${host.icon && html`<fe-icon name="${host.icon}"></fe-icon>`}
        <slot></slot>
      </wa-button>
    `,
    shadow: true,
  },
})
```

**Current components** (each in `packages/ui/components/fe-*.ts`):

| Component | Wraps | Purpose |
|---|---|---|
| `fe-button` | `wa-button` | Button with variants, loading, icon |
| `fe-card` | `wa-card` | Card layout container |
| `fe-icon` | `wa-icon` | Icon renderer (brands/classic) |
| `fe-rating` | `wa-rating` | Star rating display |
| `fe-async-content` | (custom) | Loading/error/data slot switcher |

**Styles** split into 2 imports:

```typescript
import '@repo/ui/styles'                    // base: native.css + utilities.css
import '@repo/ui/styles/themes/default'      // theme: WA component styling
```

Package exports from `packages/ui/package.json`:

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

---

## 5. App Layer (web-vue)

**App:** `apps/web-vue/`

Vue 3 with composition API, `unplugin-auto-import` (`vue`, `vue-router` auto-imported), `vue-router` hash mode.

### Presenter Layer

Presenters transform domain models → view models (UI-specific shape).

**File:** `apps/web-vue/src/presenters/product.presenter.ts`

```typescript
import type { Product } from '@repo/domain'

export interface ProductView {
  name: string
  title: string
  description: string
  logo: string
  logoFamily: string
  previousPrice: number
  price: number
  rate: number
}

export function toProductViewList(products: Product[]): ProductView[] {
  return products.map(toProductView)
}
```

Presenter adds UI fields (`title`, `description`, `logo`, `logoFamily`) not present in the domain `Product`. Pure functions, no Vue dependency.

### Composable Layer

Composables orchestrate data fetching → presenting → state management.

**File:** `apps/web-vue/src/composables/useProducts.ts`

```typescript
import { getProducts } from "@repo/infra";
import { toProductViewList } from "../presenters/product.presenter";
import type { ProductView } from "../presenters/product.presenter";
import { useAsyncState } from "@vueuse/core";

export function useProducts() {
  const formattedError = ref<string | undefined>();

  const { state, isLoading, execute } = useAsyncState<ProductView[]>(
    async () => {
      formattedError.value = undefined;
      const { data } = await getProducts();
      return toProductViewList(data);
    },
    [],
    { immediate: true,
      onError(e: unknown) {
        formattedError.value = e instanceof Error
          ? e.message
          : "Failed to load products";
      },
    }
  );

  return {
    products: state,
    loading: isLoading,
    error: formattedError,
    fetch: () => execute(),
  };
}
```

Pattern:
1. `useAsyncState` from `@vueuse/core` manages async lifecycle
2. Inside the async fn: call infra adapter → pipe through presenter
3. Return raw refs: `state` (data), `isLoading` (boolean), `error` (string ref from `onError`)

### Page Layer

Pages compose fe-* components with data from composables.

**File:** `apps/web-vue/src/pages/ProductsPage.vue`

```vue
<script setup lang="ts">
import "@repo/ui/fe-icon";
import "@repo/ui/fe-rating";
import "@repo/ui/fe-card";
import "@repo/ui/fe-async-content";

const { products, loading, error } = useProducts();
</script>

<template>
  <div class="products-page">
    <h1 class="products-page__title">Free Bundles by Frameworks</h1>

    <fe-async-content :loading="loading" :error="error">
      <p slot="loading">Loading...</p>
      <p slot="error">{{ error }}</p>

      <div class="products-page__grid">
        <fe-card v-for="product in products" :key="product.name">
          <fe-icon slot="media" :name="product.logo" :family="product.logoFamily" />
          <h2 slot="header">{{ product.title }}</h2>
          <p>{{ product.description }}</p>
          <div slot="footer">
            <fe-rating :value="product.rate" readonly />
            <strong>Free</strong>
          </div>
        </fe-card>
      </div>
    </fe-async-content>
  </div>
</template>
```

Key rules:
- `fe-*` components imported for side-effect (registers custom elements)
- No direct `wa-*` usage in templates — all WA access goes through `fe-*` wrappers
- Composable return values destructured directly
- Template bindings use presenter-enriched `ProductView` fields

---

## 6. End-to-End Trace: Product Listing

Follow one complete request→render cycle through all layers:

```
ProductsPage.vue
  │
  │ <script setup> calls useProducts()
  │
  ▼
useProducts() composable (apps/web-vue/src/composables/useProducts.ts)
  │
  │ initializes useAsyncState({ immediate: true }) → fires immediately
  │
  ▼
useAsyncState inner async function:
  │
  │   formattedError.value = undefined
  │   const { data } = await getProducts()
  │
  ▼
getProducts() (packages/infra/src/adapters/get-products.adapter.ts)
  │
  │   fetch(`${VITE_API_URL}/products`)
  │
  ▼
HTTP GET /api/products
  │
  │ In dev: intercepted by MSW handler (packages/infra/src/mocks/handlers/products.ts)
  │ In prod: real API call
  │
  ▼
Response: { data: Product[], total: number }
  │
  │ Returns to useAsyncState inner fn
  │
  ▼
toProductViewList(data) (apps/web-vue/src/presenters/product.presenter.ts)
  │
  │   Product[] → ProductView[]
  │   Each Product gets: title, description, logo, logoFamily
  │
  ▼
ProductView[] stored in useAsyncState.state ref
  │
  │ In template: products, loading, error are reactive refs
  │
  ▼
ProductsPage.vue template renders:
  │
  │   <fe-async-content :loading :error>
  │     · loading=true → "Loading..." slot
  │     · error set → error slot with message
  │     · data ready → grid of <fe-card> elements
  │
  │   v-for product in products → <fe-card>
  │     <fe-icon slot="media" :name :family />
  │     <h2>{{ product.title }}</h2>
  │     <p>{{ product.description }}</p>
  │     <fe-rating :value="product.rate" readonly />
  │     <span>${{ product.previousPrice }}</span>
  │     <strong>Free</strong>
  │
  ▼
Browser paints shadow-DOM-styled fe-* components wrapping wa-* elements
```

**Layer responsibilities in this trace:**

| Step | Layer | File | What happens |
|---|---|---|---|
| 1 | App (Page) | `ProductsPage.vue` | Calls composable, binds refs to template |
| 2 | App (Composable) | `useProducts.ts` | Orchestrates async data flow |
| 3 | Infra | `get-products.adapter.ts` | HTTP fetch, error handling |
| 4 | Domain | `Product.ts` | Type contract for response shape |
| 5 | App (Presenter) | `product.presenter.ts` | Transforms domain → view model |
| 6 | App (Composable) | `useProducts.ts` | Stores result in reactive state |
| 7 | App (Page) | `ProductsPage.vue` | Renders fe-* components with view data |
| 8 | UI | `fe-*.ts` | Wraps WA elements, shadow DOM render |

---

## 7. Import Convention Reference

| Source | Target | How | Example |
|---|---|---|---|
| `@repo/infra` | `@repo/domain` | Import types directly | `import type { Product } from "@repo/domain"` |
| `@repo/ui` | WA | npm dep (not in monorepo) | `import '@awesome.me/webawesome/dist/components/button/button.js'` |
| `apps/web-vue` | `@repo/domain` | Import types for type safety | `import type { Product } from '@repo/domain'` |
| `apps/web-vue` | `@repo/infra` | Import data adapters | `import { getProducts } from "@repo/infra"` |
| `apps/web-vue` | `@repo/ui` | Side-effect import (CE registration) | `import "@repo/ui/fe-card"` |
| `apps/web-vue` | `@vueuse/core` | Import composables | `import { useAsyncState } from "@vueuse/core"` |

**Never:**
- Import `@vueuse/core` or Vue in `packages/ui/` or `packages/infra/` or `packages/domain/`
- Import `wa-*` directly in app templates — always go through `fe-*`
- Import `@repo/ui` from `@repo/infra` or `@repo/domain`

---

## 8. Adding a New Feature Checklist

Steps to add a data feature (e.g., User Detail):

```
1.  Domain    → packages/domain/src/models/User.ts
                Define types: interface User { ... }
                Export from packages/domain/src/index.ts

2.  Infra     → packages/infra/src/adapters/get-users.adapter.ts
                Implement fetch adapter, HTTP error handling
                Export from packages/infra/src/index.ts
                Add MSW handlers in packages/infra/src/mocks/handlers/

3.  Presenter → apps/web-vue/src/presenters/user.presenter.ts
                toUserViewList(users: User[]): UserView[]
                Add UI-specific fields (avatar, label, etc.)

4.  Composable → apps/web-vue/src/composables/useUsers.ts
                 useAsyncState → getUsers() → toUserViewList()
                 Return { users, loading, error, fetch }

5.  Page       → apps/web-vue/src/pages/UsersPage.vue
                 Import fe-* components, call useUsers(), render

6.  Route     → apps/web-vue/src/router/index.ts
                register { path: '/users', component: UsersPage }

7.  Tests     → At each layer: adapter.spec.ts, presenter.spec.ts,
                composable.spec.ts, page-level test
```

---

## 9. References

- [`docs/ADRS/design-patterns.md`](../ADRS/design-patterns.md) — principles applied in this wiring
- [`docs/CODEMAPS/ARCHITECTURE.md`](../CODEMAPS/ARCHITECTURE.md) — high-level architecture
- [`docs/CODEMAPS/MODULES.md`](../CODEMAPS/MODULES.md) — per-module API docs
- [`docs/CODEMAPS/FILES.md`](../CODEMAPS/FILES.md) — file tree
- [`.opencode/references/webawesome/SKILL.md`](../../.opencode/references/webawesome/SKILL.md) — WA Agent Skill (component API docs)
- [`AGENTS.md`](../../AGENTS.md) — monorepo agent guide, commands, gotchas
