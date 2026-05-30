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
      class="products-page__error"
    >
      {{ error }}
    </p>
    <ul
      v-else
      class="products-page__list"
    >
      <li
        v-for="product in products"
        :key="product.id"
        class="products-page__card"
      >
        <span class="products-page__card-title">{{ product.title }}</span>
        <span class="products-page__card-price">${{ product.price }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.products-page {
  margin: 0 auto;
  padding: 0 1rem;
}
.products-page__list {
  list-style: none;
  color: slategrey;
}
.products-page__card {
  max-width: 25rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1rem;
  margin:  0 0 0.5rem 0;
  line-height: normal;
}
.products-page__card-title {
  display: block;
  font-weight: 600;
}
.products-page__card-price {
  display: block;
  font-size: 0.875rem;
  color: #666;
}
.products-page__error {
  color: #e53e3e;
}
</style>
