# API Mocking — MSW in forma-initiale

How MSW (Mock Service Worker) v2.x is set up and used across the monorepo — handler patterns, test integration, and dev environment.

---

## 1. Architecture — Mocking as Infra Concern

MSW intercepts network requests at the service worker level (browser) or Node level (tests). All handlers live in `packages/infra/src/mocks/`, owned by `@repo/infra`.

```
packages/infra/
├── src/
│   ├── adapters/         ← real fetch adapters (getProducts, etc.)
│   └── mocks/            ← MSW handlers, server, worker, factories
└── vitest.config.ts
```

Why this placement:

- **Mock data lives close to the adapter that fetches it** — handlers mirror the API contract of co-located adapters
- **Apps consume mocked data transparently** — same `getProducts()` import, same `@repo/domain` types, same response envelope
- **No mocking code leaks into apps** — apps don't know MSW exists; they import infra adapters normally
- **Single source of truth** for mock handlers: `@repo/infra` exposes `./mocks/server` (tests) and `./mocks/browser` (dev)

Layer dependency order:

```
domain → infra → packages/ui → apps/*
```

MSW is an infra-layer tool. infra depends on domain (types). No other layer imports MSW.

---

## 2. Handler Structure

### Directory layout

```
packages/infra/src/mocks/
├── constants/
│   └── index.ts        ← Tenant configs, name pools, RATE_VALUE, DEV_DELAY
├── data/
│   └── mocked-data.json ← Tenant name/config seed data
├── models/
│   └── index.ts        ← TenantConfig, PriceConfig types
├── factories/
│   └── product.ts      ← Test data factories (tenant-aware, deterministic)
├── handlers/
│   ├── products.ts     ← Product-specific handlers
│   ├── products.spec.ts← Handler tests
│   ├── products.test-delay.spec.ts ← Dev-delay gate tests (vitest only)
│   └── index.ts        ← Barrel that collects all handlers
├── helpers.ts          ← mockOkResponse, delayDev (DEV_DELAY gated off in test mode)
├── server.ts           ← MSW Node server for Vitest
├── browser.ts          ← MSW browser worker for Vite dev
└── index.ts            ← Public barrel: exports server, worker, handlers, factories
```

### Handler example — `products.ts`

Source: `packages/infra/src/mocks/handlers/products.ts`

```typescript
import { http, HttpResponse } from 'msw'
import type { Product } from '@repo/domain'
import {
  buildProduct,
  buildProductList,
  resetProductCounter,
} from '../factories/product'
import { delayDev } from '../helpers'

export const productHandlers = [
  http.get('*/api/products', async ({ request }) => {
    await delayDev()
    const tenantId = request.headers.get('x-tenant-id') || 'wl'
    resetProductCounter()
    const products = buildProductList(tenantId)
    return HttpResponse.json({ data: products, total: products.length })
  }),

  http.get('*/api/products/:id', async ({ params, request }) => {
    await delayDev()
    const tenantId = request.headers.get('x-tenant-id') || 'wl'
    const products = buildProductList(tenantId)
    const { id } = params
    const product = products.find((p: Product) => p.id === id)

    if (!product) {
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: product })
  }),

  http.post('*/api/products', async ({ request }) => {
    await delayDev()
    const tenantId = request.headers.get('x-tenant-id') || 'wl'
    const body = (await request.json()) as Partial<Product>
    const newProduct = buildProduct(tenantId, {
      name: body.name,
      previousPrice: body.previousPrice,
      price: body.price,
      rate: body.rate,
    })

    return HttpResponse.json({ data: newProduct }, { status: 201 })
  }),
]
```

Pattern notes:

