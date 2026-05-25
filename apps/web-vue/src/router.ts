import { createRouter, createWebHashHistory } from 'vue-router'
import ProductsPage from './pages/ProductsPage.vue'
import ButtonDemoPage from './pages/ButtonDemoPage.vue'

const routes = [
  { path: '/', name: 'products', component: ProductsPage },
  { path: '/buttons', name: 'buttons', component: ButtonDemoPage },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
