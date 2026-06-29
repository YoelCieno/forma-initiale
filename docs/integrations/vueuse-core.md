# VueUse Core Integration

How `@vueuse/core` composables integrate into the forma-initiale white-label-vue app — usage, patterns, conventions.

---

## 1. Purpose

Why VueUse in this project:

- **Reduces boilerplate** for common reactive patterns (async state, timers, event listeners)
- **Well-tested, tree-shakeable** — import only what you use, zero overhead for unused imports
- **Vue 3 native** — works directly with Composition API (`ref`, `computed`, lifecycle hooks)
- **Boundary-enforcing** — VueUse lives only in `apps/white-label-vue/`, never in `packages/` (hexagonal layer rule)

VueUse composables handle Vue-reactivity concerns. They do not replace infra-layer adapters (HTTP I/O, storage, etc.).

---

## 2. Currently Used Composables

| Composable      | Where            | Purpose                                      | Options used                   |
| --------------- | ---------------- | -------------------------------------------- | ------------------------------ |
| `useAsyncState` | `useProducts.ts` | Async data fetching with loading/error state | `{ immediate: true, onError }` |

Only one VueUse composable is used today. This document will grow as new composables are added.

---

## 3. `useAsyncState` Pattern

The core async data-fetching pattern. Source: `apps/white-label-vue/src/composables/useProducts.ts`.

```typescript
import { useAsyncState } from '@vueuse/core'

export function useProducts() {
  const formattedError = ref<string | undefined>()

  const { state, isLoading, execute } = useAsyncState<ProductView[]>(
    async () => {
      formattedError.value = undefined
      const { data } = await getProducts()
      return toProductViewList(data)
    },
    [],
    {
      immediate: true,
      onError(e: unknown) {
        formattedError.value =
          e instanceof Error ? e.message : 'Failed to load products'
      },
    },
  )

  return {
    products: state,
    loading: isLoading,
    error: formattedError,
    fetch: () => execute(),
  }
}
```

### Contract

| `useAsyncState` return | Composable export | Type                           | Description                                                |
| ---------------------- | ----------------- | ------------------------------ | ---------------------------------------------------------- |
| `state`                | `products`        | `Ref<ProductView[]>`           | Last successful result (typed via generic)                 |
| `isLoading`            | `loading`         | `Ref<boolean>`                 | `true` during fetch (starts `true` with `immediate: true`) |
| `execute`              | `fetch`           | `() => Promise<ProductView[]>` | Re-fetches on demand (retry / refresh / pagination)        |
| (unused)               | `error`           | `Ref<string \| undefined>`     | Normalized error message (see §4)                          |

### Key details

- **`immediate: true`** — fires on setup, no `onBeforeMount` / `onMounted` needed
- **`state` initial value** — second argument (`[]` for arrays, `null` for singletons) ensures template safety before first data arrives
- **`execute` return** — the raw `execute()` from VueUse returns a `Promise<{ state, isLoading }>`. The composable wraps it in `fetch: () => execute()` for a cleaner API (callers get the data or let the ref drive rendering)
- **`error` from VueUse is unused** — the `error` property on the return value of `useAsyncState` is typed as `unknown`. We handle errors via `onError` instead (see §4)

---

## 4. Error Handling Convention

The standard pattern across all async composables:

```typescript
const formattedError = ref<string | undefined>()

const { state, isLoading } = useAsyncState(
  async () => {
    formattedError.value = undefined // clear before each fetch
    const { data } = await getProducts()
    return data
  },
  [],
  {
    immediate: true,
    onError(e: unknown) {
      // Normalize to string — infra may throw various error types
      formattedError.value =
        e instanceof Error ? e.message : 'Failed to load products'
    },
  },
)

return { products: state, loading: isLoading, error: formattedError }
```

### Why this pattern

- **`error` from VueUse is `unknown`** — hard to bind directly in templates (needs type narrowing)
- **`formattedError` is `string | undefined`** — simple conditional rendering: `v-if="error"` / `:error="error"`
- **`onError` is the safe place** — avoid try/catch inside the async function. Let the promise reject and handle it in `onError`. Keeps the data flow clean
- **Clear before fetch** — `formattedError.value = undefined` at the top of the async function ensures stale errors don't persist across retries

### What not to do

```typescript
// ❌ AVOID: try/catch inside the async function when onError is available
;async () => {
  try {
    const { data } = await getProducts()
    return data
  } catch (e) {
    formattedError.value = 'Something went wrong'
    return [] // return value ignored by useAsyncState on error
  }
}

// ✅ DO: let the promise reject, handle in onError
;async () => {
  const { data } = await getProducts()
  return data
}
```

---

## 5. Template Integration

Composable return values map directly to `fe-async-content` props:

```vue
<template>
  <fe-async-content :loading="loading" :error="error">
    <p slot="loading">Loading products...</p>
    <p slot="error">{{ error }}</p>

    <div v-for="product in products" :key="product.id">
      <!-- render product data -->
    </div>
  </fe-async-content>
</template>
```

| Composable export | `fe-async-content` prop | Type                  |
| ----------------- | ----------------------- | --------------------- |
| `loading`         | `:loading`              | `boolean`             |
| `error`           | `:error`                | `string \| undefined` |
| `products`        | default slot iteration  | `T[]`                 |

Reference: `docs/integrations/layer-wiring.md` §5 (App Layer → Page Layer) for the full component template.

---

