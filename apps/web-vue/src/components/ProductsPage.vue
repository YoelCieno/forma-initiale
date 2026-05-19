<script setup lang="ts">
// ref, onMounted auto-imported by unplugin-auto-import
import type { Product } from "@repo/domain";
import { GetProductsAdapter } from "@repo/infra";

const products = ref<Product[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const adapter = new GetProductsAdapter();

onMounted(async () => {
  try {
    products.value = await adapter.execute();
  } catch (e) {
    error.value = e instanceof Error ? e.message : "Failed to load products";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="products-page">
    <h1>Products</h1>
    <p v-if="loading">Loading...</p>
    <p v-if="error" class="error">{{ error }}</p>
    <ul v-else>
      <li v-for="product in products" :key="product.id">
        {{ product.title }} — ${{ product.price }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.products-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem;
}
.error {
  color: #e53e3e;
}
</style>