| Aspect            | Convention                                                                          |
| ----------------- | ----------------------------------------------------------------------------------- |
| URL matching      | Wildcard `*/api/products` — works across environments regardless of base URL domain |
| Response envelope | `{ data: T \| T[], total?: number }` — matches real API contract                    |
| MSW v2 API        | `http.get()` / `http.post()` / `HttpResponse.json()` — NOT `ctx` or `req` from v1   |
| Tenant scoping    | Each handler reads `x-tenant-id` header (default `'wl'`); data generated per tenant |
| Dev delay         | `await delayDev()` gates `DEV_DELAY` (1000ms) off when `import.meta.env.MODE === 'test'` |
| Stateless GET     | Data built per request via `buildProductList(tenantId)` — no module-level mutable `let` state |
| Factory imports   | `buildProduct()`, `buildProductList()`, `resetProductCounter()` from `../factories/product` |
| File extension    | Extensionless imports (TS `moduleResolution: "Bundler"`)                             |

### Handler index — `handlers/index.ts`

Source: `packages/infra/src/mocks/handlers/index.ts`

```typescript
import { productHandlers } from './products.js'

export const handlers = [...productHandlers]
```

Every new feature handler gets imported here and spread into the `handlers` array.

### Factories — `factories/product.ts`

Source: `packages/infra/src/mocks/factories/product.ts`

```typescript
import type { Product } from '@repo/domain'
import { PRODUCT_TENANT_CONFIGS, RATE_VALUE } from '../constants'
import { PriceConfig } from '../models'

let counter = 0

type TenantId = keyof typeof PRODUCT_TENANT_CONFIGS

function isValidTenant(id: string): id is TenantId {
  return id in PRODUCT_TENANT_CONFIGS
}

function calculatePrice(counter: number, config?: PriceConfig): number {
  if (!config) return 0
  return parseFloat((config.base + counter * config.increment).toFixed(2))
}

function getPriceRecord(counter: number, tenantId: TenantId): Product {
  const config = PRODUCT_TENANT_CONFIGS[tenantId]
  return {
    id: `prod-${counter}`,
    name: config.names[(counter - 1) % config.names.length],
    previousPrice: calculatePrice(counter, config.previousPrice),
    price: calculatePrice(counter, config.price),
    rate: RATE_VALUE[config.rateType](counter),
  }
}

export function buildProduct(
  tenantId: TenantId = 'wl',
  overrides?: Partial<Product>,
): Product {
  if (!isValidTenant(tenantId)) {
    throw new Error(`Unknown tenant: ${tenantId}`)
  }

  counter++
  return {
    ...getPriceRecord(counter, tenantId),
    ...overrides,
  }
}

export function buildProductList(tenantId: TenantId): Product[] {
  const count = PRODUCT_TENANT_CONFIGS[tenantId].names.length
  return Array.from({ length: count }, () => buildProduct(tenantId))
}

export function resetProductCounter(): void {
  counter = 0
}
```

Factories produce deterministic data without faker — sequential counter + per-tenant name pool from `constants/` (seeded by `data/mocked-data.json`). `resetProductCounter()` ensures isolated test runs. `RATE_VALUE` supports `cyclic` (`(counter % 5) + 1`) or `random` rate types per tenant. Unknown tenant IDs throw.

---

## 3. Test Setup (Vitest)

### MSW Node server — `server.ts`

Source: `packages/infra/src/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers/index.js'

export const server = setupServer(...handlers)
```

### Vitest configuration — `packages/infra/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.spec.ts', 'src/mocks/**/*.spec.ts'],
    env: {
      VITE_API_URL: 'https://api.example.com/api',
    },
  },
})
```

The `VITE_API_URL` env var is set so adapters that read `import.meta.env.VITE_API_URL` resolve correctly in tests.

### Per-test MSW lifecycle — handler specs use inline server

Handler specs (`products.spec.ts`) create their own `server` instance and manage lifecycle directly:

```typescript
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import type { Product } from '@repo/domain'
import { handlers } from './index.js'

