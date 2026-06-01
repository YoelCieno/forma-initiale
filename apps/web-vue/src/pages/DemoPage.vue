<script setup lang="ts">
import "@repo/ui/fe-button";
import "@repo/ui/fe-icon";
import "@repo/ui/fe-card";

function onClickNeutral() {
  alert('Neutral button clicked');
}
</script>

<template>
  <h1>Components</h1>
  <div class="demo-page__container">
    <section class="demo-page__section">
      <h2 class="demo-page__heading">
        Button
      </h2>

      <h3 class="demo-page__subheading">
        Variants
      </h3>
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

      <h3 class="demo-page__subheading">
        Sizes
      </h3>
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

      <h3 class="demo-page__subheading">
        Appearances
      </h3>
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

      <h3 class="demo-page__subheading">
        States
      </h3>
      <div class="demo-page__buttons">
        <fe-button disabled>
          Disabled
        </fe-button>
        <fe-button loading>
          Loading
        </fe-button>
      </div>
      <br>
      <h2 class="demo-page__heading">
        Icon
      </h2>

      <h3 class="demo-page__subheading">
        Basic Icons
      </h3>
      <div class="demo-page__icons-row">
        <fe-icon name="check" />
        <fe-icon name="star" />
        <fe-icon name="heart" />
        <fe-icon name="rocket" />
        <fe-icon name="gear" />
      </div>

      <h3 class="demo-page__subheading">
        Animations
      </h3>
      <div class="demo-page__icons-row">
        <fe-icon name="star" animation="spin" />
        <fe-icon name="star" animation="pulse" />
        <fe-icon name="star" animation="bounce" />
      </div>

      <h3 class="demo-page__subheading">
        Sizes
      </h3>
      <div class="demo-page__icons-row">
        <fe-icon name="rocket" style="font-size: var(--fs-xs)" />
        <fe-icon name="rocket" style="font-size: var(--fs-s)" />
        <fe-icon name="rocket" style="font-size: var(--fs-m)" />
        <fe-icon name="rocket" style="font-size: var(--fs-l)" />
        <fe-icon name="rocket" style="font-size: var(--fs-xl)" />
      </div>
    </section>

    <section class="demo-page__section">
      <h2 class="demo-page__heading">
        Card
      </h2>

      <h3 class="demo-page__subheading">
        Default
      </h3>
      <fe-card>
        <p>This is a default card. Just body content, no special slots.</p>
      </fe-card>

      <h3 class="demo-page__subheading">
        Appearances
      </h3>
      <div class="demo-page__cards">
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

      <h3 class="demo-page__subheading">
        With Header & Footer
      </h3>
      <fe-card>
        <h4 slot="header">Card Title</h4>
        <p>Main content goes here. This card has a header and footer.</p>
        <fe-icon slot="footer" name="star" />
      </fe-card>

      <h3 class="demo-page__subheading">
        Horizontal
      </h3>
      <fe-card orientation="horizontal">
        <p>Horizontal card with side-by-side layout.</p>
        <fe-icon slot="actions" name="gear" />
      </fe-card>
    </section>
  </div>
</template>

<style scoped>
.demo-page__container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--min-width-layout), 1fr));
  max-width: var(--max-width-layout);
}
.demo-page__buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.demo-page__cards {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  flex-direction: column;
}
.demo-page__section {
  margin: 0 2.175rem 1rem 0;
}
.demo-page__heading {
  margin-bottom: 0.75rem;
}
.demo-page__subheading {
  margin: 1rem 0 0.25rem;
  font-size: var(--fs-s);
  color: var(--color-text-muted);
  font-weight: bold;
}
.demo-page__icons-row {
  align-items: center;
  margin-bottom: 0.5rem;
}
</style>
