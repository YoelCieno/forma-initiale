import { createRouter, createWebHashHistory } from 'vue-router'
import ProductsPage from './pages/ProductsPage.vue'
import DemoPage from './pages/DemoPage.vue'

const routes = [
  { path: '/', name: 'products', component: ProductsPage },
  { path: '/demo', name: 'demo', component: DemoPage },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
