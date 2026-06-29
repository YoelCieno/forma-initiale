import type { ProductView, ProductMeta } from "@repo/presenters";
import { useAsyncState, useMemoize } from "@vueuse/core";
import { META_MAP_INJECTION_KEY } from "../app";
import { getProducts } from "@repo/infra";
import { toProductViewList } from "@repo/presenters";

type FetchOptions = { bypass?: boolean };

const getCachedProducts = useMemoize(
  async (metaMap: Record<string, ProductMeta> | undefined) => {
    const { data } = await getProducts();
    return toProductViewList(data, metaMap);
  },
  { getKey: () => "products" },
);

export function useProducts() {
  const metaMap = inject<Record<string, ProductMeta> | undefined>(
    META_MAP_INJECTION_KEY,
    undefined,
  );

  const {
    state,
    isLoading,
    error: rawError,
    execute,
  } = useAsyncState<ProductView[], [FetchOptions?]>(
    (opts) => {
      const fn = opts?.bypass ? getCachedProducts.load : getCachedProducts;
      return fn(metaMap);
    },
    [],
    {
      immediate: true,
      resetOnExecute: false,
    },
  );

  const error = computed(() => {
    if (!rawError.value) return undefined;
    return rawError.value instanceof Error
      ? rawError.value.message
      : "Failed to load products";
  });

  return {
    fetch: (opts?: FetchOptions) => execute(0, opts),
    products: state,
    loading: isLoading,
    error,
  };
}

// Test helper — clears module-scoped memoize cache between test runs
export function clearProductsCache() {
  getCachedProducts.clear();
}
