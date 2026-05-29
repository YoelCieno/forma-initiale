<template>
  <nav>
    <RouterLink to="/">
      Products
    </RouterLink>
    <RouterLink to="/buttons">
      Button Demo
    </RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>

<style scoped>
h1, h2, h3, h4, h5, h6 {
  color: darkslategray;
}
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
      color: darkviolet;
      font-weight: 600;
      text-decoration: underline;
    }
  }
}
</style>
