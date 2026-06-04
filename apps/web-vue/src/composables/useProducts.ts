import type { Ref } from "vue";
import type { Product } from "@repo/domain";
import { getProducts } from "@repo/infra";

interface UseProducts {
  products: Ref<Product[]>;
  loading: Ref<boolean>;
  error: Ref<string | undefined>;
  fetch: () => Promise<void>;
}

export function useProducts(): UseProducts {
  const products = ref<Product[]>([]);
  const loading = ref(true);
  const error = ref<string | undefined>();

  async function fetchProducts(): Promise<void> {
    loading.value = true;
    try {
      const { data } = await getProducts();
      products.value = data;
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
