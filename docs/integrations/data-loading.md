# Async Data Loading Pattern

> Framework-agnostic pattern: async data lives in cached async-state primitives, never raw fetch in lifecycle hooks.

## Principle

Components never own raw `fetch` calls. Async data lives in a cached async-state primitive that outlives individual component instances. The primitive provides `loading`, `error`, and `value` signals — the component only binds and renders.

```
Component (thin)
  │ bind signals
  ▼
Async-state primitive (cached, reusable)
  │ calls port
  ▼
Infra port (getProducts)
  │
  ▼
Adapter (fetch / MSW)
```

### Rules

1. **Port-based loader** — the async-state loader calls an infra port (`getProducts`), not raw `HttpClient`/`fetch`. Keeps adapters swappable.
2. **Cache scope matches data scope** — shared across components → singleton. Per-navigation → route scope. Cache key by request params.
3. **Explicit reload** — provide `reload()` / `refetch()` for mutations. No implicit stale-data bugs.
4. **No lifecycle fetch** — no `ngOnInit` try/catch/finally, no `onMounted` + `ref` + manual state. The primitive handles all of it.

## Vue Implementation (`useProducts` composable)

```typescript
// composables/useProducts.ts
const getCachedProducts = useMemoize(async (metaMap) => {
  const { data } = await getProducts({ baseUrl, tenantId })
  return toProductViewList(data, metaMap)
}, { getKey: () => 'products' })

export function useProducts() {
  const metaMap = inject(META_MAP_INJECTION_KEY, undefined)

  const { state, isLoading, error: rawError, execute } = useAsyncState(
    (opts) => {
      const fn = opts?.bypass ? getCachedProducts.load : getCachedProducts
      return fn(metaMap)
    },
    [],
    { immediate: true, resetOnExecute: false },
  )

  const error = computed(() => {
    if (!rawError.value) return undefined
    return rawError.value instanceof Error
      ? rawError.value.message
      : 'Failed to load products'
  })

  return {
    fetch: (opts?) => execute(0, opts),
    products: state,
    loading: isLoading,
    error,
    clearCache: () => getCachedProducts.clear(),
  }
}
```

**Component usage:**

```typescript
const { products, loading, error } = useProducts()
```

## Angular Implementation (`ProductsService` + `resource()`)

```typescript
// services/products.service.ts
import { computed, Injectable, inject, resource } from '@angular/core'

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly metaMap = inject(META_MAP_INJECTION_KEY, { optional: true })

  private readonly catalog = resource({
    loader: async () => {
      const { data } = await getProducts({ baseUrl: environment.apiUrl, tenantId: environment.tenantId })
      return toProductViewList(data, this.metaMap ?? undefined)
    },
  })

  readonly items = computed((): ProductView[] => this.catalog.value() ?? [])
  readonly loading = this.catalog.isLoading
  readonly error = computed(() => {
    const e = this.catalog.error()
    return e ? e.message : undefined
  })
  readonly hasValue = this.catalog.hasValue
  readonly reload = () => this.catalog.reload()
}
```

**Component usage:**

```typescript
export class ProductsPage {
  private readonly catalog = inject(ProductsService)
  readonly products = this.catalog.items
  readonly loading = this.catalog.loading
  readonly error = this.catalog.error
}
```

**Template:**

```html
<fe-async-content [loading]="loading()" [error]="error()">
  <fe-loader slot="loading"></fe-loader>
  <p slot="error">{{ error() }}</p>
  <div class="products-page__grid">
    @for (product of products(); track product.id) {
      <app-product-card ... />
    }
  </div>
</fe-async-content>
```

## Framework Comparison

| Aspect | Vue | Angular |
|---|---|---|
| Primitive | Composable (`useProducts()`) | Injectable service (`ProductsService`) |
| Async state | `useAsyncState` from @vueuse | `resource()` built-in |
| Cache | `useMemoize` (module-level) | Singleton service (DI scope) |
| Refetch | `fetch({ bypass: true })` | `reload()` |
| Reactivity | `ref()` / `computed()` | `Signal<T>` |

## Why `resource()` over `httpResource()` (Angular)

- `httpResource` is for raw HTTP — requires `HttpClient`, no port abstraction
- `resource()` works with any async loader — fits hexagonal architecture
- `provideHttpClient()` still needed for interceptors even with `resource()`
