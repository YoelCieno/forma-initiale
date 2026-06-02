<script setup lang="ts">
import "@repo/ui/fe-button";
import "@repo/ui/fe-card";

function onClickNeutral() {
  alert('Neutral button clicked');
}
</script>

<template>
  <div class="demo-button">
    <div>
      <h3 class="demo-button__subheading">
        Variants
      </h3>
      <fe-card>
        <div class="demo-button__wrapper">
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
      </fe-card>
    </div>

    <div>
      <h3 class="demo-button__subheading">
        Sizes
      </h3>
      <fe-card>
        <div class="demo-button__wrapper">
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
      </fe-card>
    </div>

    <div>
      <h3 class="demo-button__subheading">
        Appearances
      </h3>
      <fe-card>
        <div class="demo-button__wrapper">
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
      </fe-card>
    </div>

    <div>
      <h3 class="demo-button__subheading">
        States
      </h3>
      <fe-card>
        <div class="demo-button__wrapper">
          <fe-button disabled>
            Disabled
          </fe-button>
          <fe-button loading>
            Loading
          </fe-button>
        </div>
      </fe-card>
    </div>
  </div>
</template>

<style scoped>
.demo-button {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.demo-button__wrapper {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.demo-button__subheading {
  margin: 0 0 0.25rem;
  font-size: var(--fs-s);
  color: var(--color-text-muted);
  font-weight: bold;
}
</style>
