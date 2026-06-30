import '@repo/ui/styles'
import '@repo/ui/styles/themes/default'
import 'white-label-vue/src/styles'
import { createWhiteLabelApp } from 'white-label-vue/app'
import { plantsMap } from '../metadata'
import './styles'

createWhiteLabelApp({
  extendRoutes: [
    {
      path: '/about',
      name: 'about',
      component: () => import('./pages/AboutPage.vue'),
    },
  ],
  omitRoutePaths: ['/components'],
  appShell: () => import('./App.vue'),
  metaMap: plantsMap,
}).then(({ app }) => {
  app.mount('#app')
})
