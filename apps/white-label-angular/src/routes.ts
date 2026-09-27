import { Routes } from '@angular/router'
import { ProductsPage } from './pages/products-page.component'

export const routes: Routes = [
  { path: '', component: ProductsPage },
  {
    path: 'components',
    loadComponent: () => import('./pages/components-page.component').then(m => m.ComponentsPage),
  },
]
