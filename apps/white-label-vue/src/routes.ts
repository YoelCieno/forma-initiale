import type { RouteRecordRaw } from 'vue-router'
import ProductsPage from './pages/ProductsPage.vue'

export const routes: RouteRecordRaw[] = [
  { path: '/', name: 'products', component: ProductsPage },
  {
    path: '/components',
    name: 'components',
    component: () => import('./pages/ComponentsPage.vue'),
  },
]
