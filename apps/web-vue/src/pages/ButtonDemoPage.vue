<script setup lang="ts">
import "@repo/ui/fe-button";

function onClickNeutral() {
  alert('Neutral button clicked');
}
</script>

<template>
  <div class="button-demo-page">
    <h1>Button Demo</h1>

    <section>
      <h2>Variants</h2>
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
    </section>

    <section>
      <h2>Sizes</h2>
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
    </section>

    <section>
      <h2>Appearances</h2>
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
    </section>

    <section>
      <h2>States</h2>
      <fe-button disabled>
        Disabled
      </fe-button>
      <fe-button loading>
        Loading
      </fe-button>
    </section>
  </div>
</template>

<style scoped>
.button-demo-page {
  padding: 0 1rem;

  section {
    margin-bottom: 1rem;
  }

  fe-button {
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;
  }
}
</style>
