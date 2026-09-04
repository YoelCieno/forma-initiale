import type { Routes } from '@angular/router'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/products-page.component').then((m) => m.ProductsPage),
  },
  {
    path: 'components',
    loadComponent: () =>
      import('./pages/components-page.component').then((m) => m.ComponentsPage),
  },
]