const BASE_URL = 'http://localhost'
const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('products API handlers', () => {
  it('GET /api/products returns a list of products', async () => {
    const res = await fetch(`${BASE_URL}/api/products`)
    expect(res.status).toBe(200)

    const body = (await res.json()) as { data: Product[]; total: number }
    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.total).toBe(body.data.length)
  })

  it('GET /api/products/:id returns 404 for unknown ID', async () => {
    const res = await fetch(`${BASE_URL}/api/products/non-existent-id`)
    expect(res.status).toBe(404)
    const body = (await res.json()) as { error: string }
    expect(body).toHaveProperty('error')
  })

  it('POST /api/products creates and returns a new product', async () => {
    const newProduct = {
      name: 'Test Product',
      previousPrice: 49.99,
      price: 0,
      rate: 4,
    }
    const res = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    })
    expect(res.status).toBe(201)
    const body = (await res.json()) as { data: Product }
    expect(body.data.name).toBe('Test Product')
    expect(body.data.id).toMatch(/^prod-\d+$/)
  })
})
```

Key setup decisions:

| Setting                                                     | Purpose                                                             |
| ----------------------------------------------------------- | ------------------------------------------------------------------- |
| `server.listen()` in `beforeAll`                            | Start MSW before first test                                         |
| `server.resetHandlers()` in `afterEach`                     | Remove any per-test `server.use()` overrides — keeps tests isolated |
| `server.close()` in `afterAll`                              | Clean teardown after suite                                          |
| `onUnhandledRequest` not set (defaults to `'warn'` in Node) | Warns about unmocked requests — helps catch missing handlers        |
| `BASE_URL = 'http://localhost'`                             | Wildcard patterns (`*/api/products`) match regardless of base       |

### Integration test setup (white-label-vue)

Source: `apps/white-label-vue/vitest.setup.ts`

The app-layer Vitest setup (`vitest.setup.ts`) does NOT include MSW. It only configures Vue Test Utils custom element handling and mocks `@repo/ui/*` components:

```typescript
import { vi } from 'vitest'
import { config } from '@vue/test-utils'

config.global.config.compilerOptions = {
  isCustomElement: (tag: string) => tag.startsWith('fe-'),
}

vi.mock('@repo/ui/fe-button', () => ({}))
vi.mock('@repo/ui/fe-icon', () => ({}))
vi.mock('@repo/ui/fe-card', () => ({}))
```

MSW is not needed in app-layer Vitest config because infra mock handlers would be tested at the infra layer. App tests exercise the composable/page layer, which depends on `@repo/infra` adapters already tested separately.

---

## 4. Dev Environment Setup

### MSW browser worker — `browser.ts`

Source: `packages/infra/src/mocks/browser.ts`

```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers/index.js'

export const worker = setupWorker(...handlers)
```

### Loading in Vite dev — `main.ts`

Source: `apps/white-label-vue/src/main.ts`

```typescript
import '@repo/ui/styles'
import '@repo/ui/styles/themes/default'
import './styles'
import { createWhiteLabelApp } from './app'
import { routes } from './routes'

createWhiteLabelApp({ routes }).then(({ app }) => app.mount('#app'))
```

### Environment flag — `.env`

Source: `apps/white-label-vue/.env`

```env
# API base URL (no trailing slash)
VITE_API_URL=https://api.example.com/api

# Enable MSW mock service worker in development
VITE_ENABLE_MOCKS=true
```

Flow:

1. `main.ts` checks `import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true'`
2. Dynamically imports `@repo/infra/mocks/browser` — keeps MSW code out of production bundles
3. Calls `worker.start({ onUnhandledRequest: 'bypass' })` — bypasses (doesn't warn on) any request not covered by a handler
4. After MSW is ready, mounts the Vue app

Set `VITE_ENABLE_MOCKS=false` in `.env.local` to hit real APIs during dev.

### Service worker file

MSW browser mode requires the mock service worker script at the public root. This is generated by:

```bash
bun x msw init apps/white-label-vue/public/
```

This creates `apps/white-label-vue/public/mockServiceWorker.js`. The `--save` flag adds the path to `package.json` for future `msw init` calls.

---

## 5. Handler Patterns

### Success response

```typescript
http.get('*/api/products', ({ request }) => {
  const tenantId = request.headers.get('x-tenant-id') || 'wl'
  resetProductCounter()
  const data: Product[] = buildProductList(tenantId)
  return HttpResponse.json({ data, total: data.length })
})
```

### Single item response

```typescript
http.get('*/api/products/:id', async ({ params, request }) => {
  const tenantId = request.headers.get('x-tenant-id') || 'wl'
  const products = buildProductList(tenantId)
  const product = products.find((p) => p.id === params.id)
  if (!product) {
    return HttpResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return HttpResponse.json({ data: product })
})
```

### Error response

```typescript
http.get('*/api/products/:id', () => {
  return new HttpResponse(null, {
    status: 500,
    statusText: 'Internal Server Error',
  })
})
```

### Dynamic response based on request

```typescript
http.get('*/api/products', ({ request }) => {
  const url = new URL(request.url)
  const minPrice = url.searchParams.get('minPrice')
  const filtered = minPrice
    ? products.filter((p) => p.price >= Number(minPrice))
    : products
  return HttpResponse.json({ data: filtered, total: filtered.length })
})
```

### POST with body

```typescript
http.post('*/api/products', async ({ request }) => {
  const tenantId = request.headers.get('x-tenant-id') || 'wl'
  const body: Partial<Product> = await request.json()

  if (!body.name) {
    return HttpResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const newProduct = buildProduct(tenantId, body)
  return HttpResponse.json({ data: newProduct }, { status: 201 })
})
```

### Per-test override with `server.use()`

```typescript
import { http, HttpResponse } from 'msw'
import { server } from '@repo/infra/mocks/server'

it('handles server error', async () => {
  server.use(
    http.get('*/api/products', () => {
      return new HttpResponse(null, { status: 500 })
    }),
  )

  await expect(getProducts()).rejects.toThrow('Failed to fetch products')
})
```

---

## 6. Testing with MSW

Two testing approaches exist in the monorepo:

### 6a. Handler-level tests (infra)

Handler spec files live alongside handlers in `packages/infra/src/mocks/handlers/`. They create an inline MSW server and test responses directly:

```
packages/infra/src/mocks/handlers/
├── products.ts              ← handler definitions
├── products.spec.ts         ← handler tests
└── products.test-delay.spec.ts ← dev-delay gating tests (vitest mode only)
```

These tests verify:

- Correct status codes (200, 201, 404, 500)
- Response body shape matches `{ data, total }` envelope
- URL parameter matching (`:id`)
- POST body parsing and response
- Error scenarios

### 6b. Adapter-level tests (infra)

Tests for adapters like `get-products.adapter.ts` use the shared MSW server exported from `@repo/infra/mocks/server`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { getProducts } from '../adapters/get-products.adapter'
import { http, HttpResponse } from 'msw'
import { server } from '@repo/infra/mocks/server'

describe('getProducts', () => {
  it('returns products on success', async () => {
    const result = await getProducts()
    expect(result.data).toHaveLength(5)
    expect(result.data[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
    })
  })

  it('throws on server error', async () => {
    server.use(
      http.get('*/api/products', () => {
        return new HttpResponse(null, { status: 500 })
      }),
    )

    await expect(getProducts()).rejects.toThrow('Failed to fetch products')
  })
})
```

Adapter tests use `server.use()` to override specific handlers for error scenarios.

### MSW export paths

From `@repo/infra` package.json:

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./mocks/browser": "./src/mocks/browser.ts",
    "./mocks/server": "./src/mocks/server.ts",
    "./mocks/helpers": "./src/mocks/helpers.ts"
  }
}
```

Import paths:

| Import                                             | Target                  |
| -------------------------------------------------- | ----------------------- |
| `import { getProducts } from '@repo/infra'`         | Adapters                |
| `import { server } from '@repo/infra/mocks/server'` | Node MSW server (tests) |
| `import { worker } from '@repo/infra/mocks/browser'`| Browser MSW worker (dev)|
| `import { delayDev } from '@repo/infra/mocks/helpers'` | Dev-delay helper     |

> Note: `handlers`, `buildProduct`, etc. are re-exported from the internal barrel at `packages/infra/src/mocks/index.ts` but **not** exposed as a package subpath (`@repo/infra/mocks`). Infra-internal files import from relative paths; tests may import `./mocks` relatively.

---

## 7. Adding a New Handler

Checklist for adding a new feature handler (e.g., `packages/infra/src/mocks/handlers/categories.ts`):

1. **Create handler file** — `packages/infra/src/mocks/handlers/categories.ts`
   - Import `http, HttpResponse` from `msw`
   - Import domain types from `@repo/domain`
   - Export a named handler array (e.g., `export const categoryHandlers = [...]`)
   - Use wildcard URL patterns (`*/api/categories`)

2. **Add factory** (if needed) — `packages/infra/src/mocks/factories/category.ts`
   - Export `buildCategory(overrides?)`, `buildCategoryList(count?)`, `resetCategoryCounter()`

3. **Register in barrel** — `packages/infra/src/mocks/handlers/index.ts`

   ```typescript
   import { categoryHandlers } from './categories.js'
   export const handlers = [...productHandlers, ...categoryHandlers]
   ```

4. **Add handler tests** — `packages/infra/src/mocks/handlers/categories.spec.ts`
   - Inline `setupServer(...handlers)` with beforeAll/afterEach/afterAll
   - Test all CRUD operations + error cases

5. **No other files need changes** — `server.ts`, `browser.ts`, and exports barrel already pick up `handlers` dynamically

---

## 8. Troubleshooting

### "No handler matched" warning

MSW prints a warning when a `fetch` request doesn't match any registered handler.

```
[MSW] Warning: intercepted a request without a matching handler:
  GET http://localhost:3000/api/products
