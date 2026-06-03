<script setup lang="ts">
import "@repo/ui/fe-icon";
import "@repo/ui/fe-card";

</script>

<template>
  <div class="demo-icon">
    <div>
      <h3 class="demo-icon__subheading">
        Basic Icons
      </h3>
      <fe-card>
        <div class="demo-icon__row">
          <fe-icon name="check" />
          <fe-icon name="star" />
          <fe-icon name="heart" />
          <fe-icon name="rocket" />
          <fe-icon name="gear" />
        </div>
      </fe-card>
    </div>

    <div>
      <h3 class="demo-icon__subheading">
        Animations
      </h3>
      <fe-card>
        <div class="demo-icon__row">
          <fe-icon name="star" animation="spin" />
          <fe-icon name="star" animation="pulse" />
          <fe-icon name="star" animation="bounce" />
        </div>
      </fe-card>
    </div>

    <div>
      <h3 class="demo-icon__subheading">
        Sizes
      </h3>
      <fe-card>
        <div class="demo-icon__row">
          <fe-icon name="rocket" style="font-size: var(--fs-xs)" />
          <fe-icon name="rocket" style="font-size: var(--fs-s)" />
          <fe-icon name="rocket" style="font-size: var(--fs-m)" />
          <fe-icon name="rocket" style="font-size: var(--fs-l)" />
          <fe-icon name="rocket" style="font-size: var(--fs-xl)" />
        </div>
      </fe-card>
    </div>
  </div>
</template>

<style scoped>
.demo-icon {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 1rem;
}
.demo-icon__row {
  display: flex;
  align-items: center;
  height: 1.5rem;
}
.demo-icon__subheading {
  margin: 0 0 0.25rem;
  font-size: var(--fs-s);
  color: var(--color-text-muted);
  font-weight: bold;
}
</style>
