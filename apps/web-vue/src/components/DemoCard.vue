<script setup lang="ts">
import "@repo/ui/fe-card";
import "@repo/ui/fe-icon";
</script>

<template>
  <div class="demo-card">
    <div>
      <h3 class="demo-card__subheading">
        Default
      </h3>
      <fe-card>
        <p>This is a default card. Just body content, no special slots.</p>
      </fe-card>
    </div>

    <div>
      <h3 class="demo-card__subheading">
        Appearances
      </h3>
      <div class="demo-card__wrapper">
        <fe-card appearance="outlined">
          <p>Outlined (default)</p>
        </fe-card>
        <fe-card appearance="filled">
          <p>Filled</p>
        </fe-card>
        <fe-card appearance="accent">
          <p>Accent</p>
        </fe-card>
      </div>
    </div>

    <div>
      <h3 class="demo-card__subheading">
        With Header & Footer
      </h3>
      <fe-card>
        <h4 slot="header">Card Title</h4>
        <p>Main content goes here. This card has a header and footer.</p>
        <fe-icon slot="footer" name="star" />
      </fe-card>
    </div>

    <div>
      <h3 class="demo-card__subheading">
        Horizontal
      </h3>
      <fe-card orientation="horizontal">
        <p>Horizontal card with side-by-side layout.</p>
        <fe-icon slot="actions" name="gear" />
      </fe-card>
    </div>
  </div>
</template>

<style scoped>
.demo-card {
  display: grid;
  gap: 1rem;
}
.demo-card__wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  flex-direction: column;
}
.demo-card__subheading {
  margin: 0 0 0.25rem;
  font-size: var(--fs-s);
  color: var(--color-text-muted);
  font-weight: bold;
}
</style>
