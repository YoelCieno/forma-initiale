import { createRouter, createWebHashHistory } from 'vue-router'
import ProductsPage from './pages/ProductsPage.vue'

const routes = [
  { path: '/', name: 'products', component: ProductsPage },
  // route level code-splitting
  // this generates a separate chunk (About.[hash].js) for this route
  // which is lazy-loaded when the route is visited.
  {
    path: '/components',
    name: 'components',
    component: () => import('./pages/ComponentsPage.vue'),
  },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
