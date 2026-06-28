import '@repo/ui/styles'
import '@repo/ui/styles/themes/default'
import 'white-label-vue/src/styles'
import { createWhiteLabelApp } from 'white-label-vue/app'
import { plantsMap } from '../metadata'
import './styles'

createWhiteLabelApp({
  routes: [
    { path: '/', name: 'products', component: () => import('white-label-vue/src/pages/ProductsPage.vue') },
    { path: '/about', name: 'about', component: () => import('./pages/AboutPage.vue') },
  ],
  appShell: () => import('./App.vue'),
  metaMap: plantsMap,
}).then(({ app }) => {
  app.mount('#app')
})
