<template>
  <nav>
    <RouterLink to="/">
      Products
    </RouterLink>
    <RouterLink to="/components">
      Components
    </RouterLink>
  </nav>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
nav {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1rem;

  a {
    margin-right: 1rem;
    text-decoration: none;
    color: var(--color-text-body);
    &:hover {
      text-decoration: underline;
    }

    &.router-link-exact-active {
      color: var(--brand-fill-loud);
      font-weight: 600;
      text-decoration: underline;
    }
  }
}
main {
  margin: 0 1rem;
}
</style>
