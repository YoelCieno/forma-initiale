<script setup lang="ts">
import "@repo/ui/fe-rating";
import "@repo/ui/fe-card";

</script>

<template>
  <div class="demo-rating">
    <div>
      <h3 class="demo-rating__subheading">
        Basic
      </h3>
      <fe-card>
        <fe-rating />
      </fe-card>
    </div>

    <div>
      <h3 class="demo-rating__subheading">
        With Initial Value
      </h3>
      <fe-card>
        <fe-rating value="3" />
      </fe-card>
    </div>

    <div>
      <h3 class="demo-rating__subheading">
        Readonly
      </h3>
      <fe-card>
        <fe-rating value="4" readonly />
      </fe-card>
    </div>

    <div>
      <h3 class="demo-rating__subheading">
        Disabled
      </h3>
      <fe-card>
        <fe-rating value="2" disabled />
      </fe-card>
    </div>

    <div>
      <h3 class="demo-rating__subheading">
        Different Max
      </h3>
      <fe-card>
        <fe-rating max="3" />
      </fe-card>
    </div>

    <div>
      <h3 class="demo-rating__subheading">
        Half-Star Precision
      </h3>
      <fe-card>
        <fe-rating precision="0.5" value="2.5" />
      </fe-card>
    </div>
    <div class="demo-rating__row--last">
      <h3 class="demo-rating__subheading">
        Sizes
      </h3>
      <fe-card>
        <div class="demo-rating__row--inline">
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
.demo-rating {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 1rem;
}
.demo-rating__row {
  display: flex;
  align-items: center;
}
.demo-rating__row--last {
  grid-column: 1 / -1;
}
.demo-rating__row--inline {
  display: inline;
}

.demo-rating__subheading {
  margin: 0 0 0.25rem;
  font-size: var(--fs-s);
  color: var(--color-text-muted);
  font-weight: bold;
}
</style>
