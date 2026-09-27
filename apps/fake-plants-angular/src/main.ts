import { bootstrapApplication } from '@angular/platform-browser'
import { createWhiteLabelApp } from 'white-label-angular/app'

const { root, config } = await createWhiteLabelApp({
  extendRoutes: [
    {
      path: 'about',
      loadComponent: () => import('./pages/about-page.component').then((m) => m.AboutPage),
    },
  ],
  // Angular route paths are slash-less ('components', not '/components') —
  // mergeRoutes filters by exact route.path match, a leading slash silently no-ops.
  omitRoutePaths: ['components'],
})
bootstrapApplication(root, config).catch((err) => console.error(err))
