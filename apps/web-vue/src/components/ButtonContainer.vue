<script setup lang="ts">
import "@repo/ui/fe-button";
import "@repo/ui/fe-card";

function onClickNeutral() {
  alert('Neutral button clicked');
}
</script>

<template>
  <div class="button-container">
    <div>
      <h3 class="h3__subheading">
        Variants
      </h3>
      <fe-card>
        <div class="button-container__row">
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
      <h3 class="h3__subheading">
        Sizes
      </h3>
      <fe-card>
        <div class="button-container__row">
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
      <h3 class="h3__subheading">
        Appearances
      </h3>
      <fe-card>
        <div class="button-container__row">
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
      <h3 class="h3__subheading">
        States
      </h3>
      <fe-card>
        <div class="button-container__row">
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
.button-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.button-container__row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
