import '@repo/ui/styles/main.css'
import '@repo/ui/styles/themes/default.css'
import './styles'
import { createWhiteLabelApp } from 'white-label-vue/app'
import { mirrorTenantMap } from '@repo/infra'

createWhiteLabelApp({
  extendRoutes: [
    // Add tenant-specific routes here:
    // {
    //   path: '/about',
    //   name: 'about',
    //   component: () => import('./pages/AboutPage.vue'),
    // },
  ],
  // omitRoutePaths: ['/components'],
  // For full route override (advanced), use `routes` instead:
  // routes: [...],
  metaMap: mirrorTenantMap,
}).then(({ app }) => {
  app.mount('#app')
})
