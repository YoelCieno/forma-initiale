<script setup lang="ts">
import "@repo/ui/fe-rating";
import "@repo/ui/fe-card";
</script>

<template>
  <div class="rating-container">
    <div>
      <h3 class="subheading__h3">
        Basic
      </h3>
      <fe-card>
        <fe-rating />
      </fe-card>
    </div>

    <div>
      <h3 class="subheading__h3">
        With Initial Value
      </h3>
      <fe-card>
        <fe-rating value="3" />
      </fe-card>
    </div>

    <div>
      <h3 class="subheading__h3">
        Readonly
      </h3>
      <fe-card>
        <fe-rating value="4" readonly />
      </fe-card>
    </div>

    <div>
      <h3 class="subheading__h3">
        Disabled
      </h3>
      <fe-card>
        <fe-rating value="2" disabled />
      </fe-card>
    </div>

    <div>
      <h3 class="subheading__h3">
        Different Max
      </h3>
      <fe-card>
        <fe-rating max="3" />
      </fe-card>
    </div>

    <div>
      <h3 class="subheading__h3">
        Half-Star Precision
      </h3>
      <fe-card>
        <fe-rating precision="0.5" value="2.5" />
      </fe-card>
    </div>
    <div class="rating-container__row">
      <h3 class="subheading__h3">
        Sizes
      </h3>
      <fe-card>
        <div class="rating-container__row--inline">
          <fe-rating size="xs" value="3" />
          <fe-rating size="s" value="3" />
          <fe-rating size="m" value="3" />
          <fe-rating size="l" value="3" />
          <fe-rating size="xl" value="3" />
        </div>
      </fe-card>
    </div>
  </div>
</template>

<style scoped>
.rating-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10.75rem, 1fr));
  gap: 1.5rem;
}
.rating-container__row {
  grid-column: 1 / -1;
}
.rating-container__row--inline {
  display: inline;
}
</style>
