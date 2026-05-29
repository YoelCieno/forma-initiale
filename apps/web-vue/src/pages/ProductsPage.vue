<script setup lang="ts">
// useProducts auto-imported by unplugin-auto-import (from src/composables/)
const { products, loading, error } = useProducts();
</script>

<template>
  <div class="products-page">
    <h1>Your list</h1>
    <p v-if="loading">
      Loading...
    </p>
    <p
      v-if="error"
      class="error"
    >
      {{ error }}
    </p>
    <ul
      v-else
      class="product-list"
    >
      <li
        v-for="product in products"
        :key="product.id"
        class="product-card"
      >
        {{ product.title }} — ${{ product.price }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.products-page {
  margin: 0 auto;
  padding: 0 1rem;
}
.product-list {
  list-style: none;
  color: slategrey;
}
.product-card {
  max-width: 25rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin:  0 0 0.5rem 0;
  line-height: normal;
}
.error {
  color: #e53e3e;
}
</style>
