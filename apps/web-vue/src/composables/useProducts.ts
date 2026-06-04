import type { Ref } from "vue";
import { getProducts } from "@repo/infra";
import { toProductViewList } from "../presenters/product.presenter";
import type { ProductView } from "../presenters/product.presenter";

interface UseProducts {
  products: Ref<ProductView[]>;
  loading: Ref<boolean>;
  error: Ref<string | undefined>;
  fetch: () => Promise<void>;
}

export function useProducts(): UseProducts {
  const products = ref<ProductView[]>([]);
  const loading = ref(true);
  const error = ref<string | undefined>();

  async function fetchProducts(): Promise<void> {
    loading.value = true;
    try {
      const { data } = await getProducts();
      products.value = toProductViewList(data);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load products";
    } finally {
      loading.value = false;
    }
  }

  onBeforeMount(() => {
    fetchProducts();
  });

  return { products, loading, error, fetch: fetchProducts };
}
