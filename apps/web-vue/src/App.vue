<script setup lang="ts">
</script>

<template>
  <div>
    <nav>
      <a href="#/">Products</a>
      <a href="#/buttons">Button Demo</a>
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
}
nav a {
  margin-right: 1rem;
  text-decoration: none;
  color: #333;
}
nav a:hover {
  text-decoration: underline;
}
</style>
