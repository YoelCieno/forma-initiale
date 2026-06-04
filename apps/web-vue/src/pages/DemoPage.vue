<script setup lang="ts">

</script>
<template>
  <div class="demo-page">
    <section class="demo-page__section">
      <h2 class="demo-page__heading">
        Button
      </h2>
      <DemoButton />

      <section class="demo-page__subsection">
        <h2 class="demo-page__heading">
          Icon
        </h2>
        <DemoIcon />
      </section>
      <section class="demo-page__subsection">
        <h2 class="demo-page__heading">
          Rating
        </h2>
        <DemoRating />
      </section>
    </section>

    <section class="demo-page__section">
      <h2 class="demo-page__heading">
        Card
      </h2>
      <DemoCard />
    </section>
  </div>
</template>

<style scoped>
.demo-page {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--min-width-layout), 1fr));
  max-width: var(--max-width-layout);
  margin: 0 auto;
}
.demo-page__section {
  margin: 0 2.175rem 1rem 0;
}
.demo-page__subsection {
  margin-top: 2rem;
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
</style>