```

**Cause:** Request URL doesn't match any handler pattern.

**Fix:** Check the URL your adapter calls against handler patterns. Use wildcards (`*/api/products`) rather than absolute URLs (`http://localhost:3000/api/products`) to avoid environment mismatches.

### Cross-environment URL differences

Dev uses `https://api.example.com/api/products`, tests hit `http://localhost/api/products`. Handlers use `*/api/products` — the `*` wildcard matches any scheme, host, and port.

### Handler override not applied

If `server.use()` in a test doesn't seem to work:

```typescript
beforeEach(() => server.resetHandlers()) // missing?
```

**Fix:** Ensure `afterEach(() => server.resetHandlers())` is in your setup — keeps per-test overrides isolated and prevents stale handlers.

### Dev worker not starting

MSW browser worker (`mockServiceWorker.js`) must exist in the app's `public/` directory. Generate it:

```bash
bun x msw init apps/white-label-vue/public/
```

If the file is missing, `worker.start()` fails silently or throws. Check browser console for MSW startup logs.

---

## 9. References

- [MSW docs](https://mswjs.io/docs/)
- [`docs/decisions/api-mocking-strategy.md`](../decisions/api-mocking-strategy.md) — ADR explaining why MSW was chosen
- [`docs/integrations/layer-wiring.md`](./layer-wiring.md) — how infra + mocking fit in the layer stack
- [`packages/infra/src/mocks/`](../../packages/infra/src/mocks/) — source files
- [`apps/white-label-vue/src/bootstrap/app.ts`](../../apps/white-label-vue/src/bootstrap/app.ts) — dev bootstrap loading MSW worker (inside factory)
- [`apps/white-label-vue/.env`](../../apps/white-label-vue/.env) — env flags for mocking
