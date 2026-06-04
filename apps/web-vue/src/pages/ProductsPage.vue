<script setup lang="ts">
import "@repo/ui/fe-icon";
import "@repo/ui/fe-rating";
import "@repo/ui/fe-card";

const { products, loading, error } = useProducts();
</script>

<template>
  <div class="products-page">
    <h1 class="products-page__title">Free Bundles by Frameworks</h1>

    <p v-if="loading" class="products-page__loading">Loading...</p>
    <template v-else>
      <p v-if="error" class="products-page__error">{{ error }}</p>
      <div v-else class="products-page__grid">
        <fe-card
          v-for="product in products"
          :key="product.name"
          class="products-page__card"
        >
          <fe-icon
            slot="media"
            auto-width
            :name="product.logo"
            :family="product.logoFamily"
            class="products-page__card-icon"
          />
          <h2 slot="header" class="products-page__card-title">
            {{ product.title }}
          </h2>
          <p class="products-page__card-description">
            {{ product.description }}
          </p>
          <div slot="footer" class="products-page__card-footer">
            <fe-rating
              :value="product.rate"
              readonly
              class="products-page__card-rating"
            />
            <div class="products-page__card-pricing">
              <span class="products-page__card-price--previous">${{ product.previousPrice }}</span>
              <strong class="products-page__card-price">Free</strong>
            </div>
          </div>
        </fe-card>
      </div>
    </template>
  </div>
</template>

<style scoped>
.products-page {
  max-width: 75rem;
  margin: 0 auto;
  padding: 0 1rem;
}

.products-page__title {
  font-size: var(--fs-xl);
  margin-bottom: 1.5rem;
}

.products-page__loading,
.products-page__error {
  padding: 1rem;
  text-align: center;
}

.products-page__error {
  color: var(--color-error);
}

.products-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.products-page__card-icon {
  font-size: 4.75rem;
  display: flex;
  place-content: center;
  padding-top: 1.5rem;
}

.products-page__card-title {
  margin: 0;
  font-size: var(--fs-l);
}

.products-page__card-description {
  color: var(--color-text-muted);
  font-size: var(--fs-s);
  margin: 0;
}

.products-page__card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.products-page__card-pricing {
  text-align: right;
}

.products-page__card-price--previous {
  display: block;
  text-decoration: line-through;
  font-size: var(--fs-s);
  color: var(--color-text-muted);
}

.products-page__card-price {
  font-size: var(--fs-m);
  font-weight: 600;
  color: var(--color-success);
}
</style>