## 6. Adding a New Composable with VueUse

### Checklist

1. **No install needed** — `@vueuse/core` already in `apps/white-label-vue/package.json` (`^14.3.0`)
2. **Create file** — `apps/white-label-vue/src/composables/use<Feature>.ts`
3. **Import VueUse composable** from `@vueuse/core`
4. **Follow the pattern:**

   | Use case               | VueUse composable  | Notes                                       |
   | ---------------------- | ------------------ | ------------------------------------------- |
   | Async fetch            | `useAsyncState`    | Always with `immediate: true` and `onError` |
   | Polling / interval     | `useIntervalFn`    | Wrap `execute` for periodic refresh         |
   | Debounced input        | `useDebounceFn`    | For search-as-you-type                      |
   | Window events          | `useEventListener` | Cleanup on unmount automatically            |
   | Local reactive storage | `useStorage`       | Use only for UI preferences (see §7)        |
   | Timers                 | `useTimeoutFn`     | For delayed actions                         |

5. **Return shape:** always `{ data, loading, error }` for async, or `{ value }` for sync. Keep it predictable
6. **Test** — create `apps/white-label-vue/src/composables/use<Feature>.spec.ts`

### Return shape convention

```typescript
// Async composables
return {
  items: state, // the data (plural for arrays, singular for single items)
  loading: isLoading,
  error: formattedError,
  fetch: () => execute(), // manual re-fetch
}

// Sync composables
return {
  value: someRef,
}
```

---

## 7. What NOT to Use

VueUse composables that would break the hexagonal architecture:

| Composables                                                  | Reason                                                                                                                                       |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `useFetch` / `useAxios`                                      | HTTP I/O must stay in `@repo/infra`. Infra adapters own fetch logic, not app composables                                                     |
| `useLocalStorage` / `useStorage`                             | Couples composable to browser storage. If persistence is needed, define a domain port and implement it as an infra adapter                   |
| `useGeolocation` / `useMediaControls` / browser API wrappers | These are fine in apps but must be wrapped in a composable that isolates the platform dependency. Never use them directly in page components |

**The rule:** VueUse composables that interact with Vue reactivity system are fine in `apps/white-label-vue`. VueUse composables that handle I/O (fetch, storage, etc.) must not duplicate infra-layer adapters. If a VueUse composable wraps a browser API not yet abstracted in infra, wrap it in a thin app-level composable that could later be swapped.

---

## 8. Testing VueUse Composables

Testing pattern from `useProducts.spec.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'

describe('useProducts', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Mount harness — mounts a dummy component that calls the composable in setup
  function createTestHarness() {
    return defineComponent({
      setup() {
        return useProducts()
      },
      template: '<div></div>',
    })
  }

  it('starts with loading true, empty products, no error', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})))

    const wrapper = mount(createTestHarness())

    expect(wrapper.vm.loading).toBe(true)
    expect(wrapper.vm.products).toEqual([])
    expect(wrapper.vm.error).toBeUndefined()
  })

  it('sets products after successful fetch', async () => {
    const mockResponse = { data: [...], total: 2 }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockOkResponse(mockResponse)))

    const wrapper = mount(createTestHarness())

    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })
    expect(wrapper.vm.products).toHaveLength(2)
    expect(wrapper.vm.error).toBeUndefined()
  })

  it('handles errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, status: 500,
    }))

    const wrapper = mount(createTestHarness())

    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })
    expect(wrapper.vm.products).toEqual([])
    expect(wrapper.vm.error).toBe('Failed to fetch products: HTTP 500')
  })

  it('fetch can be called manually', async () => {
    // First fetch resolves, then manual fetch re-fires
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockOkResponse(firstData)))
    const wrapper = mount(createTestHarness())
    await vi.waitFor(() => {
      expect(wrapper.vm.loading).toBe(false)
    })

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockOkResponse(newData)))
    wrapper.vm.fetch()

    await vi.waitFor(() => {
      expect(wrapper.vm.products).toHaveLength(1)
    })
  })
})
```

### Key testing principles

- **Mock infra** — stub the platform boundary (`fetch`), not VueUse internals
- **Test harness pattern** — `defineComponent` + `mount` wraps composable in a real Vue component lifecycle
- **Test refs, not internals** — assert on the returned `loading`, `products`, `error` refs via `wrapper.vm`
- **Never-resolving promise** — `new Promise(() => {})` keeps `loading=true` without timing out
- **`vi.waitFor`** — await async state transitions. Never use arbitrary `setTimeout`
- **`beforeEach` restore** — always call `vi.restoreAllMocks()` to isolate tests
- **Do NOT mock `@vueuse/core`** — the composable is the unit under test

---

## 9. References

- [VueUse docs](https://vueuse.org/) — full API reference
- [`useAsyncState` API](https://vueuse.org/core/useAsyncState/) — options, return types, recipes
- [`apps/white-label-vue/src/composables/useProducts.ts`](../../apps/white-label-vue/src/composables/useProducts.ts) — reference implementation
- [`apps/white-label-vue/src/composables/useProducts.spec.ts`](../../apps/white-label-vue/src/composables/useProducts.spec.ts) — reference tests
- [`docs/integrations/layer-wiring.md`](layer-wiring.md) — composable role in the layer stack (§5)
- [`docs/ADRS/design-patterns.md`](../ADRS/design-patterns.md) — SoC+CQS (composables own command/query orchestration)
