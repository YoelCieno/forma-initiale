<script setup lang="ts">
</script>

<template>
  <div>
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
  </div>
</template>

<style scoped>
nav {
  padding: 1rem;
  border-bottom: 1px solid #ccc;
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
