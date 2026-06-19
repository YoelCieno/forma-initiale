import '@repo/ui/styles'
import '@repo/ui/styles/themes/default'
import { createWhiteLabelApp } from 'white-label-vue/app'

createWhiteLabelApp({
  routes: [
    { path: '/', name: 'products', component: () => import('white-label-vue/src/pages/ProductsPage.vue') },
    { path: '/about', name: 'about', component: () => import('./pages/AboutPage.vue') },
  ],
  appShell: () => import('./App.vue'),
}).then(({ app }) => {
  app.mount('#app')
})
