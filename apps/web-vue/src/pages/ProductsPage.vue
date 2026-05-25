<script setup lang="ts">
// useProducts auto-imported by unplugin-auto-import (from src/composables/)
const { products, loading, error } = useProducts();
</script>

<template>
  <div class="products-page">
    <h1>Products</h1>
    <p v-if="loading">
      Loading...
    </p>
    <p
      v-if="error"
      class="error"
    >
      {{ error }}
    </p>
    <ul v-else>
      <li
        v-for="product in products"
        :key="product.id"
      >
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
