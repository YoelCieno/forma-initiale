import { getProducts } from "@repo/infra";
import { toProductViewList } from "../presenters/product.presenter";
import type { ProductView } from "../presenters/product.presenter";
import { useAsyncState } from "@vueuse/core";

export function useProducts() {
  const formattedError = ref<string | undefined>();

  const { state, isLoading, execute } = useAsyncState<ProductView[]>(
    async () => {
			const { data } = await getProducts();
      return toProductViewList(data);
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
