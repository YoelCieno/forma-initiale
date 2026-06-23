import { getProducts } from "@repo/infra";
import { toProductViewList } from "@repo/presenters";
import type { ProductView, ProductMeta } from "@repo/presenters";
import { useAsyncState } from "@vueuse/core";
import { META_MAP_INJECTION_KEY } from "../app";

export function useProducts() {
  const formattedError = ref<string | undefined>();
  const metaMap = inject<Record<string, ProductMeta> | undefined>(META_MAP_INJECTION_KEY, undefined);

  const { state, isLoading, execute } = useAsyncState<ProductView[]>(
    async () => {
			const { data } = await getProducts();
      return toProductViewList(data, metaMap);
    },
    [],
    {
      immediate: true,
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
