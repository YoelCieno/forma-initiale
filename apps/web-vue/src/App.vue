<template>
  <main>
    <nav>
      <RouterLink to="/">
        Products
      </RouterLink>
      <RouterLink to="/demo">
        Demo
      </RouterLink>
    </nav>

    <RouterView />
  </main>
</template>

<style scoped>
nav {
  padding: 1rem;
  border-bottom: 1px solid lightgray;
  margin-bottom: 1rem;

  a {
    margin-right: 1rem;
    text-decoration: none;
    color: #333;
    &:hover {
      text-decoration: underline;
    }

    &.router-link-exact-active {
      color: var(--wa-color-brand-fill-loud);
      font-weight: 600;
      text-decoration: underline;
    }
  }
}
</style>
