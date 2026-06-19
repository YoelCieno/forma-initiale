<script setup lang="ts">
import "@repo/ui/fe-card"
import "@repo/ui/fe-rating"
import type { ProductView } from "@repo/presenters";

withDefaults(defineProps<Omit<ProductView, 'name'>>(), {
  previousPrice: undefined,
  price: 'Free',
})
</script>

<template>
  <fe-card class="fp-product-card">
    <img
      slot="media"
      class="fp-product-card__image"
      :src="`https://loremflickr.com/700/450/plant,fake/all?random=${Math.random()}`"
      :alt="title"
    >
    <h2 slot="header" class="fp-product-card__title">{{ title }}</h2>
    <p class="fp-product-card__description">{{ description }}</p>
    <div slot="footer" class="fp-product-card__footer">
      <fe-rating
        :value="rate"
        readonly
        class="fp-product-card__rating"
      />
      <div class="fp-product-card__pricing">
        <span
          v-if="previousPrice"
          class="fp-product-card__price--previous"
        >{{ previousPrice }}</span>
        <strong class="fp-product-card__price">{{ price }}</strong>
      </div>
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
  font-size: var(--fs-l);
}
.fp-product-card__description {
  color: var(--color-text-muted);
  font-size: var(--fs-s);
  margin: 0;
  min-height: 2.7rem;
}
.fp-product-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.fp-product-card__pricing {
  text-align: right;
}
.fp-product-card__price {
  font-size: var(--fs-m);
  font-weight: 600;
}
.fp-product-card__price--previous {
  display: block;
  text-decoration: line-through;
  font-size: var(--fs-s);
  color: var(--color-text-muted);
}
</style>
