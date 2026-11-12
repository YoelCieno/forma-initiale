<script setup lang="ts">
import "@repo/ui/fe-async-content";
import "@repo/ui/fe-loader";

const { products, loading, error } = useProducts();
</script>

<template>
  <div class="products-page">
    <fe-loader slot="loading" :loading />
    <h1 class="products-page__title">List of Products</h1>
    <fe-async-content :loading :error>
      <p slot="error" class="products-page__error">{{ error }}</p>
      <div class="products-page__grid">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          v-bind="product"
        />
      </div>
    </fe-async-content>
  </div>
</template>

<style scoped>
.products-page {
  max-width: 75rem;
  margin: 0 auto;
  padding: 0 1rem 1rem;
}
.products-page__title {
  font-size: var(--fs-xl);
  margin: 1rem 0;
}
.products-page__error {
  padding: 1rem;
  text-align: center;
  color: var(--color-error);
}
.products-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}
</style>
