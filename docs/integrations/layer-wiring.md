# Layer Wiring — Hexagonal Integration Guide

How the 4 layers connect in forma-initiale, traced through the Product Listing feature.

---

## 1. Layer Overview

| Layer      | Package                | Deps on           | Responsibility                        |
| ---------- | ---------------------- | ----------------- | ------------------------------------- |
| Domain     | `@repo/domain`         | None              | Pure types, business models           |
| Presenters | `@repo/presenters`     | `@repo/domain`    | Domain → ViewModel transforms         |
| Infra      | `@repo/infra`          | `@repo/domain`    | API adapters, mocks                   |
| UI         | `@repo/ui`             | WA (Web Awesome)  | fe-\* WC wrappers, styles             |
| App        | `apps/white-label-vue` | All above + Vue 3 | Composition, orchestration, rendering |

Strict dep order — never circular:

```
domain → presenters → infra → packages/ui → apps/*
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
import type { Product } from '@repo/domain'

export interface GetProductsResponse {
  data: Product[]
  total: number
}

export async function getProducts(): Promise<GetProductsResponse> {
  const baseUrl = import.meta.env.VITE_API_URL
  const tenantId = import.meta.env.VITE_TENANT_ID || 'wl'
  const response = await fetch(`${baseUrl}/products`, {
    headers: { 'x-tenant-id': tenantId },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch products: HTTP ${response.status}`)
  }
  return response.json()
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

## 4. UI Layer (fe-\* Components)

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

| Component          | Wraps       | Purpose                             |
| ------------------ | ----------- | ----------------------------------- |
| `fe-button`        | `wa-button` | Button with variants, loading, icon |
| `fe-card`          | `wa-card`   | Card layout container               |
| `fe-icon`          | `wa-icon`   | Icon renderer (brands/classic)      |
| `fe-rating`        | `wa-rating` | Star rating display                 |
| `fe-async-content` | (custom)    | Loading/error/data slot switcher    |

**Styles** split into 2 imports:

```typescript
import '@repo/ui/styles' // base: native.css + utilities.css
import '@repo/ui/styles/themes/default' // theme: WA component styling
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

## 5. App Layer (white-label-vue)

**App:** `apps/white-label-vue/`

Vue 3 with composition API, `unplugin-auto-import` (`vue`, `vue-router` auto-imported), `vue-router` hash mode.

### App Factory Pattern

The app uses a factory pattern for layer reuse. The white-label-vue package exports two factories consumed by both itself and tenant apps.

**Package exports** (from `apps/white-label-vue/package.json`):

```json
{
  "exports": {
    "./app": "./src/app.ts",
    "./vite.config.base": "./vite.config.base.ts",
    "./src/*": "./src/*"
  }
}
```

**App factory** (`apps/white-label-vue/src/app.ts`):

```typescript
export interface WhiteLabelAppOptions {
  /** Route definitions (tenant + white-label merged) */
  routes: RouteRecordRaw[]
  /** Optional override for the root App.vue shell */
  appShell?: () => Promise<{ default: Component }>
  /** Per-product metadata overrides keyed by product name */
  metaMap?: Record<string, ProductMeta>
}

export interface WhiteLabelApp {
  app: ReturnType<typeof createApp>
  router: ReturnType<typeof createRouter>
}

export async function createWhiteLabelApp(
  opts: WhiteLabelAppOptions,
): Promise<WhiteLabelApp> {
  if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
    const { worker } = await import('@repo/infra/mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  const AppShell = opts.appShell
    ? (await opts.appShell()).default
    : (await import('./App.vue')).default

  const router = createRouter({
    history: createWebHashHistory(),
    routes: opts.routes,
  })
  const app = createApp(AppShell)
  app.use(router)

  if (opts.metaMap) {
    app.provide(META_MAP_INJECTION_KEY, opts.metaMap)
  }

  return { app, router }
}
```

**Entry** (`apps/white-label-vue/src/main.ts`):

```typescript
import '@repo/ui/styles'
import '@repo/ui/styles/themes/default'
import './styles'
import { createWhiteLabelApp } from './app'
import { routes } from './routes'
import { frameworkMap } from '../metadata'

createWhiteLabelApp({ routes, metaMap: frameworkMap }).then(({ app }) =>
  app.mount('#app'),
)
```

**Routes** (`apps/white-label-vue/src/routes.ts`):

```typescript
export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'products', component: ProductsPage },
  {
    path: '/components',
    name: 'components',
    component: () => import('./pages/ComponentsPage.vue'),
  },
]
```

**Shared Vite config** (`apps/white-label-vue/vite.config.base.ts`):

```typescript
export interface WhiteLabelViteOptions {
  /** Tenant component directories — scanned BEFORE white-label defaults, so they win on name clash */
  componentDirs?: string[]
  /** Tenant auto-import directories (e.g., ['./src/composables']) */
  autoImportDirs?: string[]
}

