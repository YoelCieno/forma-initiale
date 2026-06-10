<script setup lang="ts">
import "@repo/ui/fe-card"
import "@repo/ui/fe-icon"
import "@repo/ui/fe-rating"
import { ProductView } from "../presenters/product.presenter";

withDefaults(defineProps<Omit<ProductView, 'name'>>(), {
  previousPrice: undefined,
  price: 'Free',
})
</script>

<template>
  <fe-card class="product-card">
    <fe-icon
      slot="media"
      :name="logo"
      :family="logoFamily"
      class="product-card__icon"
    />
    <h2 slot="header" class="product-card__title">{{ title }}</h2>
    <p class="product-card__description">{{ description }}</p>
    <div slot="footer" class="product-card__footer">
      <fe-rating
        :value="rate"
        readonly
        class="product-card__rating"
      />
      <div class="product-card__pricing">
        <span
          v-if="previousPrice"
          class="product-card__price--previous"
        >{{ previousPrice }}</span>
        <strong class="product-card__price">{{ price }}</strong>
      </div>
    </div>
  </fe-card>
</template>

<style scoped>
.product-card {
  display: grid;
}
.product-card__icon {
  font-size: 4.75rem;
  display: flex;
  place-content: center;
  padding-top: 1.5rem;
}
.product-card__title {
  margin: 0;
  font-size: var(--fs-l);
}
.product-card__description {
  color: var(--color-text-muted);
  font-size: var(--fs-s);
  margin: 0;
  min-height: 2.7rem;
}
.product-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.product-card__pricing {
  text-align: right;
}
.product-card__price {
  font-size: var(--fs-m);
  font-weight: 600;
}
.product-card__price--previous {
  display: block;
  text-decoration: line-through;
  font-size: var(--fs-s);
  color: var(--color-text-muted);
}
</style>
