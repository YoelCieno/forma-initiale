<template>
  <div class="components-page">
    <section class="components-page__section">
      <h2 class="components-page__heading">
        Button
      </h2>
      <ButtonContainer />

      <section class="components-page__subsection">
        <h2 class="components-page__heading">
          Icon
        </h2>
        <IconContainer />
      </section>
      <section class="components-page__subsection">
        <h2 class="components-page__heading">
          Rating
        </h2>
        <RatingContainer />
      </section>
    </section>

    <section class="components-page__section">
      <h2 class="components-page__heading">
        Card
      </h2>
      <CardContainer />
    </section>
  </div>
</template>

<style scoped>
.components-page {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--min-width-layout), 1fr));
  column-gap: 2.25rem;
  max-width: var(--max-width-layout);
  margin: 0 auto;
  padding-bottom: 1.75rem;
}
.components-page__subsection {
  margin-top: 2rem;
}
.components-page__heading {
  margin-bottom: 0.75rem;
}
</style>
