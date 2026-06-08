<script setup lang="ts">
import "@repo/ui/fe-icon";
import "@repo/ui/fe-card";

</script>

<template>
  <div class="icon-container">
    <div>
      <h3 class="subheading__h3">
        Basic Icons
      </h3>
      <fe-card>
        <div class="icon-container__row">
          <fe-icon name="check" />
          <fe-icon name="star" />
          <fe-icon name="heart" />
          <fe-icon name="rocket" />
          <fe-icon name="gear" />
        </div>
      </fe-card>
    </div>

    <div>
      <h3 class="subheading__h3">
        Animations
      </h3>
      <fe-card>
        <div class="icon-container__row">
          <fe-icon name="star" animation="spin" />
          <fe-icon name="star" animation="pulse" />
          <fe-icon name="star" animation="bounce" />
        </div>
      </fe-card>
    </div>

    <div>
      <h3 class="subheading__h3">
        Sizes
      </h3>
      <fe-card>
        <div class="icon-container__row">
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
.icon-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 1.5rem;
}
.icon-container__row {
  display: flex;
  align-items: center;
  height: 1.5rem;
}
</style>