export function defineWhiteLabelViteConfig(
  opts: WhiteLabelViteOptions = {},
): UserConfig {
  return defineConfig({
    plugins: [
      vue({
        template: {
          compilerOptions: { isCustomElement: (tag) => tag.startsWith('fe-') },
        },
      }),
      AutoImport({
        imports: ['vue', 'vue-router'],
        dirs: [
          ...(opts.autoImportDirs ?? []),
          resolve(layerSrc, 'composables'),
        ],
      }),
      Components({
        dirs: [
          ...(opts.componentDirs ?? []),
          resolve(layerSrc, 'components'),
          resolve(layerSrc, 'pages'),
        ],
      }),
    ],
  })
}
```

**Vite config entry** (`apps/white-label-vue/vite.config.ts`):

```typescript
import { defineWhiteLabelViteConfig } from './vite.config.base'
export default defineWhiteLabelViteConfig()
```

### Tenant Consumption

Tenant apps consume the white-label layer as a workspace dependency, importing both factories:

**Tenant Vite config** (`apps/fake-plants-vue/vite.config.ts`):

```typescript
import { defineWhiteLabelViteConfig } from 'white-label-vue/vite.config.base'
export default defineWhiteLabelViteConfig({
  componentDirs: ['./src/components'],
})
```

**Tenant entry** (`apps/fake-plants-vue/src/main.ts`):

```typescript
import '@repo/ui/styles'
import '@repo/ui/styles/themes/default'
import 'white-label-vue/src/styles'
import { createWhiteLabelApp } from 'white-label-vue/app'
import { plantsMap } from '../metadata'
import './styles'

