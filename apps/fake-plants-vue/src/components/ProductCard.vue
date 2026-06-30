<script setup lang="ts">
import "@repo/ui/fe-card"
import "@repo/ui/fe-rating"
import type { ProductView } from "@repo/presenters";

withDefaults(defineProps<Omit<ProductView, 'name'>>(), {
  price: 'Free',
})
</script>

<template>
  <fe-card class="fp-product-card">
    <img
      slot="media"
      class="fp-product-card__image"
      :src="`https://loremflickr.com/700/450/plant/all?random=${Math.random()}`"
      :alt="title"
    >
    <header slot="header" class="fp-product-card__header">
      <h2 class="fp-product-card__title">{{ title }}</h2>
      <strong class="fp-product-card__price">{{ price }}</strong>
    </header>
    <p class="fp-product-card__description">{{ description }}</p>
    <div slot="footer" class="fp-product-card__footer">
      <fe-rating
        :value="rate"
        readonly
        class="fp-product-card__rating"
      />
    </div>
  </fe-card>
</template>

<style scoped>
.fp-product-card__image {
  width: 100%;
  height: 180px;
  object-fit: cover;
}
.fp-product-card__title {
  margin: 0;
  font-size: var(--fs-xl);
  line-height: 1.5rem;
  word-spacing: 100vw;
}
.fp-product-card__header {
  display: flex;
  justify-content: space-between;
  align-self: center;
  min-height: 50px;
}
.fp-product-card__description {
  color: var(--color-text-muted);
  font-size: var(--fs-s);
  margin: 0;
  min-height: 2.7rem;
}
.fp-product-card__footer {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}
</style>
