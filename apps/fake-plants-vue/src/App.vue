<template>
  <nav class="fp-nav">
    <RouterLink to="/">Products</RouterLink>
    <RouterLink to="/about">About</RouterLink>
  </nav>

  <main>
    <RouterView />
  </main>
</template>

<style scoped>
.fp-nav {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1rem;
}
.fp-nav a {
  margin-right: 1rem;
  text-decoration: none;
  color: var(--color-text-body);
}
.fp-nav a:hover {
  text-decoration: underline;
}
.fp-nav a.router-link-exact-active {
  color: var(--brand-fill-loud);
  font-weight: 600;
  text-decoration: underline;
}
main {
  margin: 0 1rem;
}
</style>