createWhiteLabelApp({
  routes: [
    {
      path: '/',
      name: 'products',
      component: () => import('white-label-vue/src/pages/ProductsPage.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('./pages/AboutPage.vue'),
    },
  ],
  appShell: () => import('./App.vue'),
  metaMap: plantsMap,
}).then(({ app }) => app.mount('#app'))
```

Key points:

- Tenant provides its own `routes` array (can reuse white-label pages via `white-label-vue/src/*` imports, or override with local components)
- `componentDirs` in Vite config: tenant dirs listed BEFORE white-label dirs → tenant components win on name clash
- Optional `appShell` in `createWhiteLabelApp`: if omitted, white-label `App.vue` (nav + RouterView) is used
- Tenant can also override auto-imports via `autoImportDirs` (tenant dirs listed first, white-label composables appended)

### Presenter Layer (dedicated package)

Presenters are now extracted to `packages/presenters/` — framework-agnostic, reusable across apps.

**Package:** `@repo/presenters`

**File:** `packages/presenters/src/product.presenter.ts`

```typescript
import type { Product } from '@repo/domain'

export interface ProductView {
  name: string
  title: string
  description: string
  image: string
  imageFamily: string
  previousPrice?: string
  price: string
  rate: number
}

export interface ProductMeta {
  title: string
  description: string
  image: string
  imageFamily: string
}

export function toProductView(
  product: Product,
  metaMap?: Record<string, ProductMeta>,
): ProductView {
  const override = metaMap?.[product.name]
  const fallback = {
    title: product.name,
    description: '',
    image: 'code',
    imageFamily: 'classic',
  }
  const meta = override ?? fallback

  return {
    name: product.name,
    title: meta.title,
    description: meta.description,
    image: meta.image,
    imageFamily: meta.imageFamily,
    previousPrice: product.previousPrice
      ? `$${product.previousPrice}`
      : undefined,
    price: product.price ? `$${product.price}` : 'Free',
    rate: product.rate,
  }
}

export function toProductViewList(
  products: Product[],
  metaMap?: Record<string, ProductMeta>,
): ProductView[] {
  return products.map((p) => toProductView(p, metaMap))
}
```

Presenter adds UI fields (`title`, `description`, `image`, `imageFamily`, formatted `price`/`previousPrice`). Pure functions, no Vue dependency.

### Composable Layer

Composables orchestrate data fetching → presenting → state management. Now imports presenter from `@repo/presenters`.

**File:** `apps/white-label-vue/src/composables/useProducts.ts`

```typescript
import type { ProductView, ProductMeta } from '@repo/presenters'
import { useAsyncState, useMemoize } from '@vueuse/core'
import { META_MAP_INJECTION_KEY } from '../app'
import { getProducts } from '@repo/infra'
import { toProductViewList } from '@repo/presenters'

type FetchOptions = { bypass?: boolean }

const getCachedProducts = useMemoize(
  async (metaMap: Record<string, ProductMeta> | undefined) => {
    const { data } = await getProducts()
    return toProductViewList(data, metaMap)
  },
  { getKey: () => 'products' },
)

export function useProducts() {
  const metaMap = inject<Record<string, ProductMeta> | undefined>(
    META_MAP_INJECTION_KEY,
    undefined,
  )

  const {
    state,
    isLoading,
    error: rawError,
    execute,
  } = useAsyncState<ProductView[], [FetchOptions?]>(
    (opts) => {
      const fn = opts?.bypass ? getCachedProducts.load : getCachedProducts
      return fn(metaMap)
    },
    [],
    {
      immediate: true,
      resetOnExecute: false,
    },
  )

  const error = computed(() => {
    if (!rawError.value) return undefined
    return rawError.value instanceof Error
      ? rawError.value.message
      : 'Failed to load products'
  })

  return {
    fetch: (opts?: FetchOptions) => execute(0, opts),
    products: state,
    loading: isLoading,
    error,
  }
}

// Test helper — clears module-scoped memoize cache between test runs
export function clearProductsCache() {
  getCachedProducts.clear()
}
```

Pattern:

1. `useMemoize` caches fetch results keyed by unique key (`'products'`), deduplicates concurrent calls
2. `useAsyncState` from `@vueuse/core` manages async lifecycle — calls memoized fn on each execution
3. `bypass: true` option skips cache (calls `.load()` instead), used for manual refresh
4. `clearProductsCache()` exported test helper clears memoize cache between test runs
5. Error derived via `computed` from raw error ref

### Page Layer

Pages compose fe-\* components with data from composables.

**File:** `apps/white-label-vue/src/pages/ProductsPage.vue`

```vue
<script setup lang="ts">
import '@repo/ui/fe-icon'
import '@repo/ui/fe-rating'
import '@repo/ui/fe-card'
import '@repo/ui/fe-async-content'

const { products, loading, error } = useProducts()
</script>

<template>
  <div class="products-page">
    <h1 class="products-page__title">Free Bundles by Frameworks</h1>

    <fe-async-content :loading="loading" :error="error">
      <p slot="loading">Loading...</p>
      <p slot="error">{{ error }}</p>

      <div class="products-page__grid">
        <fe-card v-for="product in products" :key="product.name">
          <fe-icon
            slot="media"
            :name="product.image"
            :family="product.imageFamily"
          />
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

Follow one complete bootstrap→request→render cycle through all layers:

```
main.ts
  │
  │ imports WA styles & theme
  │ calls createWhiteLabelApp({ routes, metaMap: frameworkMap })
  │
  ▼
createWhiteLabelApp()
  │
  │ [dev] MSW worker.start() if VITE_ENABLE_MOCKS=true
  │ imports App.vue shell
  │ creates hash router with provided routes
  │ creates Vue app, installs router
  │ provides metaMap via app.provide(META_MAP_INJECTION_KEY)
  │ returns { app, router }
  │
  ▼
app.mount('#app')
  │
  │ ProductsPage.vue is rendered at route '/'
  │
  ▼
ProductsPage.vue
  │
  │ <script setup> calls useProducts()
  │
  ▼
useProducts() composable (apps/white-label-vue/src/composables/useProducts.ts)
  │
  │ injects metaMap via META_MAP_INJECTION_KEY
  │ initializes useAsyncState({ immediate: true }) → fires getCachedProducts (useMemoize)
  │   useMemoize caches result keyed by 'products', dedupes concurrent calls
  │
  ▼
useAsyncState inner async function:
  │
  │   const { data } = await getProducts()
  │
  ▼
getProducts() (packages/infra/src/adapters/get-products.adapter.ts)
  │
  │   fetch(`${VITE_API_URL}/products`, { headers: { 'x-tenant-id': tenantId } })
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
toProductViewList(data, metaMap) (packages/presenters/src/product.presenter.ts)
  │
  │   Product[] → ProductView[]
  │   Each Product gets: title, description, image, imageFamily, formatted price
  │   metaMap enriches with tenant-specific metadata (plant names, framework logos)
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
  │     <fe-icon slot="media" :name="product.image" :family="product.imageFamily" />
  │     <h2>{{ product.title }}</h2>
  │     <p>{{ product.description }}</p>
  │     <fe-rating :value="product.rate" readonly />
  │     <strong>Free</strong>
  │
  ▼
Browser paints shadow-DOM-styled fe-* components wrapping wa-* elements
```

**Layer responsibilities in this trace:**

| Step | Layer            | File                                 | What happens                             |
| ---- | ---------------- | ------------------------------------ | ---------------------------------------- |
| 1    | App (Page)       | `ProductsPage.vue` (white-label-vue) | Calls composable, binds refs to template |
| 2    | App (Composable) | `useProducts.ts` (white-label-vue)   | Orchestrates async data flow, useMemoize caching |
| 3    | Infra            | `get-products.adapter.ts` (infra)    | HTTP fetch, error handling               |
| 4    | Domain           | `Product.ts` (domain)                | Type contract for response shape         |
| 5    | Presenters       | `product.presenter.ts` (presenters)  | Transforms domain → view model           |
| 6    | App (Composable) | `useProducts.ts` (white-label-vue)   | Stores result in reactive state, derives error via computed |
| 7    | App (Page)       | `ProductsPage.vue` (white-label-vue) | Renders fe-\* components with view data  |
| 8    | UI               | `fe-*.ts` (ui)                       | Wraps WA elements, shadow DOM render     |

---

## 7. Import Convention Reference

| Source                 | Target                             | How                                  | Example                                                                         |
| ---------------------- | ---------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| `@repo/presenters`     | `@repo/domain`                     | Import types directly                | `import type { Product } from "@repo/domain"`                                   |
| `@repo/infra`          | `@repo/domain`                     | Import types directly                | `import type { Product } from "@repo/domain"`                                   |
| `@repo/ui`             | WA                                 | npm dep (not in monorepo)            | `import '@awesome.me/webawesome/dist/components/button/button.js'`              |
| `apps/white-label-vue` | `@repo/domain`                     | Import types for type safety         | `import type { Product } from '@repo/domain'`                                   |
| `apps/white-label-vue` | `@repo/infra`                      | Import data adapters                 | `import { getProducts } from "@repo/infra"`                                     |
| `apps/white-label-vue` | `@repo/presenters`                 | Import view-model transformers       | `import { toProductViewList } from "@repo/presenters"`                          |
| `apps/white-label-vue` | `@repo/ui`                         | Side-effect import (CE registration) | `import "@repo/ui/fe-card"`                                                     |
| `apps/white-label-vue` | `@vueuse/core`                     | Import composables                   | `import { useAsyncState } from "@vueuse/core"`                                  |
| `apps/*` (tenant)      | `white-label-vue/app`              | Import app factory                   | `import { createWhiteLabelApp } from 'white-label-vue/app'`                     |
| `apps/*` (tenant)      | `white-label-vue/vite.config.base` | Import shared Vite config            | `import { defineWhiteLabelViteConfig } from 'white-label-vue/vite.config.base'` |
| `apps/*` (tenant)      | `white-label-vue/src/*`            | Import white-label pages/components  | `() => import('white-label-vue/src/pages/ProductsPage.vue')`                    |

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

3.  Presenter → packages/presenters/src/user.presenter.ts
                toUserViewList(users: User[]): UserView[]
                Add UI-specific fields (avatar, label, etc.)
                Export from packages/presenters/src/index.ts

4.  Composable → apps/white-label-vue/src/composables/useUsers.ts
                 useAsyncState → getUsers() → toUserViewList()
                 Import presenter from @repo/presenters
                 Return { users, loading, error, fetch }

5.  Page       → apps/white-label-vue/src/pages/UsersPage.vue
                 Import fe-* components, call useUsers(), render

6.  Route     → apps/white-label-vue/src/routes.ts
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
- [`AGENTS.md`](../../AGENTS.md) — monorepo agent guide, commands, gotchas
- [`packages/presenters/`](../../packages/presenters/) — presenter package
- [`apps/white-label-vue/src/app.ts`](../../apps/white-label-vue/src/app.ts) — app factory
- [`apps/white-label-vue/vite.config.base.ts`](../../apps/white-label-vue/vite.config.base.ts) — shared Vite config
- [`.opencode/references/webawesome/SKILL.md`](../../.opencode/references/webawesome/SKILL.md) — WA Agent Skill (component API docs)
