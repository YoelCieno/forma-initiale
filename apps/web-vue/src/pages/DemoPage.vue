<script setup lang="ts">
import "@repo/ui/fe-button";

function onClickNeutral() {
  alert('Neutral button clicked');
}
</script>

<template>
  <div class="demo-page">
    <h1>Button Demo</h1>

    <section class="demo-page__section">
      <h2 class="demo-page__heading">
        Variants
      </h2>
      <div class="demo-page__buttons">
        <fe-button
          variant="neutral"
          @click="onClickNeutral"
        >
          Neutral
        </fe-button>
        <fe-button variant="brand">
          Brand
        </fe-button>
        <fe-button
          variant="success"
          icon="check"
        >
          Success
        </fe-button>
        <fe-button variant="warning">
          Warning
        </fe-button>
        <fe-button variant="danger">
          Danger
        </fe-button>
      </div>
    </section>

    <section class="demo-page__section">
      <h2 class="demo-page__heading">
        Sizes
      </h2>
      <div class="demo-page__buttons">
        <fe-button size="xs">
          XS
        </fe-button>
        <fe-button size="s">
          S
        </fe-button>
        <fe-button size="m">
          M
        </fe-button>
        <fe-button size="l">
          L
        </fe-button>
        <fe-button size="xl">
          XL
        </fe-button>
      </div>
    </section>

    <section class="demo-page__section">
      <h2 class="demo-page__heading">
        Appearances
      </h2>
      <div class="demo-page__buttons">
        <fe-button appearance="accent">
          Accent
        </fe-button>
        <fe-button appearance="filled">
          Filled
        </fe-button>
        <fe-button appearance="outlined">
          Outlined
        </fe-button>
        <fe-button appearance="plain">
          Plain
        </fe-button>
      </div>
    </section>

    <section class="demo-page__section">
      <h2 class="demo-page__heading">
        States
      </h2>
      <div class="demo-page__buttons">
        <fe-button disabled>
          Disabled
        </fe-button>
        <fe-button loading>
          Loading
        </fe-button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.demo-page {
  padding: 0 1rem;
}
.demo-page__section {
  margin-bottom: 1rem;
}
.demo-page__heading {
  margin-bottom: 0.75rem;
}
.demo-page__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
